import EventEmitter from 'eventemitter3';
import { SocketManager } from "./socket-manager";
import { resolveProtocol } from "../../util/common-utils";

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
      console.log('connected', session, this.socketManager.socket);
      this._listen();
    });
  }

  /**
   * Close connection with the server
   */
  disconnect () {
    this.socketManager.disconnect();
  }

  /**
   * @return {SocketManager}
   */
  get socketManager () {
    return SocketManager.getManager();
  }

  /**
   * @return {Socket}
   */
  get socket () {
    return this.socketManager.socket;
  }

  /**
   * @param {Object} server
   * @return {string}
   * @private
   */
  _buildServerUri (server) {
    return `${resolveProtocol()}://${server.publicIp}`;
  }

  /**
   * @private
   */
  _listen () {
    const socket = this.socketManager.socket;
    socket.on('*', this._onMessage.bind( this ));
  }

  /**
   * @param {Object} message
   * @private
   */
  _onMessage (message = {}) {
    const { data } = message;
    const eventName = data.shift();
    this.emit( eventName, ...data );
  }
}
