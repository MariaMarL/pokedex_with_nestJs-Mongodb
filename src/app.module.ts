import { join } from 'path';  //ya viene en node
import { Module } from '@nestjs/common';
import { ServeStaticModule } from "@nestjs/serve-static";
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    ServeStaticModule.forRoot({
    rootPath: join(__dirname,'..','public'),
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'), 
    PokemonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}


