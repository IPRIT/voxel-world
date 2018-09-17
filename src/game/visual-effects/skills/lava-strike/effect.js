import { Skill } from "../skill/skill";
import { LavaStrikeStructure } from './structure';

export class LavaStrike extends Skill {

  constructor () {
    super( new LavaStrikeStructure() );
  }
}
