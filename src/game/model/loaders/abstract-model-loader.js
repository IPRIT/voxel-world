import Promise from 'bluebird';
import { EntityCache } from "../../utils/entity-cache";

export class AbstractModelLoader {

  /**
   * @type {EntityCache}
   * @private
   */
  _cache = null;

  /**
   * @type {number}
   * @private
   */
  _maxCacheEntities = 0;

  /**
   * @param {number} maxCacheEntities
   */
  constructor (maxCacheEntities = 0) {
    this._maxCacheEntities = maxCacheEntities;
    this._init();
  }

  /**
   * @param {string|number} fileIndex
   * @param {string} fileUrl
   * @param {number} attemptsNumber
   * @returns {Promise<{cached: boolean, model: *}>}
   */
  async load (fileIndex, fileUrl, attemptsNumber = 15) {
    if (this._cache.hasEntity( fileIndex )) {
      console.log('Cache hit:', fileIndex);
      return {
        cached: true,
        model: this._cache.getEntity( fileIndex )
      };
    }
    return {
      cached: false,
      model: await this.tryLoad(fileUrl, attemptsNumber)
    };
  }

  /**
   * @abstract
   * @param {string} fileUrl
   * @param {number} attemptsNumber
   * @returns {Promise<*>}
   */
  async tryLoad (fileUrl, attemptsNumber = 3) {
    return null;
  }

  /**
   * @param {function} asyncAction
   * @param {number} attemptsNumber
   * @returns {Promise<*>}
   */
  async tryUntil (asyncAction, attemptsNumber) {
    let attempts = 0;

    while (attempts < attemptsNumber) {
      try {
        let result = await asyncAction(attempts);
        return result;
      } catch (e) {
        console.error('Model load error:', e);
        attempts++;
        await Promise.delay(125 * Math.min(10, attempts) ** 2 + 500);
      }
    }
  }

  /**
   * @param {string} objectIndex
   * @param {*} object
   */
  addToCache (objectIndex, object) {
    this._cache.addEntity( objectIndex, object );
  }

  /**
   * @returns {EntityCache}
   */
  get cache () {
    return this._cache;
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
    this._cache = new EntityCache( this._maxCacheEntities );
  }
}
