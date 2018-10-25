import {
  WORLD_MAP_CHUNK_HEIGHT,
  WORLD_MAP_CHUNK_SIZE,
  WORLD_MAP_CHUNK_SIZE_POWER,
  WORLD_MAP_CHUNK_SIZE_VECTOR
} from "../../../settings";
import { buildChunkIndex } from "../../../utils";

const chunkSizeVector = WORLD_MAP_CHUNK_SIZE_VECTOR;

export class Chunk {

  /**
   * @type {boolean}
   * @private
   */
  _inited = false;

  /**
   * @type {VoxModel}
   * @private
   */
  _model = null;

  /**
   * @type {{x: number, y: number, z: number}}
   * @private
   */
  _chunkSize = { x: chunkSizeVector[0], y: chunkSizeVector[1], z: chunkSizeVector[2] };

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
   * @param {VoxModel} model
   * @param {number} x
   * @param {number} z
   */
  createFrom (model, { x, z } = {}) {
    this.setPosition( x, z );
    this.createBuffer();

    this._fillFromModel( model );

    this._inited = true;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  hasBlock (x, y, z) {
    throw new Error( 'Not implemented' );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number|boolean}
   */
  getBlock (x, y, z) {
    throw new Error( 'Not implemented' );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {Array<number>|*} color
   */
  addBlock (x, y, z, color = null) {
    throw new Error( 'Not implemented' );
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  removeBlock (x, y, z) {
    throw new Error( 'Not implemented' );
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
   * Computes buffer offset
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number}
   */
  getBufferOffset (x, y, z) {
    return 0;
  }

  /**
   * @param {number} x
   * @param {number} z
   */
  setPosition (x, z) {
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
   * @returns {Uint32Array}
   */
  createBuffer () {
    return ( this._buffer = new Uint32Array( this.bufferSize ) );
  }

  /**
   * @param {Uint32Array} buffer
   */
  repairBuffer (buffer) {
    this._buffer = buffer;
  }

  /**
   * Dispose chunk buffer
   */
  disposeBuffer () {
    this._buffer = null;
  }

  /**
   * @returns {boolean}
   */
  get isInited () {
    return this._inited || this._buffer.length > 0;
  }

  /**
   * @returns {number}
   * @override
   */
  get bufferSize () {
    return 0;
  }

  /**
   * @returns {VoxModel}
   */
  get model () {
    return this._model;
  }

  /**
   * @returns {Uint32Array}
   */
  get buffer () {
    return this._buffer;
  }

  /**
   * @returns {{x: number, y: number, z: number}}
   */
  get size () {
    return this._chunkSize;
  }

  /**
   * @returns {string}
   */
  get chunkIndex () {
    return buildChunkIndex( this._chunkIndexX, this._chunkIndexZ );
  }

  /**
   * @returns {THREE.Vector3}
   */
  get fromPosition () {
    return new THREE.Vector3(
      this._fromX,
      this._fromY,
      this._fromZ
    );
  }

  /**
   * @returns {THREE.Vector3}
   */
  get toPosition () {
    return new THREE.Vector3(
      this._toX,
      this._toY,
      this._toZ
    );
  }

  /**
   * @returns {boolean}
   */
  get isFunctionModel () {
    return typeof this._model === 'function';
  }

  /**
   * @param {VoxModel|Function} model
   * @private
   */
  _fillFromModel (model) {
    if (this.isFunctionModel) {
      return this._fillFromFunctionModel();
    }

    const blocks = model.getBlocks();

    for (let i = 0; i < blocks.length; ++i) {
      const { x, y, z, color = null } = blocks[ i ];
      this.addBlock( x, y, z, color );
    }
  }

  /**
   * @private
   */
  _fillFromFunctionModel () {
    const model = this._model;

    // build chunk by function
    let offsets = this.fromPosition;
    for (let x = 0; x < this.size.x; ++x) {
      for (let z = 0; z < this.size.z; ++z) {
        let [ { x, y, z }, color ] = model(x + offsets.x, z + offsets.z);
        x -= offsets.x;
        z -= offsets.z;
        this.addBlock( x, y, z, color );
      }
    }
  }
}
