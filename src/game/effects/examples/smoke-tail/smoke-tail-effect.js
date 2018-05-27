import { optionsFactory } from "./smoke-tail-options";
import { FlowingEffect } from "../../effect";

export class SmokeTailEffect extends FlowingEffect {

  constructor () {
    super();
    this.setOptions( optionsFactory() );
  }
}
