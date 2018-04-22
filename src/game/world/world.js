import { WorldMap } from "./map/world-map";
import { PlayerMe } from "../player/me/player-me";
import { PlayerClassType } from "../player/player-class-types";
import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE } from "./map";

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

    me.init({
      classType: PlayerClassType.MYSTIC
    }).then(_ => {
      console.log('Me:', me);
      me.position.set(WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE + 2, 2.4, WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE);
      this._game.scene.add( me );
    });
  }

  update () {
    if (this._me) {
      this._me.update();
      // this._me.position.x += -.2;
      this._me.position.z -= .2;
      this.map.updateAtPosition( this._me.position.clone().divideScalar( WORLD_MAP_BLOCK_SIZE ) );
      // this._me.rotation.y += .01;
    }
  }

  /**
   * @returns {WorldMap}
   */
  get map () {
    return this._map;
  }
}
