import { Blade } from './blade.model';
import { Rubber } from './rubber.model';

export interface Racket {
  blade?: Blade;
  forehandRubber?: Rubber;
  backhandRubber?: Rubber;
}
