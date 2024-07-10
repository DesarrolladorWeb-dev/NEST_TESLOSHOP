import { BeforeInsert, BeforeUpdate, Column, Entity, 
        ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "../../auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

// ES IMPORTANTE QUE SEAN CLASES PORQUE NO SE PONDRIAN LOS DECORADORES
@Entity({ name : 'products'})
export class Product {
    
    @ApiProperty({
        example : '07470490-e1b3-4f7d-8994-def5511348ad',
        description : 'Product Id',
        uniqueItems : true
    })
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @ApiProperty({
        example : 'T-Shirt Teslo',
        description : 'Product Title',
        uniqueItems : true
    })
    @Column('text',{//no todos los tipos son soportados por postgre
        unique: true
    }) 
    title:string;

    @ApiProperty({
        example : 0,
        description : 'Product Price',
        
    })
    @Column('float',{ //el number no es soportado por postgre
        default: 0 //para el valor por defecto
    })
    price : number;

    @ApiProperty({
        example : '(descripcion)',
        description : 'Product description ',
        default :null,
    })
    @Column({
        type: 'text', //es otra forma de hacerlo
        nullable: true //acepta null 
    })
    description : string;

    @ApiProperty({ 
        example : 'T_Shirt_Teslo',
        description : 'Product SLUG - for SEO ',
        default :null,
    })
    @Column('text',{//para saber el producto con esa url
        unique: true
    }) 
    slug: string

    @ApiProperty({ 
        example : 10,
        description : 'Product Stock ',
        default :0,
    })
    @Column('int', {
        default : 0
    })
    stock: number;

    @ApiProperty({ 
        example : ['M','XL','XXL'],
        description : 'Product sizes ',
    })
    @Column('text',{ 
        array: true //ahora es un arreglo de strings , postgres lo maneja
    })
    sizes: string[] //es un arreglo de strings


    @ApiProperty({ 
        example : 'women',
        description : 'Product gender ',
    })
    @Column('text')  
    gender:string; //hombre, mujer ,niño y unisex

    @ApiProperty()
    @Column('text',{
        array : true,
        default: [] //por default sera un array vacio
    })
    tags : string[];

    // Images - lo relacionamos con otra tabla
    @ApiProperty()
    @OneToMany(
        () => ProductImage,  //vamos a retornar un productImage
        (ProductImage) => ProductImage.product,//como se relaciona productImage con nuestra tabla
        {cascade : true, eager: true} //esto nos ayudara a eliminar imagenes asociadas al producto
    ) //para tener muchas imagenes 
    images?: ProductImage[]; //es array porque es una coleccion de iamgenes

    @ManyToOne(
        () => User,
        (user) => user.product, //con esta linea el usuario se relaciona con la tabla
        {eager : true } //para cada consulta que se realize el producto : carge automaticamente esta relacion para saber que usuario creo el producto
    )
    user: User 

    @BeforeInsert() //Se ejecutara antes de enviarlo a la bd
    checkSlugInsert(){
        if(!this.slug){ //si no existe en el json del enpoint
            this.slug = this.title
        }
        this.slug = this.slug //aqui ya tendra el valor del titulo
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }

    @BeforeUpdate() //Antes de actualizar
    checkSlugUpdate(){
        // voy a tener siempre el slug porque es obligatorio
        this.slug = this.slug //aqui ya tendra el valor del titulo
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'",'')
    }
}
