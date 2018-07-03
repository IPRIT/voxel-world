import { Player } from "../player";

export class PlayerEnemy extends Player {

  /**
   * @return {boolean}
   */
  get isMe () {
    return false;
  }
}
