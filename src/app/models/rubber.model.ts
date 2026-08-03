import { Brand } from './brand.model';

export interface Rubber {
  id: number;
  name: string;
  brand: Brand;
  image: string;
}
