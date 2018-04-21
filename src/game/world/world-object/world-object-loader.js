import Promise from 'bluebird';
import { WorldObjectCache } from "../world-object/world-object-cache";
import { Vox } from "../../vox";

export class WorldObjectLoader {

  /**
   * @type {WorldObjectCache}
   * @private
   */
  _cache = null;

  /**
   * @type {number}
   * @private
   */
  _maxCacheEntries = 0;

  constructor (maxCacheEntries = 0) {
    this._maxCacheEntries = maxCacheEntries;
    this._init();
  }

  /**
   * @param {string|number} fileIndex
   * @param {string} fileUrl
   * @param {number} attemptsNumber
   * @returns {Promise<{cached: boolean, worldObject?: WorldObject, model?: VoxModel}>}
   */
  async load (fileIndex, fileUrl, attemptsNumber = 15) {
    if (this._cache.hasEntry( fileIndex )) {
      console.log('Cache hit:', fileIndex);
      return {
        cached: true,
        worldObject: this._cache.getEntry( fileIndex )
      };
    }
    return {
      cached: false,
      // model: await Promise.resolve().delay(50 * Math.random() + 50).then(_ => commonModel)
      model: await this._tryLoad(fileUrl, attemptsNumber)
    };
  }

  /**
   * @param {string} objectIndex
   * @param {WorldObject} worldObject
   */
  addToCache (objectIndex, worldObject) {
    this._cache.addEntry( objectIndex, worldObject );
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
    this._cache = new WorldObjectCache( this._maxCacheEntries );
  }

  /**
   * @param {string} fileUrl
   * @param {number} attemptsNumber
   * @returns {Promise<VoxModel|null>}
   * @private
   */
  async _tryLoad (fileUrl, attemptsNumber = 3) {
    let vox;
    let attempt = 0;
    while (attempt < attemptsNumber) {
      vox = new Vox();
      try {
        console.log(`Try to load model [attempt: ${attempt}]: ${fileUrl}`);
        await vox.load( fileUrl );
        return vox.model;
      } catch (e) {
        attempt++;
        await Promise.delay(125 * Math.min(10, attempt) ** 2 + 500);
      }
    }
    return null;
  }
}
