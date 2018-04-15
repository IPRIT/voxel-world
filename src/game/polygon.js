import { WORLD_BLOCK_SIZE, WORLD_CHUNK_SIZE, WORLD_SIZE } from "./world";

export class Polygon {

  /**
   * @type {Game}
   * @private
   */
  _game = null;

  constructor (game) {
    this._game = game;
  }

  debugVoxModel (voxData) {
    console.log(voxData);
  }
}
