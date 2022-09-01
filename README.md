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

## 3. Crear la entidad (esquema)

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

  ***`ForRoot()` para crear la conexión con mongo***

  ***`ForFeature()` para crear el esquema***

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

## ***Query Parámeters***

Son los parámetros que se reciben en la url, eg:
``` localhost:3000/api/v2/pokemon?limit=10&offset=5 ```


```
  @Get()
  findAll( @Query() paginationDto: PaginationDto) {
    console.log({paginationDto});
    
    return this.pokemonService.findAll();
  }
```
Allí estoy recibiendo paramámetros llamados paginationDto, que son del tipo PaginationDto, por lo que deben 
seguir su estructura. Este dto está de la siguiente manera:
```
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Min(1)
    limit: number;

    @IsOptional()
    @IsPositive()
    offset: number;
}
```
Por lo tanto sólo recibirá esos dos parámetros, limit y offset y sus valores deben respetar las validaciones, si estos valores no cumplen, o si se envía un parámetro diferente a limit y offset el programa arrojará un error.

Estos query vienen como string, por lo que en la configuración global se transforman para que siempre sean recibidos como number, así:

```
  app.useGlobalPipes(             //configuración global de los pipes
    new ValidationPipe({
      whitelist: true,              //borra todos los datos que sobran     
      forbidNonWhitelisted: true,   // Lanza un error si se ponen datos de más,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })),
```

## ***Variables de entorno***

En estas se definen las llaves de acceso. Son necesarias porque nuestra app va a correr en diferentes ambientes y nosotros debemos estar preparados para hacer los cambios respectivos dependiendo de la necesidad.

Para la creación y uso de las variables de entorno:
  
  1. Crear archivo `.env` en el `root` de nuestra app.
  2. Ignorarlo en el `.gitignore` -> .env y ya
  3. instalar la configuración ``npm i @nest/config``
  4. en el `app.module` en `imports` agregar de primero `[ConfigModule.forRoot()],`

```
@Module({
  imports: [
    ConfigModule.forRoot(),

    MongooseModule.forRoot(process.env.MONGODB), 
    PokemonModule, 

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

5. y ya podría ser usada con el comando `process.env.NOMBRE`, eg. `process.env.MONGODB`, 

  ***`importante`: las variables de entorno siempre vienen por defecto como `string`, por lo que en caso de ser requeridas como `number` es necesario convertirlas.***