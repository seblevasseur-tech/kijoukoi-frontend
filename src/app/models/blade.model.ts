import { Brand } from './brand.model';
import { BladeType } from './blade-type.model';

export interface Blade {
  id: number;
  name: string;
  brand: Brand;
  weight: number;
  type: BladeType;
  image: string;
}
