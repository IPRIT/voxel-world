import { optionsFactory } from "./whirl-options";
import { FlowingEffect } from "../../effect";

export class WhirlEffect extends FlowingEffect {

  constructor () {
    super();
    this.setOptions( optionsFactory() );
  }
}
