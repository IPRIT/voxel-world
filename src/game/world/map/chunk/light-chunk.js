import { Chunk } from "./chunk";
import { powers, hasBit } from "../../../utils/game-utils";
import {
  WORLD_MAP_CHUNK_COLUMN_CAPACITY, WORLD_MAP_CHUNK_HEIGHT,
  WORLD_MAP_CHUNK_SIZE, WORLD_MAP_CHUNK_SIZE_POWER
} from "../../../settings";

const bufferPartLength = WORLD_MAP_CHUNK_SIZE ** 2;

export class LightChunk extends Chunk {

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
   * @returns {number}
   */
  getBlock (x, y, z) {
    return +this.hasBlock( x, y, z );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {null} color
   */
  addBlock (x, y, z, color = null) {
    if (!this.isInside( x, y, z )) {
      return;
    }

    if (y % 10 === 0 && this.buffer[ this.getBufferOffset( x, 36, z ) ]) {
      // console.log( this.getColumn( x, z ) );
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
  removeBlock (x, y, z) {
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
    return this.buffer.slice( bufferOffset, bufferOffset + WORLD_MAP_CHUNK_COLUMN_CAPACITY );
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
      + ( y >> 5 ) * bufferPartLength
      + z;
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
   * @returns {number}
   * @override
   */
  get bufferSize () {
    return bufferPartLength * WORLD_MAP_CHUNK_COLUMN_CAPACITY;
  }

  /**
   * @param {number} bufferOffset
   * @param {number} bitPosition
   * @returns {number} 0 or 1
   * @private
   */
  _hasBit (bufferOffset, bitPosition) {
    return this.buffer[ bufferOffset ] & powers.powersOfTwo[ bitPosition ];
  }

  /**
   * @param {number} bufferOffset
   * @param {number} bitPosition
   * @private
   */
  _setBit (bufferOffset, bitPosition) {
    this.buffer[ bufferOffset ] |= powers.powersOfTwo[ bitPosition ];
  }

  /**
   * @param {number} bufferOffset
   * @param {number} bitPosition
   * @private
   */
  _unsetBit (bufferOffset, bitPosition) {
    this.buffer[ bufferOffset ] &= ~powers.powersOfTwo[ bitPosition ];
  }
}
