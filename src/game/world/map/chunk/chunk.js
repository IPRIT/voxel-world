import { powers } from "../../../utils/game-utils";
import {
  WORLD_MAP_CHUNK_HEIGHT,
  WORLD_MAP_CHUNK_HEIGHT_POWER,
  WORLD_MAP_CHUNK_SIZE,
  WORLD_MAP_CHUNK_SIZE_POWER,
  WORLD_MAP_CHUNK_SIZE_VECTOR
} from "../../../settings";
import { hasBit } from "../../../utils";

const COLUMN_CAPACITY = 2 ** Math.max(0, WORLD_MAP_CHUNK_HEIGHT_POWER - 5 );

export class Chunk {

  /**
   * @type {VoxModel}
   * @private
   */
  _model = null;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _chunkSize = new THREE.Vector3( ...WORLD_MAP_CHUNK_SIZE_VECTOR );

  /**
   * @type {Uint32Array}
   * @private
   */
  _buffer = new Uint32Array( 0 );

  /**
   * @type {number}
   * @private
   */
  _chunkIndexX = 0;

  /**
   * @type {number}
   * @private
   */
  _chunkIndexY = 0;

  /**
   * @type {number}
   * @private
   */
  _chunkIndexZ = 0;

  /**
   * @type {number}
   * @private
   */
  _fromX = 0;

  /**
   * @type {number}
   * @private
   */
  _fromY = 0;

  /**
   * @type {number}
   * @private
   */
  _fromZ = 0;

  /**
   * @type {number}
   * @private
   */
  _toX = 0;

  /**
   * @type {number}
   * @private
   */
  _toY = 0;

  /**
   * @type {number}
   * @private
   */
  _toZ = 0;

  /**
   * @type {boolean}
   * @private
   */
  _inited = false;

  /**
   * @type {number}
   * @private
   */
  _voxBlocksNumber = 0;

  /**
   * @type {number}
   * @private
   */
  _triangles = 0;

  /**
   * @type {boolean}
   */
  needsUpdate = false;

  /**
   * @type {number}
   */
  previousVerticesLength = 0;

  /**
   * @type {number}
   */
  currentBlocks = 0;

  /**
   * @type {number}
   */
  startingBlocks = 0;

  /**
   * @param {VoxModel} model
   * @param {number} x
   * @param {number} z
   */
  createFrom (model, { x, z }) {
    this._fillFromModel( model );
    this._setPosition( x, z );
  }

  /**
   * Computes buffer offset
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number}
   */
  getBufferOffset (x, y, z) {
    return ( x << WORLD_MAP_CHUNK_SIZE_POWER )
      + ( y >> 5 )
      + z;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  hasBlock (x, y, z) {
    if (!this.isInside( x, y, z )) {
      return false;
    }

    return !!this._hasBit(
      this.getBufferOffset( x, y, z ),
      y & 0x1f
    );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  addBlock (x, y, z) {
    if (!this.isInside( x, y, z )) {
      return;
    }

    this._setBit(
      this.getBufferOffset( x, y, z ),
      y & 0x1f
    );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  deleteBlock (x, y, z) {
    if (!this.isInside( x, y, z )) {
      return;
    }

    this._unsetBit(
      this.getBufferOffset( x, y, z ),
      y & 0x1f
    );
  }

  /**
   * @param {number} x
   * @param {number} z
   * @returns {Uint32Array|*}
   */
  getColumn (x, z) {
    if (!this.isInside( x, 0, z )) {
      return new Uint32Array( 0 );
    }

    const bufferOffset = this.getBufferOffset( x, 0, z );
    return this._buffer.slice( bufferOffset, bufferOffset + COLUMN_CAPACITY );
  }

  /**
   * @param {number} x
   * @param {number} z
   * @returns {number}
   */
  getMinMaxY (x, z) {
    return this.getMinMaxYBetween( x, z, 0, WORLD_MAP_CHUNK_HEIGHT - 1 );
  }

  /**
   * Works correctly
   *
   * @param {number} x
   * @param {number} z
   * @param {number} fromY
   * @param {number} toY
   * @returns {number}
   */
  getMinMaxYBetween (x, z, fromY, toY) {
    if (!this.isInside( x, 0, z )) {
      return 0;
    }

    let column = this.getColumn( x, z );
    let minMaxY = 0, minY = -1;

    fromY = Math.max( fromY, 0 );
    toY = Math.min( toY, WORLD_MAP_CHUNK_HEIGHT - 1 );

    const minColumn = Math.max( fromY >> 5, 0 );
    const maxColumn = Math.min( toY >> 5, column.length - 1 );

    l1: for (let columnOffset = minColumn; columnOffset <= maxColumn; ++columnOffset) {
      const value = column[ columnOffset ];

      for (let y = fromY & 0x1f; y <= ( toY & 0x1f ); ++y) {
        if (hasBit( value, y )) {
          minMaxY = columnOffset * 0x20 + y;
          if (minY === -1) {
            minY = columnOffset * 0x20 + y;
          }
        } else if (minY >= 0) {
          break l1;
        }
      }
    }

    return minMaxY;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  isInside (x, y, z) {
    return x >= 0 && x < WORLD_MAP_CHUNK_SIZE
      && z >= 0 && z < WORLD_MAP_CHUNK_SIZE
      && y >= 0 && y < WORLD_MAP_CHUNK_HEIGHT;
  }

  /**
   * @returns {number}
   * @override
   */
  get bufferSize () {
    return ( WORLD_MAP_CHUNK_SIZE ** 2 ) * COLUMN_CAPACITY;
  }

  /**
   * @returns {VoxModel}
   */
  get model () {
    return this._model;
  }

  /**
   * @param {VoxModel} model
   * @private
   */
  _fillFromModel (model) {
    const blocks = model.getBlocks();

    for (let i = 0; i < blocks.length; ++i) {
      const { x, y, z } = blocks[ i ];
      this.addBlock( x, y, z );
    }
  }

  /**
   * @param {number} x
   * @param {number} z
   * @private
   */
  _setPosition (x, z) {
    this._chunkIndexX = x >> WORLD_MAP_CHUNK_SIZE_POWER;
    this._chunkIndexY = 0;
    this._chunkIndexZ = z >> WORLD_MAP_CHUNK_SIZE_POWER;

    this._fromX = this._chunkIndexX * WORLD_MAP_CHUNK_SIZE;
    this._fromY = 0;
    this._fromZ = this._chunkIndexZ * WORLD_MAP_CHUNK_SIZE;

    this._toX = this._fromX + WORLD_MAP_CHUNK_SIZE;
    this._toY = this._fromY + WORLD_MAP_CHUNK_HEIGHT;
    this._toZ = this._fromZ + WORLD_MAP_CHUNK_SIZE;
  }

  /**
   * @param {number} bufferOffset
   * @param {number} bitPosition
   * @returns {number} 0 or 1
   * @private
   */
  _hasBit (bufferOffset, bitPosition) {
    return this._buffer[ bufferOffset ] & powers.powersOfTwo[ bitPosition ];
  }

  /**
   * @param {number} bufferOffset
   * @param {number} bitPosition
   * @private
   */
  _setBit (bufferOffset, bitPosition) {
    this._buffer[ bufferOffset ] |= powers.powersOfTwo[ bitPosition ];
  }

  /**
   * @param {number} bufferOffset
   * @param {number} bitPosition
   * @private
   */
  _unsetBit (bufferOffset, bitPosition) {
    this._buffer[ bufferOffset ] &= ~powers.powersOfTwo[ bitPosition ];
  }
}
