import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class SeedService {
  constructor(
    private readonly productsService : ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User> //para usar el usuario de bd
  ){}

    async runSeed() {
      await this.deleteTables();
      const adminUser = await this.insertUsers();
      await this.insertNewProducts(adminUser);
      return 'SEED EXECUTE'
    }

    private async deleteTables () {
      await this.productsService.deleteAllProducts();
      const queryBuilder =this.userRepository.createQueryBuilder()
        .delete()
        .where({})
        .execute()
    }

    private async insertUsers(){
      const seedUsers = initialData.users;

      const users:User[] = [] 

      seedUsers.forEach(user => {
        users.push(this.userRepository.create(user))
      })

     const dbUsers =  await this.userRepository.save(seedUsers)

      return dbUsers[0] //Crea el objeto con los id Correctos

    }

    private async insertNewProducts(user:User){
      await this.productsService.deleteAllProducts();

      const products = initialData.products; //tenemos la estructura de product

      const insertPromises = [] ;
      products.forEach(product => {
        // espera a que todas estas promesas e resuelvan
        insertPromises.push(this.productsService.create(product,user));
      })
      // tendremos los valores de cada uno de las promesas resuelva
      await Promise.all(insertPromises);
      return true;
    }

}


