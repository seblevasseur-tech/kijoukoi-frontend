import { Brand } from './brand.model';

export interface Blade {
  id: number;
  name: string;
  brand: Brand;
  weight: number;
  image: string;
}
