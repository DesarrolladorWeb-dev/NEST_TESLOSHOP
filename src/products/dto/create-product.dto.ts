import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, 
        IsPositive, IsString, MinLength } from "class-validator";

// El Dto valida la respuesta que le manda el enpoint (URL) 
export class CreateProductDto {

    //Yo estoy esperando me mande esto :
    @ApiProperty({
        description : 'Product title (unique)',
        nullable:false, //no puede ir vacio
        minLength: 1 
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;
    
    @ApiProperty()
    @IsString()
    @IsOptional()
    slug?:string;
    
    @ApiProperty()
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty()
    @IsString({each:true}) //cada uno de elementos debe cumplir que sean un string
    @IsArray()
    sizes: string[];

    @ApiProperty()
    @IsIn(['men','women','kid','unisex']) //si no vienen estos valores no lo voy a permitir
    gender : string;

    @ApiProperty()
    @IsString({each : true})
    @IsArray()
    @IsOptional() //porque si no lo manda sera un arreglo vacio
    tags: string[];

    @ApiProperty()
    @IsString({each : true})
    @IsArray()
    @IsOptional() //porque si no lo manda sera un arreglo vacio
    images?: string[];

}
