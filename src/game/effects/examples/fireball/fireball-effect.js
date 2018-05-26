import { Effect } from "../../effect";
import { optionsFactory } from "./fireball-options";

export class FireBallEffect extends Effect {

  constructor () {
    super();
    this.setOptions( optionsFactory() );
    this.onFinished(_ => this.dispose());
  }
}
