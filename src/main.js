import { Game } from "./game";

export function run () {
  /*const fontLoader = new THREE.FontLoader();
  fontLoader.load('/resources/fonts/font2.typeface.json', font => {
    window.gameFont = font;
  });*/

  window.game = Game.getInstance();
  window.game.init();
  window.game.start();
}
