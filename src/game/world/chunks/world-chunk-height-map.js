export class WorldChunkHeightMap {

  /**
   * @type {number}
   * @private
   */
  _bufferSize = 0;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _objectSize = null;

  /**
   * @type {Uint8Array}
   * @private
   */
  _map = null;

  /**
   * @param {THREE.Vector3} objectSize
   */
  constructor (objectSize) {
    this._bufferSize = objectSize.x * objectSize.z;
    this._objectSize = objectSize;
    this._init();
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  updateHeight ({ x, y, z }) {
    let bufferOffset = this.bufferOffset( x, z );
    this._map[ this.bufferOffset( x, z ) ] = Math.min(
      (1 << 8) - 1,
      Math.max(y, this._map[ bufferOffset ])
    );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number}
   */
  getHeight ({ x, y, z }) {
    return this._map[ this.bufferOffset( x, z ) ];
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  resetHeight ({ x, y, z }) {
    this._map[ this.bufferOffset( x, z ) ] = 0;
  }

  /**
   * @param {number} x
   * @param {number} z
   * @returns {number}
   */
  bufferOffset (x, z) {
    return x * this.size.z + z;
  }

  /**
   * @returns {THREE.Vector3}
   */
  get size () {
    return this._objectSize;
  }

  /**
   * @returns {Uint8Array}
   */
  get map () {
    return this._map;
  }

  /**
   * @private
   */
  _init () {
    this._map = new Uint8Array( this._bufferSize );
  }
}
