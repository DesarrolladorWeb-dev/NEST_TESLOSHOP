// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger'; //Solo hacer esto en esta ocasion cuando hay  2 Dto
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
