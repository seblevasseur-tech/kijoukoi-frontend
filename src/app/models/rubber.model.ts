import { Brand } from './brand.model';
import { RubberType } from './rubber-type.model';

export interface Rubber {
  id: number;
  name: string;
  brand: Brand;
  rubberType: RubberType;
  hardness: number;
  image: string;
}
