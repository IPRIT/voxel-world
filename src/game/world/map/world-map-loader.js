import { WorldMapCache } from "./world-map-cache";
import { WORLD_MAP_SIZE } from "../world-map";

function getY2(x, z) {
  x -= WORLD_MAP_SIZE / 2;
  z -= WORLD_MAP_SIZE / 2;
  x /= WORLD_MAP_SIZE / 5;
  z /= WORLD_MAP_SIZE / 5;
  return Math.sin(x ** 2 + 0.1 * z ** 2) / (0.1 + Math.sqrt(x ** 2 + 2 * z ** 2) ** 2) + (x ** 2 + 1.9 * z ** 2) * Math.exp(1 - Math.sqrt(x ** 2 + 2 * z ** 2) ** 2) / 4.0 * 80 + 3;
}

function model(x, z) {
  let y = getY2(x, z) | 0;
  return [{ x, y, z }, [ 200, (y * 10) % 256, 100 ]];
}

export class WorldMapLoader {

  /**
   * @type {WorldMapLoader}
   * @private
   */
  static _instance = null;

  /**
   * @type {WorldMapCache}
   * @private
   */
  _cache = null;

  constructor () {
    this._init();
  }

  /**
   * @returns {WorldMapLoader}
   */
  static getLoader () {
    if (this._instance) {
      return this._instance;
    }
    return (this._instance = new WorldMapLoader());
  }

  /**
   * @param {string} chunkIndex
   */
  async load (chunkIndex) {
    if (this._cache.hasEntry( chunkIndex )) {
      console.log('Cache hit for chunk:', chunkIndex);
      return {
        cached: true,
        worldObject: this._cache.getEntry( chunkIndex )
      };
    }
    console.log('Chunk loading:', chunkIndex);
    return new Promise((resolve, reject) => {
      setTimeout(_ => resolve({
        cached: false,
        model
      }), 50 * Math.random() + 50);
    });
  }

  /**
   * @param {string} chunkIndex
   * @param {WorldObject} chunk
   */
  addToCache (chunkIndex, chunk) {
    this._cache.addEntry( chunkIndex, chunk );
  }

  /**
   * @returns {number}
   */
  get cacheSize () {
    return this._cache && this._cache.size || 0;
  }

  /**
   * @private
   */
  _init () {
    this._cache = new WorldMapCache( 500 );
  }
}
