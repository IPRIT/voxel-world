import Game from './game/game';

export function run () {
  const fontLoader = new THREE.FontLoader();
  fontLoader.load('/resources/fonts/font2.typeface.json', font => {
    window.gameFont = font;
    const game = new Game();
    window.game = game;
    game.start();
  });
}
