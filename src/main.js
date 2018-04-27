import Game from './game/game';

export function run () {
  const fontLoader = new THREE.FontLoader();
  fontLoader.load('/resources/fonts/font2.typeface.json', font => {
    window.gameFont = font;
    window.game = new Game();
    window.game.init();
    window.game.start();
  });
}
