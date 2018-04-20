export class WorldMapCache {

  /**
   * @type {number}
   * @private
   */
  _maxEntriesNumber = 0;

  /**
   * @type {*}
   * @private
   */
  _cache = {};

  /**
   * @type {string[]}
   * @private
   */
  _cacheHistory = [];

  /**
   * @param {number} maxEntriesNumber
   */
  constructor (maxEntriesNumber) {
    this._maxEntriesNumber = maxEntriesNumber;
  }

  /**
   * @param {string} key
   * @returns {WorldObject|null}
   */
  getEntry (key) {
    return this._cache[ key ] || null;
  }

  /**
   * @param {string} key
   * @param {WorldObject} chunk
   * @returns {WorldMapCache}
   */
  addEntry (key, chunk) {
    if (!this.hasEntry( key )) {
      this._cache[ key ] = chunk;
      this._cacheHistory.push( key );
    }
    while (this._cacheHistory.length > this._maxEntriesNumber) {
      this.removeEntry( this._cacheHistory.shift() );
    }
    return this;
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  hasEntry (key) {
    return !!this._cache[ key ];
  }

  /**
   * @param {string} key
   * @returns {WorldMapCache}
   */
  removeEntry (key) {
    if (this.hasEntry( key )) {
      this._cache[ key ].remove && this._cache[ key ].remove();
      this._cache[ key ] = null;
      delete this._cache[ key ];
    }
    return this;
  }

  /**
   * @returns {number}
   */
  get size () {
    return Object.keys( this._cache || {} ).length;
  }
}
