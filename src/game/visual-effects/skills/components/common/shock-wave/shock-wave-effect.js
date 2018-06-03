import { optionsFactory } from "./shock-wave-options";
import { ParticleEffect } from "../../../../effect";

export class ShockWaveEffect extends ParticleEffect {

  /**
   * @param {*} options
   */
  constructor (options = {}) {
    super();
    this.setOptions( this.mergeOptions( optionsFactory(), options ) );
  }
}
