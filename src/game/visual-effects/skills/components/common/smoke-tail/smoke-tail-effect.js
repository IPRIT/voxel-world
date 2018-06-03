import { optionsFactory } from "./smoke-tail-options";
import { FlowingEffect } from "../../../../effect";

export class SmokeTailEffect extends FlowingEffect {

  /**
   * @param {*} options
   */
  constructor (options = {}) {
    super();
    this.setOptions( this.mergeOptions( optionsFactory(), options ) );
  }
}
