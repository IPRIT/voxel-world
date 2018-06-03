import { optionsFactory } from "./tornado-options";
import { ParticleEffect } from "../../../../effect";

export class TornadoEffect extends ParticleEffect {

  /**
   * @param {*} options
   */
  constructor (options = {}) {
    super();
    this.setOptions( this.mergeOptions( optionsFactory(), options ) );
  }
}
