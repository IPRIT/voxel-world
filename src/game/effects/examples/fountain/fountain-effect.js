import { optionsFactory } from "./fountain-options";
import { ParticleEffect } from "../../effect";

export class FountainEffect extends ParticleEffect {

  constructor () {
    super();
    this.setOptions( optionsFactory() );
  }
}