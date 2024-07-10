import { BeforeInsert, BeforeUpdate, 
        Column, Entity, OneToMany,  PrimaryGeneratedColumn } from "typeorm";

import { Product } from "../../products/entities";


@Entity('users')
export class User {



    @PrimaryGeneratedColumn('uuid') //para que se incremente con uuid
    id: string; 

    @Column('text',{
        unique : true
    })
    email : string;

    @Column('text',{
        select : false //cuando se realize un findOneBy no aparecera la contra en el json de respuesta 
    })
    password : string;

    @Column('text')
    fullName : string;

    @Column('bool',{
        default : true
    })
    isActive : boolean; //Yo no voy a eliminar fisicamente de la base de datos

    @Column('text',{
        array : true,
        default : ['user']
    })
    roles : string[];

    @OneToMany(
        () => Product,// el objeto de la otra entidad - para relacionar 
        (product) => product.user //el forenkey
    )
    product: Product

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim()
    }
    @BeforeUpdate()
    checkFieldsBeforeUpdate(){ //en caso de actualizar
        this.checkFieldsBeforeInsert();
    }
    

}
