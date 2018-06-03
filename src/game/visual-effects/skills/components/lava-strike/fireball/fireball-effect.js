import { optionsFactory } from "./fireball-options";
import { FlowingEffect } from "../../../../effect";

export class FireBallEffect extends FlowingEffect {

  /**
   * @param {*} options
   */
  constructor (options = {}) {
    super();
    this.setOptions( this.mergeOptions( optionsFactory(), options ) );
  }
}
