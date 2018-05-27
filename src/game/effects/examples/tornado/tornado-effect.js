import { optionsFactory } from "./tornado-options";
import { ParticleEffect } from "../../effect";

export class TornadoEffect extends ParticleEffect {

  constructor () {
    super();
    this.setOptions( optionsFactory() );
  }
}
