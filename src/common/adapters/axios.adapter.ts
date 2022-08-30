import axios, {AxiosInstance} from 'axios';
import { Injectable } from '@nestjs/common';
import { HttpAdapter } from '../interfaces/http-adapter.interface';

@Injectable()
export class AxiosAdapter implements HttpAdapter{
    
      private axioss: AxiosInstance = axios;

    async get<T>(url: string): Promise<T> {

        try {
            const { data } = await this.axioss.get<T>(url)
            return data
        } catch (error) {
            throw new Error('This is an error, check logs')
        }

    }

}