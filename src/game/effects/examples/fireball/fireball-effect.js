import { optionsFactory } from "./fireball-options";
import { FlowingEffect } from "../../effect";

export class FireBallEffect extends FlowingEffect {

  constructor () {
    super();
    this.setOptions( optionsFactory() );
  }
}
