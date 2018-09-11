import { Game } from "./index";
import { AppStore } from "./utils/store/app-store";

export function run (vuexStore, router) {
  const game = window.game = Game.getInstance();

  const store = AppStore.getStore();
  store.initStore( vuexStore );

  game.connect().then(_ => {
    game.init();
    game.start();
  }).catch(_ => {
    console.log( _ );
    game.disconnect();
    router.replace({ name: 'index' });
  });
}
