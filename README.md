<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="130" alt="Nest Logo" /></a>
</p>


# Ejecutar en desarrollo

1. Clonar el repositorio
2. Ejecutar
```
npm install
```
3. Tener Nest CLI instalado
```
npm i -g @nestjs/cli
```

4. Levantar la base de datos
```
docker-compose up -d
```

5. Reconstruir la base de datos con la semilla 
```
localhost:3000/api/v2/seed
```

## Stack Usado
* MongoDB
* Nest 


# Conectar nest con Mongo

## 1. Instalar mongose
```
npm i @nestjs/mongoose mongoose
```
## 2. En app.module

Agregar MongooseModule.forRoot('path/nombreDB)
```
@Module({
  imports: [ServeStaticModule.forRoot({
    rootPath: join(__dirname,'..','public'),
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'), 
    PokemonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

## 3. Crear el esquema

En una clase entidad, es la que hace una referencia a como vamos a grabar en nuestra db

```
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Pokemon extends Document{          
  
    //id: string --> mongo me lo da
    @Prop({
        unique: true,
        index: true,
    })
    name:string;
    
    @Prop({
        unique: true,
        index: true,
    })
    no: number;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
```

## 4. Crear el esquema

En el pokemonModule importar Mongoose.forFeature() para crear el esquema
```
@Module({
  controllers: [PokemonController],
  providers: [PokemonService],
  imports: [MongooseModule.forFeature([
    {
      name: Pokemon.name,
      schema: PokemonSchema,
    }
  ])]
})
export class PokemonModule {}
```

  ***ForRoot() para crear la conexión con mongo***

  ***ForFeature() para crear el esquema***

## ***Usage***

1) Para usarlose hace la inyección  en el servicio  

```
 constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel:Model<Pokemon>
  ){}
  ```

2) luego para usarlo dentro de un método, se utiliza la instancia de model, que es la que contiene los métodos para interactuar con la db, post, get, put, delete...

```
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    
    const pokemon = await this.pokemonModel.create(createPokemonDto)
    
    return pokemon;
```


## Validar y eliminar en una sola línea

```
    const  {deletedCount} = await this.pokemonModel.deleteOne({_id:id})
    if(deletedCount===0) throw new BadRequestException(`Pokemos with id ${id} not found`)
    return ;
```