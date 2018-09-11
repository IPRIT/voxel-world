import io from 'socket.io-client';
import EventEmitter from 'eventemitter3';

const log = (...args) => console.log( '[ws]', ...args );

export class SocketManager extends EventEmitter {

  /**
   * @type {Socket}
   * @private
   */
  _socket = null;

  /**
   * @type {number}
   * @private
   */
  _latency = 0;

  /**
   * @type {SocketManager}
   * @private
   */
  static _instance = null;

  /**
   * @return {SocketManager}
   */
  static getManager () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new SocketManager() );
  }

  /**
   * @param {string} url
   * @param {Object} query
   * @param {*} options
   * @return {Promise<any>}
   */
  connect (url = '/', query = {}, options = {}) {
    if (this._socket) {
      return Promise.reject( '[ws] Socket.io already connected' );
    }

    this._socket = io(url, {
      query,
      transports: [ 'websocket' ],
      reconnectionDelay: 100,
      reconnectionDelayMax: 200,
      timeout: 5000,
      ...options
    });

    this.emit( 'connecting', url );
    log( `Connecting to ${url}...` );

    this._attachEventListeners();

    return new Promise((resolve, reject) => {
      this._socket.once( 'connect', resolve );
      this._socket.once( 'connect_error', reject );
      this._socket.once( 'error', reject );
    });
  }

  /**
   * Disconnects the socket manually.
   *
   * Synonym of socket.close().
   */
  disconnect () {
    this._socket && this._socket.disconnect();
    this._socket = null;
  }

  /**
   * @return {Socket}
   */
  get socket () {
    return this._socket;
  }

  /**
   * @return {string}
   */
  get socketId () {
    return this._socket && this._socket.id;
  }

  /**
   * @return {boolean}
   */
  get isConnected () {
    return this._socket && this._socket.connected;
  }

  /**
   * @return {boolean}
   */
  get isDisconnected () {
    return !this._socket || this._socket.disconnected;
  }

  /**
   * @private
   */
  _attachEventListeners () {
    // Fired upon a connection including a successful reconnection.
    this._socket.on('connect', this._onConnect.bind( this ));

    // Fired when an error occurs.
    this._socket.on('error', this._onError.bind( this ));

    // reason (String) either ‘io server disconnect’ or ‘io client disconnect’
    // Fired upon a disconnection.
    this._socket.on('disconnect', this._onDisconnect.bind( this ));

    // error (Object) error object
    // Fired upon a connection error.
    this._socket.on('connect_error', this._onConnectError.bind( this ));

    // Fired upon a connection timeout.
    this._socket.on('connect_timeout', this._onConnectTimeout.bind( this ));

    // attempt (Number) reconnection attempt number
    // Fired upon a successful reconnection.
    this._socket.on('reconnect', this._onReconnect.bind( this ));

    // Fired upon an attempt to reconnect.
    this._socket.on('reconnect_attempt', this._onReconnectAttempt.bind( this ));

    // attempt (Number) reconnection attempt number
    // Fired upon a start of reconnection.
    this._socket.on('reconnecting', this._onReconnecting.bind( this ));

    // error (Object) error object
    // Fired upon a reconnection attempt error.
    this._socket.on('reconnect_error', this._onReconnectError.bind( this ));

    // Fired when couldn’t reconnect within reconnectionAttempts
    this._socket.on('reconnect_failed', this._onReconnectFailed.bind( this ));

    // Fired when a ping packet is written out to the server.
    this._socket.on('ping', this._onPing.bind( this ));

    // ms (Number) number of ms elapsed since ping packet (i.e.: latency).
    // Fired when a pong is received from the server.
    this._socket.on('pong', this._onPong.bind( this ));
  }

  /**
   * Fired upon a connection including a successful reconnection.
   *
   * @private
   */
  _onConnect () {
    log( 'Event: connect' );
    this.emit( 'connect' );
  }

  /**
   * Fired when an error occurs.
   *
   * @param {Object} error
   * @private
   */
  _onError (error) {
    log( 'Event: error', error );
    this.emit( 'error', error );
  }

  /**
   * Fired upon a disconnection.
   *
   * @param {string} reason (
   *   'client namespace disconnect',
   *   'server namespace disconnect',
   *   'disconnect transport close' -- internet error
   *   'io server disconnect' -- the disconnection was initiated by the server, you need to reconnect manually
   * )
   * @private
   */
  _onDisconnect (reason) {
    log( 'Event: disconnect', reason );

    this.emit( 'disconnect', reason );

    if (reason === 'io server disconnect') {
      // the disconnection was initiated by the server, you need to reconnect manually
      setTimeout(_ => this._socket.connect(), 1000);
    }
    // else the socket will automatically try to reconnect
  }


  /**
   * Fired upon a connection error.
   *
   * @param {Object} error
   * @private
   */
  _onConnectError (error) {
    log( 'Event: connect_error', error );

    this.emit( 'connect_error', error );
  }

  /**
   * Fired upon a connection timeout.
   *
   * @private
   */
  _onConnectTimeout () {
    log( 'Event: connect_timeout' );

    this.emit( 'connect_timeout' );
  }

  /**
   * Fired upon a successful reconnection.
   *
   * @param {number} attempt
   * @private
   */
  _onReconnect (attempt) {
    log( 'Event: reconnect', attempt );

    this.emit( 'reconnect', attempt );
  }

  /**
   * Fired upon an attempt to reconnect.
   *
   * @private
   */
  _onReconnectAttempt () {
    log( 'Event: reconnect_attempt' );

    this.emit( 'reconnect_attempt' );
  }

  /**
   * Fired upon a start of reconnection.
   *
   * @param {number} attempt
   * @private
   */
  _onReconnecting (attempt) {
    log( 'Event: reconnecting', attempt, 'attempts.' );

    this.emit( 'reconnecting', attempt );
  }

  /**
   * Fired upon a reconnection attempt error.
   *
   * @param {Object} error
   * @private
   */
  _onReconnectError (error) {
    log( 'Event: reconnect_error', error );

    this.emit( 'reconnect_error', error );
  }

  /**
   * Fired when couldn’t reconnect within reconnectionAttempts
   *
   * @private
   */
  _onReconnectFailed () {
    log( 'Event: reconnect_failed' );

    this.emit( 'reconnect_failed' );
  }

  /**
   * Fired when a ping packet is written out to the server.
   *
   * @private
   */
  _onPing () {
    // log( 'Event: ping' );

    this.emit( 'ping' );
  }

  /**
   * Fired when a pong is received from the server.
   *
   * @param {number} ms
   * @private
   */
  _onPong (ms) {
    // log( 'Event: pong', ms, 'ms.' );
    this._latency = ms || 0;

    this.emit( 'pong', ms );
  }
}
