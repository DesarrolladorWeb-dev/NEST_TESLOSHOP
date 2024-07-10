import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import { Product } from './entities';

@ApiTags('Products')
@Controller('products')
// @Auth() //Cualquiera de estas Rutas debe estar Autenticado
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}


  @Post()
  @Auth()
  @ApiResponse({status: 201 , description : 'Product was created', type: Product }) //nuestra entidad regresara
  @ApiResponse({status: 400 , description : 'Bad Request ' })
  @ApiResponse({status: 403 , description : 'Forbidden . Token related.' })
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user:User,
  ) { //le enviamos el usuario para que en el json aparesca quien creo el producto
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDto : PaginationDto) {
    // console.log(paginationDto)
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user:User,
  ) {
    return this.productsService.update(id, updateProductDto,user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
