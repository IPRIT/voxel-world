import { WORLD_MAP_CHUNK_HEIGHT, WORLD_MAP_CHUNK_SIZE_POWER } from "../../settings";
import { hasBit, lowestMaxBit, powers } from "../../utils";

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
   * Each element of array represents a sequence of bits - column of blocks [0, 31].
   * 1 - is impassable block, 0 - passable
   * @type {Uint32Array}
   * @private
   */
  _map = null;

  /**
   * @param {THREE.Vector3} objectSize
   * @param {Uint32Array} heightMap
   */
  constructor (objectSize, heightMap) {
    this._bufferSize = objectSize.x * objectSize.z;
    this._objectSize = objectSize;
    this._init( heightMap );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  hasBlock (x, y, z) {
    return !!this._hasBit( (x << WORLD_MAP_CHUNK_SIZE_POWER) + z, y );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  addBlock (x, y, z) {
    this._setBit( (x << WORLD_MAP_CHUNK_SIZE_POWER) + z, y );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  removeBlock (x, y, z) {
    this._unsetBit( (x << WORLD_MAP_CHUNK_SIZE_POWER) + z, y );
  }

  /**
   * This method is faster than getMinMaxBlock2 relying on the performance test
   *
   * @param {number} x
   * @param {number} z
   * @returns {number}
   */
  getMinMaxBlock (x, z) {
    let column = this.getColumn( x, z );
    let minMaxY = 0, minY = -1;
    for (let y = 0; y < WORLD_MAP_CHUNK_HEIGHT; ++y) {
      if (hasBit( column, y )) {
        minMaxY = y;
        if (minY === -1) {
          minY = y;
        }
      } else if (minY >= 0) {
        break;
      }
    }
    return minMaxY;
  }

  /**
   * @param {number} x
   * @param {number} z
   * @returns {number}
   */
  getMinMaxBlock2 (x, z) {
    let column = this.getColumn( x, z );
    if (!column) {
      return 0;
    }
    let minMax = lowestMaxBit( column );
    if (minMax < 0) {
      return 30; // lowestMaxBit returns negative value when log2 is 30 (single case)
    }
    // lowestMaxBit returns zero when power of 2 is 31 (single case)
    return minMax === 0 ? 31 : powers.powersOfTwoInv[ minMax ]; // minMax always power of 2
  }

  /**
   * @param {number} x
   * @param {number} z
   * @param {number} fromY
   * @param {number} toY
   * @returns {number}
   */
  getMinMaxBlockBetween (x, z, fromY, toY) {
    let column = this.getColumn( x, z );
    let minMaxY = fromY, minY = -1;
    for (let y = fromY; y < toY; ++y) {
      if (hasBit( column, y )) {
        minMaxY = y;
        if (minY === -1) {
          minY = y;
        }
      } else if (minY >= 0) {
        break;
      }
    }
    return minMaxY;
  }

  /**
   * @param {number} x
   * @param {number} z
   * @returns {number}
   */
  getColumn (x, z) {
    return this._map[ (x << WORLD_MAP_CHUNK_SIZE_POWER) + z ];
  }

  /**
   * @returns {THREE.Vector3}
   */
  get size () {
    return this._objectSize;
  }

  /**
   * @returns {Uint32Array}
   */
  get map () {
    return this._map;
  }

  /**
   * @param {Uint32Array|null} heightMap
   * @private
   */
  _init (heightMap = null) {
    if (heightMap) {
      this._map = heightMap;
    } else {
      this._map = new Uint32Array( this._bufferSize );
    }
  }

  /**
   * @param {number} arrayOffset
   * @param {number} index
   * @returns {number} 0 or 1
   * @private
   */
  _hasBit (arrayOffset, index) {
    return this._map[ arrayOffset ] & (1 << index);
  }

  /**
   * @param {number} arrayOffset
   * @param {number} index
   * @private
   */
  _setBit (arrayOffset, index) {
    this._map[ arrayOffset ] |= 1 << index;
  }

  /**
   * @param {number} arrayOffset
   * @param {number} index
   * @private
   */
  _unsetBit (arrayOffset, index) {
    this._map[ arrayOffset ] &= ~(1 << index);
  }
}
