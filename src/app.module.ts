import { join } from 'path';  //ya viene en node
import { Module } from '@nestjs/common';
import { ServeStaticModule } from "@nestjs/serve-static";
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot(),
    
    ServeStaticModule.forRoot({
    rootPath: join(__dirname,'..','public'),        //para servir contenido estático
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon-fernando'),     //crea la conexión con mongoDB
    PokemonModule, 
    CommonModule,
    SeedModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

//linea 12, ServeStaticModule para servir contenido estático
