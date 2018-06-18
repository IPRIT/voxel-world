import { Game } from "./game";

export function run (vuexStore) {
  window.game = Game.getInstance();
  window.game.init( vuexStore );
  window.game.start();
}
