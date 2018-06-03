import { optionsFactory } from "./explosion-options";
import { ParticleEffect } from "../../effect";
import { extendDeep } from "../../../utils";

export class ExplosionEffect extends ParticleEffect {

  /**
   * @param {*} options
   */
  constructor (options = {}) {
    super();
    this.setOptions( this.mergeOptions( optionsFactory(), options ) );
  }
}
