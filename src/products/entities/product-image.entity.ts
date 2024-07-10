import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import { Product } from './';

@Entity({name: 'product_images'})
export class ProductImage{
    @PrimaryGeneratedColumn() //incrementa automaticamente
    id: number;

    @Column('text')
    url:string;  // el url es obligatorio
    @ManyToOne( //muchas imagens un producto
        () => Product, 
        // nota : image de product entiti tiene este tipo (ProductImage[])
        (product) => product.images, //este product se relacionara con nuestra tabla ProductImage con Product
        {onDelete: 'CASCADE' }//cuando se elimina se elimanan las imagenes en cascada

    ) 
    product: Product
}