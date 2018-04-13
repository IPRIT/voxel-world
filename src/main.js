import Game from './game/game';

export function run () {
  const game = new Game();
  window.game = game;
  game.start();
  return game;
}
