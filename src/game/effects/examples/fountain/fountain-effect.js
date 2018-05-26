import { Effect } from "../../effect";
import { optionsFactory } from "./fountain-options";

export class FountainEffect extends Effect {

  constructor () {
    super();
    this.setOptions( optionsFactory() );
    this.onFinished(_ => this.dispose());
  }
}
