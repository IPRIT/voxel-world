import { Game } from "./index";
import { SocketManager } from "./network/index";

export function run (vuexStore) {
  window.game = Game.getInstance();

  window.game.init( vuexStore );
  window.game.start();

  const io = SocketManager.getManager();
  setTimeout(_ => {
    /*io.connect('http://localhost:9001', {
      gameToken: '92a4484461621c0bfc6404efb4409d062184b0f1e084322d0b24308f5ae6eb98d05d7e2a6bbfa613255ee84ef3a3a4ff'
    }).catch( console.warn );*/

    io.connect('http://localhost:9000', {
      authToken: '2e7c530399f54f85f63e66055ccf3a916484199cdc8a3b8b5468b530098569e10b0d564ec8c67708097a5dea79cfea11'
    }, {
      path: '/queue'
    }).catch( console.warn );

    io.on('connect', _ => {
      console.log( 'connected to game server' );
    });
  }, 1000);
}
