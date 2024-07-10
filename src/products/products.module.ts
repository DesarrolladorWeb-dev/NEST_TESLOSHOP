import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

// Las entidades para que se Cree La Tabla en la base de datos
import { Product, ProductImage } from './entities';


@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports:[
    TypeOrmModule.forFeature([Product, ProductImage]), //no es forRoot : solo es uno
    AuthModule,
  ],
  exports: [
    ProductsService,
    TypeOrmModule,
  ]
})
export class ProductsModule {}
