import EventEmitter from 'eventemitter3';
import { Player } from "../../living-object/player";

export class Players extends EventEmitter {

  /**
   * @type {Map<number, Player>}
   * @private
   */
  _map = new Map();

  /**
   * @type {PlayerMe}
   * @private
   */
  _me = null;

  /**
   * @type {Players}
   * @private
   */
  static _instance = null;

  /**
   * @returns {Players}
   */
  static getPlayers () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new Players() );
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    const players = this.players;
    for (let i = 0; i < players.length; ++i) {
      const player = players[ i ];
      player.update( deltaTime );
    }
  }

  /**
   * @param {PlayerMe} me
   */
  setMe (me) {
    this._me = me;
  }

  /**
   * @param {number} userId
   * @returns {Player | undefined}
   */
  getPlayer (userId) {
    return this._map.get( userId );
  }

  /**
   * @param {number} userId
   * @returns {boolean}
   */
  hasPlayer (userId) {
    return this._map.has( userId );
  }

  /**
   * @param {Player} player
   */
  addPlayer (player) {
    this._map.set( player.userId, player );
  }

  /**
   * @param {number} userId
   */
  deletePlayer (userId) {
    this._map.delete( userId );
  }

  /**
   * @returns {Array<Player|PlayerMe>}
   */
  get players () {
    return [ ...this._map.values() ].concat( this.hasMe ? this._me : [] );
  }

  /**
   * @returns {Array<Player>}
   */
  get otherPlayers () {
    return [ ...this._map.values() ];
  }

  /**
   * @returns {PlayerMe}
   */
  get me () {
    return this._me;
  }

  /**
   * @returns {boolean}
   */
  get hasMe () {
    return !!this._me;
  }
}
