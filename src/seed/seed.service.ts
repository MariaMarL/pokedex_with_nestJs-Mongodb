import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosAdapter } from '../common/adapters/axios.adapter';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {


  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel:Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ){}

  async executeSeed(){

    await this.pokemonModel.deleteMany({})   //delete * from pokemon
    
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')
    
    const pokemonToInsert: {name: string, no: number}[] = []

    data.results.forEach(({name, url}) => 
      {
        const segments = url.split('/');
        const no: number = +segments[ segments.length -2]
        
        // const pokemon = await this.pokemonModel.create({name, no})
        
        pokemonToInsert.push({name, no})
      }
    ) 
    this.pokemonModel.insertMany(pokemonToInsert)

  ////______________________________________________________________________________________________
  //// SE CREAN MUCHAS INSERCIONES DE ESTA FORMA

  // async executeSeed(){

  //   await this.pokemonModel.deleteMany({})   //delete * from pokemon
  //   // const {data} = await this.axioss.get('https://pokeapi.co/api/v2/pokemon?limit=5')
  //   const {data} = await this.axioss.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=5')
    
  //   const insertPromiseArray = []
  //   data.results.forEach(({name, url}) => 
  //     {
  //       const segments = url.split('/');
  //       const no: number = +segments[ segments.length -2]
        
  //       // const pokemon = await this.pokemonModel.create({name, no})
        
  //       insertPromiseArray.push( this.pokemonModel.create({name, no}))
  //     }
  //   )
  //   await Promise.all(insertPromiseArray)
    
    return 'Seed Executed'
  }
}
