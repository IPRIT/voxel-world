import { WorldChunkBase } from "./world-chunk-base";
import { WorldChunkType } from "./world-chunk-type";
import {
  WORLD_MAP_CHUNK_HEIGHT,
  WORLD_MAP_CHUNK_SIZE
} from "../../settings";

export class WorldChunkMap extends WorldChunkBase {

  _chunkIndexX = 0;
  _chunkIndexY = 0;
  _chunkIndexZ = 0;

  _fromX = 0;
  _fromY = 0;
  _fromZ = 0;

  _toX = 0;
  _toY = 0;
  _toZ = 0;

  /**
   * @param {VoxModel|function|null} model
   * @param {THREE.Vector3} worldPosition
   */
  constructor (model, { worldPosition }) {
    super( model );
    this.setType( WorldChunkType.MAP_CHUNK );
    this.setWorldPosition( worldPosition );
  }

  /**
   * Builds map chunk by function or vox model
   */
  buildModel () {
    if (!this.model) {
      return;
    }
    const isModelFunction = typeof this.model === 'function';
    if (isModelFunction) {
      this._buildModelByFunction();
    } else {
      super.buildModel();
    }
  }

  /**
   * @param {THREE.Vector3} position
   */
  setWorldPosition (position) {
    let { x, z } = position;
    this._chunkIndexX = (x / WORLD_MAP_CHUNK_SIZE) | 0;
    this._chunkIndexY = 0;
    this._chunkIndexZ = (z / WORLD_MAP_CHUNK_SIZE) | 0;

    this._fromX = this._chunkIndexX * WORLD_MAP_CHUNK_SIZE;
    this._fromY = 0;
    this._fromZ = this._chunkIndexZ * WORLD_MAP_CHUNK_SIZE;

    this._toX = this._fromX + WORLD_MAP_CHUNK_SIZE;
    this._toY = this._fromY + WORLD_MAP_CHUNK_HEIGHT;
    this._toZ = this._fromZ + WORLD_MAP_CHUNK_SIZE;
  }

  /**
   * @param x
   * @param y
   * @param z
   */
  computeWorldPosition ({ x, y, z }) {
    return {
      x: x + this._fromX,
      y: y + this._fromY,
      z: z + this._fromZ
    };
  }

  /**
   * Check world coordinates
   * @param {number|THREE.Vector3} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  absoluteInside (x, y, z) {
    if (typeof x === 'object') {
      const position = x;
      x = position.x;
      y = position.y;
      z = position.z;
    }
    let limits = {
      x: [this._fromX, this._toX],
      y: [this._fromY, this._toY],
      z: [this._fromZ, this._toZ]
    };
    return x > limits.x[0] && x < limits.x[1] &&
      y >= limits.y[0] && y < limits.y[1] &&
      z > limits.z[0] && z < limits.z[1];
  }

  /**
   * @returns {string}
   */
  get mapChunkIndex () {
    return `${this._chunkIndexX}|${this._chunkIndexZ}`;
  }

  /**
   * @returns {{x: number, y: number, z: number}}
   */
  get size () {
    return {
      x: WORLD_MAP_CHUNK_SIZE,
      y: WORLD_MAP_CHUNK_HEIGHT,
      z: WORLD_MAP_CHUNK_SIZE
    }
  }

  /**
   * @returns {number}
   * @override
   */
  get bufferSize () {
    return (WORLD_MAP_CHUNK_SIZE ** 2) * WORLD_MAP_CHUNK_HEIGHT;
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
   * @private
   */
  _buildModelByFunction () {
    const model = this.model;

    // build chunk by function
    let offsets = this.fromPosition;
    for (let x = 0; x < this.size.x; ++x) {
      for (let z = 0; z < this.size.z; ++z) {
        let [ position, color ] = model(x + offsets.x, z + offsets.z);
        position.x -= offsets.x;
        position.z -= offsets.z;
        this.addBlock( position, color );
      }
    }
  }
}
