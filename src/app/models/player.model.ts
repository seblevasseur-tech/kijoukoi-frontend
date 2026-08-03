import { Racket } from './racket.model';
import { PlayerTagAssignment } from './player-tag-assignment.model';

export interface Player {
  id: number;
  login: string;
  age?: number;
  nationality?: string;
  ranking?: number;
  registrationDate?: string;
  lastRacketUpdateDate?: string;
  avatar?: string;
  racket?: Racket;
  tagAssignments?: PlayerTagAssignment[];
}
