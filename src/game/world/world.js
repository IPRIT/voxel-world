import { WorldMap } from "./map/world-map";
import { PlayerMe } from "../player/me/player-me";
import { PlayerClassType } from "../player/player-class-types";

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
   * @type {PlayerMe}
   * @private
   */
  _me = null;

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

    let me = new PlayerMe();
    this._me = me;
    console.log(me);
    me.init({
      classType: PlayerClassType.MYSTIC
    }).then(_ => {
      me.position.setY(10);
      this._game.scene.add( me );
    });
  }

  /**
   * @returns {WorldMap}
   */
  get map () {
    return this._map;
  }
}
