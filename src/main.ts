import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.setGlobalPrefix('api') //para que se coloque el api en la url

  // Nos ayudara en la validacion y crear las DTO para recirbir la dato y validarlo
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      forbidNonWhitelisted:true,
    })
  ); 
  const config = new DocumentBuilder()
  .setTitle('Teslo RESTFULL API')
  .setDescription('Teslo  shop endpoint')
  .setVersion('1.0')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
  logger.log(`App running on port ${process.env.PORT}`);
}
bootstrap();
