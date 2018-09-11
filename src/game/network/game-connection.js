import EventEmitter from 'eventemitter3';
import { SocketManager } from "./socket-manager";

export class GameConnection extends EventEmitter {

  /**
   * @type {Object}
   * @private
   */
  _session = null;

  /**
   * @type {Object}
   * @private
   */
  _server = null;

  /**
   * @type {GameConnection}
   * @private
   */
  static _instance = null;

  /**
   * @return {GameConnection}
   */
  static getConnection () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new GameConnection() );
  }

  /**
   * @param {{ server: Object, session: Object }} serverInfo
   * @return {Promise<*>}
   */
  connect (serverInfo = {}) {
    const { server, session } = serverInfo;
    if (!server || !session) {
      throw new Error('Invalid session or server does not exist');
    }

    this._server = server;
    this._session = session;

    const { sessionToken = '' } = session;
    const serverUri = this._buildServerUri( server );

    return this.socketManager.connect(serverUri, {
      sessionToken
    }).then(_ => {
      console.log('connected', session);
    });
  }

  /**
   * Close connection with the server
   */
  disconnect () {
    this.socketManager.disconnect();
  }

  /**
   * @param {Object} server
   * @return {string}
   * @private
   */
  _buildServerUri (server) {
    return `http://${server.publicIp}`;
  }

  /**
   * @return {SocketManager}
   */
  get socketManager () {
    return SocketManager.getManager();
  }
}
