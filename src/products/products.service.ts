import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { Product , ProductImage} from './entities';
import { validate as isUUID } from "uuid";
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  // crear una propiedad dentro de la clase
  private readonly logger = new Logger('ProductsService');

  // instanciar la entidad Product correcta para usar la bd
  constructor(
    // para injectar nuestra entidad y si hay otros repositorios lo injectamos de esta manera
    @InjectRepository(Product) //Repositori manejara el repositorio de nuestro producto
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource, //data source sabe la cadenadeconexion que estoy usando , sabe el usuario tiene la misma conf de nuestro Repository
  ){}

  async create(createProductDto: CreateProductDto, user: User) {
      try {
        // productDetail : tendra todas las propiedades excepto las imagenes
        const {images=[] , ...productDetails} = createProductDto;

        // la primera es arreglo de objetos que luscan como la entidad , la segunda es como un elemento independiente no como un arreglo 
        const product = this.productRepository.create({
          ...productDetails,
          //estas creando instancias de productImages que se encuentran dentro de product
          // Y cuando grabe product, sera el id que le puse a cada uno de estas images
          images: images.map(image => this.productImageRepository.create({url: image})),
          user: user
        }) //el Dto porque es algo que luce como la entidad

        // Guardamos bd como las imagenes 
        await this.productRepository.save(product);
        
        return {...product, images};

      } catch (error) {
        this.handleDBExceptions(error);
      }
  }
  // TODO : paginar
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10 , offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      // para crear la columna de produc que relaciona con las imagenes
      relations: {
        images: true, //asi se llama la relacion 
      }
    })
    // map ayuda a transformar un arreglo en otra cosa
    return products.map((product) => ({ //porque voy a regresar un objeto implicito
      ...product,
      images: product.images.map(img => img.url)
    }) )
  }

  async findOne(term: string) {
    let product:Product;

    if(isUUID(term)){
      product = await this.productRepository.findOneBy({id : term});
    }else{
      // queryBuilder : sabe todo de la base de datos
      const queryBuilder = this.productRepository.createQueryBuilder('prod') //le ponemos el alias a la tabla producto :"prod"
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug',{
          //estos son el parametro para el where
          title: term.toUpperCase(), 
          slug: term.toLowerCase(),
        })//prod.images el punto en que queremos hacer el left join , alias prodImages
        .leftJoinAndSelect('prod.images','prodImages')
        .getOne(); //Solo le interesa uno de ellos

    }


    if(!product) 
      throw new NotFoundException(`Product with  ${term} not found`);

    return product
  }

  async findOnePlain (term : string) {
    const {images = [] , ...rest} = await this.findOne(term)
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }


  async update(id: string, updateProductDto: UpdateProductDto,user: User) {
    // toUpdate : la data que va a actualizar sin las imagenes 
    const  {images , ...toUpdate} = updateProductDto;

    const product = await this.productRepository.preload({
      id, //busca un producto por el id 
      ...toUpdate, //y cambiamos las propiedades del encontrado por lo que le enviamos
    });
 
    if(!product) throw new NotFoundException(`Product with id: ${id} not found`);

    // Evaluar si hay imagenes - y borrarla de manera controlada porque las imagenes que ingresan son las que remplazaran las existenetes
    const queryRunner = this.dataSource.createQueryRunner(); //EL RUNNER EJECUTA MUCHAS CONSULTAS QUERY y si uno falla manda un mensaje y no sigue con los dos
    await queryRunner.connect(); //lo conectamos a la bd
    await queryRunner.startTransaction();

    try {
      // quiero borrar todas las imagenes previas e insertar las nuevas
      if(images){
        // borrar todos los ProductImage cuya columna productId sea igual al id
        await queryRunner.manager.delete(ProductImage, {product: {id:id}} )
        // aqui tenemos nuevas imagenes que quiere ser sobrescritas -lo inserto
        product.images = images.map( 
          image => this.productImageRepository.create({url: image})
        )
      }

      product.user = user; //para que le agrege el usuario

      // queryRunner.manager : no impacta a la base de datos todavia
      await queryRunner.manager.save(product);
      // await this.productRepository.save(product);

      await queryRunner.commitTransaction(); //una ves que realizo el commit 
      await queryRunner.release();//y ya no necesito mas el query runner
      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction() //cuando falla cualquiera de los dos
      await queryRunner.release()
      this.handleDBExceptions(error);
    }
 

  }

  async remove(id: string) {

    const product = await this.findOne(id)
    await this.productRepository.remove(product)
  }

  private handleDBExceptions(error: any){
      if(error.code === '23505')
        throw new BadRequestException(error.detail);
      this.logger.error(error)
      throw new InternalServerErrorException('Unexpected error, check server log')
  }
// Esto es para el send - algo que es la primera ves en produccion - o solo usar en desarrollo
  async deleteAllProducts() {
    
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete() //eliminacion de toda lo que tengo dentro de la tabla product
      .where({})
      .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

}
