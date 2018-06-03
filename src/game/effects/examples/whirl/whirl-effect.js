import { optionsFactory } from "./whirl-options";
import { FlowingEffect } from "../../effect";

export class WhirlEffect extends FlowingEffect {

  /**
   * @param {*} options
   */
  constructor (options = {}) {
    super();
    this.setOptions( this.mergeOptions( optionsFactory(), options ) );
  }
}
