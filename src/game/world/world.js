import { WorldMap } from "./map/world-map";

export class World {

  /**
   * @type {Game}
   * @private
   */
  _game = null;

  /**
   * @type {WorldMap}
   * @private
   */
  _map = null;

  /**
   * @type {Map<string|number, Player>}
   * @private
   */
  // _players = new Map();

  /**
   * @param {Game} game
   */
  constructor (game) {
    this._game = game;
  }

  async init () {
    let map = new WorldMap();
    map.init();

    this._game.scene.add( map );
    this._map = map;
  }

  /**
   * @returns {WorldMap}
   */
  get map () {
    return this._map;
  }
}
