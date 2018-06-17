import { Game } from "./game";

export function run () {
  window.game = Game.getInstance();
  window.game.init();
  window.game.start();
}
