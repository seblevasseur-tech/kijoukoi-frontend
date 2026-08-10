import { Racket } from './racket.model';
import { PlayerTag } from './player-tag.model';

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  age?: number;
  nationality?: string;
  ranking?: number;
  gender?: string;
  registrationDate?: string;
  lastRacketUpdateDate?: string;
  avatar?: string;
  racket?: Racket;
  tags?: PlayerTag[];
}
