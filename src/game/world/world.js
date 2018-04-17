import { Vox, VoxType } from "../vox";
import { WORLD_MAP_SIZE, WorldMap } from "./world-map";
import { WORLD_MAP_CHUNK_HEIGHT } from "./chunks";
import { rgbToInt } from "../utils";

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
   * @param {Game} game
   */
  constructor (game) {
    this._game = game;
  }

  async init () {
    this._map = new WorldMap();
    let map = this._map;

    const voxChunk = new Vox();

    try {
      await voxChunk.load('/resources/models/world-chunk-1.vox', VoxType.TYPE_MAP);
    } catch (e) {
      console.log(e);
    }

    map.init( voxChunk.model );

    console.log(map);

    this._game.scene.add( map );

    function getY(x, z) {
      return Math.ceil(Math.cos(x / 20) * Math.sin(z / 20) * 10) + 10;
    }

    for (let x = 0; x < WORLD_MAP_SIZE; ++x) {
      for (let y = 0; y < WORLD_MAP_CHUNK_HEIGHT; ++y) {
        for (let z = 0; z < WORLD_MAP_SIZE; ++z) {
          let y = getY(x, z);
          if (map.inside(x, y, z)) {
            map.addBlock({ x, y, z }, rgbToInt([ 100, 200, 100 ]));
          }
        }
      }
    }
  }

  /**
   * @returns {WorldMap}
   */
  get map () {
    return this._map;
  }
}
