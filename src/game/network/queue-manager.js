import EventEmitter from 'eventemitter3';
import { SocketManager } from "./socket-manager";
import { config } from '../../config';

const QUEUE_SOCKET_SERVER_URI = `${config.serverApi.protocol}://${config.serverApi.host}`;
const QUEUE_PATH = '/queue';

export class QueueManager extends EventEmitter {

  /**
   * @param {string} authToken
   * @param {string} gameType
   * @return {Promise<any>}
   */
  async joinQueue ({ authToken, gameType = 'quick' }) {
    if (!authToken) {
      throw new Error( '[QueueManager] authToken does not provided' );
    }

    const socketManager = SocketManager.getManager();
    return socketManager.connect(QUEUE_SOCKET_SERVER_URI, {
      authToken,
      gameType
    }, {
      path: QUEUE_PATH
    }).then(_ => {
      socketManager.socket.once( 'queue.serverFound', this.onServerFound.bind(this) );
    });
  }

  /**
   * @param {*} args
   */
  onServerFound (args) {
    console.log( '[queue] server found', args );

    this.emit( 'queue.serverFound', args );
  }
}
