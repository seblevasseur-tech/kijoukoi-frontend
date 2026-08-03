import { PlayerTag } from './player-tag.model';

export interface PlayerTagAssignment {
  id?: number;
  tag: PlayerTag;
  isPositive: boolean;
}
