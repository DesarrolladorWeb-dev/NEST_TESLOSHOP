import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {Response} from 'express';
import { diskStorage } from 'multer';
import { fileFilter , fileNamer } from './helpers';
import { ConfigService } from '@nestjs/config';

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(

    private readonly filesService: FilesService,
    private readonly configService : ConfigService
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res:Response, //Este es el response de express - manualmente emitire la respuesta
    @Param('imageName') imageName : string 
) {
    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path);
  }


  @Post('product')  //ponemos el endpoint: como quiero relacionar el uploadProductImage a productos
  @UseInterceptors(FileInterceptor('file',{
    fileFilter: fileFilter, //solo es la referencia de la funcion no la ejecuto
    // limits: {fileSize: 1000}, //limite de peso
    storage: diskStorage({
      destination : './static/products',
      filename : fileNamer
    }) 
  }))//interceptor: interceptan las solicitudes y mutar en lo que sea las respuestas - lo que espero es "file"
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File, //con el multer instalado : yarn add -D @types/multer
  ){
    // TODO Esto es cuando pasa el Interceptors 
    // Solo desde este archivo se puede lanzar excepciones 
    if(!file){ 
      throw new BadRequestException('Make sure that the file is an image')
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return {
      secureUrl
    };
  }
  
}
