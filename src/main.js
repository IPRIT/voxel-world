import { Game } from "./game";
import { SocketManager } from "./game/network";

export function run (vuexStore) {
  window.game = Game.getInstance();

  window.game.init( vuexStore );
  window.game.start();

  const io = SocketManager.getManager();
  setTimeout(_ => {
    io.connect('https://socket-io-chat.now.sh', { token: 'test2' }).then(_ => {
    }).catch( console.warn );

    io.on('connect', _ => {
      io.socket.emit("add user", 'Deer');
      setTimeout(_ => {
        io.socket.emit("new message", "connected");
      }, 500);
    });
  }, 1000);
}
