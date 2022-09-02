import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v2')   //poner prefijo a todos los endpoints
  
  app.useGlobalPipes(             //configuración global de los pipes
    new ValidationPipe({
      whitelist: true,              //borra todos los datos que sobran     
      forbidNonWhitelisted: true,   // Lanza un error si se ponen datos de más,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })),

  await app.listen(process.env.PORT);           //configura el puerto en el que correrá la app.
  console.log(`App running on port ${process.env.PORT}`);
}
bootstrap();
