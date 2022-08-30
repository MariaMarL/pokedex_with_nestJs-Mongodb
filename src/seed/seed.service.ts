import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {

  private readonly axioss: AxiosInstance = axios;

  async executeSeed(){

    // const {data} = await this.axioss.get('https://pokeapi.co/api/v2/pokemon?limit=5')
    const {data} = await this.axioss.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=5')
    
    data.results.forEach(({name, url}) => 
      {
        const segments = url.split('/');
        const no: number = +segments[ segments.length -2]
        console.log({name, no});
        
        
      }
    )
    return data.results
  }
}
