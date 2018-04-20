import { Vox, VoxType } from "../vox";
import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE, WorldMap } from "./world-map";
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
    map.init();
    this._game.scene.add( map );

    // const voxChunk = new Vox();

    try {
      // await voxChunk.load('/resources/models/world-chunk-1.vox', VoxType.TYPE_MAP);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * @returns {WorldMap}
   */
  get map () {
    return this._map;
  }
}
