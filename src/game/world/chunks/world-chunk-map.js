import { WorldChunkBase } from "./world-chunk-base";
import { WorldChunkType } from "./world-chunk-type";

export const WORLD_MAP_CHUNK_SIZE = 1 << 5;
export const WORLD_MAP_CHUNK_HEIGHT = 1 << 6;

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

  constructor (model, { worldPosition }) {
    super(model);
    this.setType(WorldChunkType.MAP_CHUNK);
    this.setWorldPosition(worldPosition);
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
   * @param {THREE.Vector3} worldPosition
   * @returns {THREE.Vector3}
   * @private
   */
  _getChunkRelativePosition (worldPosition) {
    return worldPosition.add( this.fromPosition.negate() );
  }

  /**
   * @param {number} axisValue
   * @returns {number}
   * @private
   */
  _getChunkRelativeAxis (axisValue) {
    return (axisValue / WORLD_MAP_CHUNK_SIZE) | 0;
  }
}
