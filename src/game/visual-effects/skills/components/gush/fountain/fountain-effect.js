import { optionsFactory } from "./fountain-options";
import { ParticleEffect } from "../../../../effect";

export class FountainEffect extends ParticleEffect {

  /**
   * @param {*} options
   */
  constructor (options = {}) {
    super();
    this.setOptions( this.mergeOptions( optionsFactory(), options ) );
  }
}
