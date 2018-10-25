import { Chunk } from "./chunk";
import { LightChunk } from "./light-chunk";
import { rgbToInt } from "../../../utils";
import {
  WORLD_MAP_CHUNK_HEIGHT_POWER,
  WORLD_MAP_CHUNK_SIZE_POWER
} from "../../../settings";

export class HeavyChunk extends Chunk {

  /**
   * @type {boolean}
   */
  needsUpdate = false;

  /**
   * @type {boolean}
   * @private
   */
  _hasLightChunk = false;

  /**
   * @type {LightChunk}
   * @private
   */
  _lightChunk = null;

  /**
   * @param {boolean} withLightChunk
   */
  constructor (withLightChunk = true) {
    super();

    this._hasLightChunk = withLightChunk;
    if (withLightChunk) {
      this._lightChunk = new LightChunk();
    }
  }

  /**
   * @param {VoxModel|Function} model
   * @param {{ x: number, z: number }} position
   */
  createFrom (model, position) {
    if (this._hasLightChunk) {
      this._lightChunk.setPosition( position.x, position.z );
      this._lightChunk.createBuffer();
    }

    super.createFrom( model, position );
  }

  /**
   * @returns {boolean}
   */
  hasBlock (x, y, z) {
    if (!this.isInside( x, y, z )) {
      return false;
    }

    return !!this.buffer[
      this.getBufferOffset( x, y, z )
    ];
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number}
   */
  getBlock (x, y, z) {
    if (!this.isInside( x, y, z )) {
      return 0;
    }

    return this.buffer[
      this.getBufferOffset( x, y, z )
    ];
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {Array<number>|number} color
   */
  addBlock (x, y, z, color = []) {
    if (!this.isInside( x, y, z )) {
      return;
    }

    if (typeof color !== 'number') {
      color = Array.isArray( color ) ? rgbToInt( color ) : 0;
    }

    const bufferOffset = this.getBufferOffset( x, y, z );
    this.buffer[ bufferOffset ] = color;
    this.needsUpdate = true;

    if (this._hasLightChunk) {
      this._lightChunk.addBlock( x, y, z );
    }
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

    const bufferOffset = this.getBufferOffset( x, y, z );
    this.buffer[ bufferOffset ] = 0;
    this.needsUpdate = true;

    if (this._hasLightChunk) {
      this._lightChunk.removeBlock( x, y, z );
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number}
   */
  getBufferOffset (x, y, z) {
    return ((x << WORLD_MAP_CHUNK_HEIGHT_POWER) << WORLD_MAP_CHUNK_SIZE_POWER)
      + (y << WORLD_MAP_CHUNK_SIZE_POWER)
      + z;
  }

  /**
   * Reset faces
   */
  resetFaces () {
    // resetting last 6 bits of block (faces bits)
    for (let i = 0; i < this.buffer.length; ++i) {
      this.buffer[ i ] &= 0xFFFFFFC0; // 11111111111111111111111111000000
    }
  }

  /**
   * @returns {number}
   */
  get bufferSize () {
    const { x, y, z } = this.size;
    return x * y * z;
  }

  /**
   * @returns {LightChunk}
   */
  get lightChunk () {
    return this._lightChunk;
  }
}
