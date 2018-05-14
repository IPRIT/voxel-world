import { PlayerObject } from "./player-object";

export class Player extends PlayerObject {

  /**
   * @type {number}
   * @private
   */
  _playerId;

  /**
   * @type {string}
   * @private
   */
  _playerName;

  /**
   * @param {*} data
   */
  setPlayerData (data = {}) {
    let { playerId, playerName = 'unknown' } = data;
    this._playerId = playerId;
    this._playerName = playerName;
  }

  /**
   * @returns {number}
   */
  get playerId () {
    return this._playerId;
  }

  /**
   * @returns {string}
   */
  get playerName () {
    return this._playerName;
  }
}
