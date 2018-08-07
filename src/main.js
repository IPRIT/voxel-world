import { Game } from "./game";
import { SocketManager } from "./game/network";

export function run (vuexStore) {
  window.game = Game.getInstance();

  window.game.init( vuexStore );
  window.game.start();

  const io = SocketManager.getManager();
  setTimeout(_ => {
    io.connect('http://localhost:9001', {
      gameToken: '92a4484461621c0bfc6404efb4409d062184b0f1e084322d0b24308f5ae6eb98d05d7e2a6bbfa613255ee84ef3a3a4ff'
    }).catch( console.warn );

    io.on('connect', _ => {
      console.log( 'connected to game server' );
      io.socket.emit("add user", 'Deer');
      setTimeout(_ => {
        io.socket.emit("new message", "connected");
      }, 500);
    });
  }, 1000);
}
