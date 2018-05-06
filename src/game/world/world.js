import { WorldMap } from "./map/world-map";
import { PlayerMe } from "../living-object/player/me/player-me";
import { PlayerClassType } from "../living-object/player/player-class-type";
import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE } from "../settings";

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

    me.position.set(
      16353.944446908708, 2, 16356.723378763674
    );

    me.init({
      classType: PlayerClassType.MYSTIC
    });

    game._transformControl = new THREE.TransformControls( game._activeCamera, game._renderer.domElement );
    game._transformControl.attach( me );
    this._game.scene.add( game._transformControl );
    this._game.scene.add( me );
  }

  update (deltaTime) {
    if (this._me) {
      this._me.update( deltaTime );
      this.map.updateAtPosition( this._me.position.clone().divideScalar( WORLD_MAP_BLOCK_SIZE ) );
    }

    game._transformControl.update();
  }

  /**
   * @returns {WorldMap}
   */
  get map () {
    return this._map;
  }

  /**
   * @returns {PlayerMe}
   */
  get me () {
    return this._me;
  }
}
