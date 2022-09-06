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

5. Clonar el archivo **.env.template** y renombrar la copia a **.env**

6. Llenar las variables de entorno definidas en el **.env**

7. Ejecutar la app en dev con el comando: `npm run start:dev`

8. Reconstruir la base de datos con la semilla 

```
localhost:3000/api/v2/seed
```
## Stack Usado
* MongoDB
* Nest 


# ***Conectar nest con Mongo***

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

6. Configuración loader

Es una función para mapear mis variables de entorno.

Para esto
* Creo un folder `config` y dentro de este el archivo `env.config.ts` que contendrá la función que se encarga de mapear las variables.

    ```
    export const EnvConfiguration = () => ({
        environment: process.env.NODE_ENV || 'dev',
        mongodb: process.env,
        port: process.env.PORT || 3002,
        defaultLimit: process.env.DEFAULT_LIMIT || 7
    })
    ```
* Este archivo lo importamos en `app.module`, dentro de `ConfigModule.forRoot({ load: nombreFunción})`

    ```
    @Module({
      imports: [
        ConfigModule.forRoot({
          load: [ EnvConfiguration]
        }),
      ],
      controllers: [],
      providers: [],
    })
    export class AppModule {}
    ```

Luego se utiliza el `ConfigurationService` para poder utilizar la configuración de variables de entorno que se configuraron en el archivo `env.config.ts`
para esto:

  * Inyectamos en el constructor el `configService: ConfigService`

    ```
      constructor(
        @InjectModel( Pokemon.name )
        private readonly pokemonModel:Model<Pokemon>,

        private readonly configService: ConfigService
      ){}
    ```

    y lo importarmos de `'@nestjs/config';`

  * luego en el module en el que estemos trabajando, eg. `pokemon.module` importamos el `ConfigService`.

    ```
    import { ConfigModule } from '@nestjs/config';

    @Module({
      controllers: [PokemonController],
      providers: [PokemonService],
      imports: [
        ConfigModule,
        ],
    })
    export class PokemonModule {}
    ```

  * Para usarlo tenemos dos opciones
    - `configService.getOrThrow('SEED');` -> Busca la variable y si no la encuentra arroja un error.
    - `configService.get<number> ('defaultLimit')` -> sólo busca la variable pero no arroja el error.


    Entonces creamos una variable 
    
      ```
      private defaultLimit: number;
      ```

    luego la asignamos dentro del constructor 
      ```
        constructor(
      @InjectModel( Pokemon.name )
      private readonly pokemonModel:Model<Pokemon>,

      private readonly configService: ConfigService
    ){

      // console.log(configService.getOrThrow('SEED'));
      this.defaultLimit = configService.get<number>('defaultLimit')
      
    }
    ```
    y luego podrá ser asignada donde sea necesaria. 
    
    `const { limit = this.defaultLimit, offset =0} = paginationDto;`

 ***`Importante:` para que las variables de entorno sean reconocidas se debe bajar y volver a subir el servicio.***

 ***`Nota`: Las variables de entorno se definen en el archivo `.env` y en el archivo `config/env.config.ts` se crea la función para manejar esas variables de entorno y qué hacer en caso de encontrar una que no esté definida, así también poder darle valores por defecto.***

***`Nota2:` En los buildingBlock(Services) se puede usar el configService, pero cuando se encuentra fuera de los buildingBlock(main) ya no funciona y toca utilizar process.env.NAME.***

## ***Joi***

  Sirva para:
    * Validar
    * Lanzar errores
    * Poner valores por defecto
    * Revisar que un objeto luzca de la manera esperada

  Instalación `npm i joi`, 
  Para usarlo hay que importarlo `import * as Joi from "joi";`

  Para usarlo lo importamos en app.module; puede trabajar en conjunto con el load, el load hace conversiones y mapeo y el joi valida que se vean como se espera.
  ```
  @Module({
    imports: [
      ConfigModule.forRoot({
        load: [ EnvConfiguration],
        validationSchema: joiValidationSchema,
      }),
    ],
    controllers: [],
    providers: [],
  })
  export class AppModule {}
  ```

  ### **Ejemplo**
  ```
  const schema = Joi.object({
      username: Joi.string()
          .alphanum()
          .min(3)
          .max(30)
          .required(),

      password: Joi.string()
          .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

      repeat_password: Joi.ref('password'),

      access_token: [
          Joi.string(),
          Joi.number()
      ],

      birth_year: Joi.number()
          .integer()
          .min(1900)
          .max(2013),

      email: Joi.string()
          .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
  })
      .with('username', 'birth_year')
      .xor('password', 'access_token')
      .with('password', 'repeat_password');


  schema.validate({ username: 'abc', birth_year: 1994 });
  // -> { value: { username: 'abc', birth_year: 1994 } }

  schema.validate({});
  // -> { value: {}, error: '"username" is required' }
  ```

  El `validationSchema` va a encargarse de que tienen que estar esas variables de entorno que son necesarias para que ejecute y el buen funcionamiento de la aplicación.

  ## ***Despliege en Heroku***

  1. Intercabiar las siguiented líneas en el package.json

      _**Antes**_

      ``` 
        "start": "nest start",
        "start:prod": "node dist/main",
      ```

      _**Después**_

      ```
        "start": "node dist/main",
        "start:prod": "nest start",
      ```
  2. En el main.ts asegurarse que el `await app.listen(process.env.PORT)` esté con `(process.env.PORT)` y no directamente con el puerto, eg. 3000, porque este puerto será asignado por heroku.

  3. En la página de heroku logearse y crear una nueva app.
  4. Verificar que se tiene Heroku Cli instalado `heroku --version`.
  5. git add .
  6. git commit -m "despliegue a heroku"
  7.  `heroku git:remote -a pokedex-fhj`

      En este punto se abre un navegadoy y pide loguearse.
  8. Configurar variables de entorno dentro de la página web de heroku.    

  9. `git push heroku master`

  # ***Docker***
  `https://gist.github.com/Klerith/e7861738c93712840ab3a38674843490`

  * `.dockerignore` 
  * `docker-compose.prod.yaml` 
  * `dockerfilw` 
  1. Crear el archivo `.env.prod`
  2. Llenar las variables de entorno para producción.
  3. Construir la nueva imagen
      ```
      docker-compose -f docker-compose.prod.yaml --env-file .env.prod up --build
      ```