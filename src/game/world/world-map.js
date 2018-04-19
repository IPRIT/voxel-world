import {
  WORLD_MAP_CHUNK_HEIGHT,
  WORLD_MAP_CHUNK_SIZE,
  WORLD_MAP_CHUNK_SIZE_VECTOR,
  WORLD_MAP_CHUNK_VIEW_DISTANCE
} from "./chunks";
import { WorldObject, WorldObjectType } from "./world-object";
import { resetDecimal } from "../utils";

export const WORLD_MAP_SIZE = 1 << 8;
export const WORLD_MAP_BLOCK_SIZE = 2;

export class WorldMap extends THREE.Group {

  /**
   * @type {Map<string, WorldObject>}
   * @private
   */
  _map = new Map();

  constructor () {
    super();
  }

  /**
   * @param {VoxModel|function|null} model
   */
  init (model = null) {
    this.placeGroundPlate();

    const maxChunkNumber = this.chunksSideNumber;
    for (let x = 0; x < maxChunkNumber; ++x) {
      for (let z = 0; z < maxChunkNumber; ++z) {
        this.attach(
          this.createWorldChunk(
            model, { x, y: 0, z }
          )
        );
      }
    }
  }

  /**
   * @param {THREE.Vector3} position
   */
  updateAtPosition (position) {
    let viewArea = this.getVisibleBoxAt( position );
  }

  /**
   * @param {THREE.Vector3} position
   */
  getVisibleBoxAt (position) {
    position = new THREE.Vector3(position.x, position.y, position.z);

    let worldBorders = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(WORLD_MAP_SIZE, WORLD_MAP_CHUNK_HEIGHT, WORLD_MAP_SIZE)
    ];

    let chunkSize = WORLD_MAP_CHUNK_SIZE_VECTOR.clone();

    let viewAreaBoxFrom = new THREE.Vector3(
      -WORLD_MAP_CHUNK_SIZE * WORLD_MAP_CHUNK_VIEW_DISTANCE,
      0,
      -WORLD_MAP_CHUNK_SIZE * WORLD_MAP_CHUNK_VIEW_DISTANCE
    );
    let viewAreaBoxTo = new THREE.Vector3(
      WORLD_MAP_CHUNK_SIZE * WORLD_MAP_CHUNK_VIEW_DISTANCE,
      WORLD_MAP_CHUNK_HEIGHT,
      WORLD_MAP_CHUNK_SIZE * WORLD_MAP_CHUNK_VIEW_DISTANCE
    );

    /**
     * @type {THREE.Vector3}
     */
    let viewBorderFrom = position.clone()
      .add( viewAreaBoxFrom )
      .max( worldBorders[0] )
      .divide( chunkSize );

    /**
     * @type {THREE.Vector3}
     */
    let viewBorderTo = position.clone()
      .add( viewAreaBoxTo )
      .min( worldBorders[1] )
      .add( chunkSize.clone().divideScalar(1.1) )
      .divide( chunkSize );

    resetDecimal( viewBorderFrom );
    resetDecimal( viewBorderTo );

    viewBorderFrom.multiply( chunkSize );
    viewBorderTo.multiply( chunkSize );

    return {
      from: viewBorderFrom,
      to: viewBorderTo
    };
  }

  /**
   * @param {THREE.Vector3} position
   */
  getVisibleChunksBoxAt (position) {
    position = new THREE.Vector3(position.x, position.y, position.z);
    let visibleBox = this.getVisibleBoxAt( position );
    let chunkSize = WORLD_MAP_CHUNK_SIZE_VECTOR.clone();

    return {
      from: visibleBox.from.divide( chunkSize ).setY(0),
      to: visibleBox.to.divide( chunkSize ).setY(0)
    }
  }

  /**
   * @param {THREE.Vector3} position
   * @returns {string[]}
   */
  getVisibleChunksAt (position) {
    position = new THREE.Vector3(position.x, position.y, position.z);
    let visibleChunksBox = this.getVisibleChunksBoxAt( position );

  }

  /**
   * @param force
   */
  update (force = false) {
    /**
     * @type {WorldObject[]}
     */
    let chunks = [ ...this._map.values() ];
    for (let i = 0; i < chunks.length; ++i) {
      chunks[i].update( force );
    }
  }

  /**
   * @param {THREE.Vector3|*} position
   * @param {number|number[]} color
   */
  addBlock (position, color) {
    let worldChunkObject = this.getMapChunkAt( position );
    if (!worldChunkObject) {
      return;
    }
    const fromPosition = worldChunkObject.chunk.fromPosition;
    const x = position.x - fromPosition.x;
    const y = position.y - fromPosition.y;
    const z = position.z - fromPosition.z;
    worldChunkObject.addBlock( { x, y, z }, color );
  }

  /**
   * @param {THREE.Vector3|*} position
   * @returns {number}
   */
  getBlock (position) {
    let worldChunkObject = this.getMapChunkAt( position );
    if (!worldChunkObject) {
      return 0;
    }
    const fromPosition = worldChunkObject.chunk.fromPosition;
    const x = position.x - fromPosition.x;
    const y = position.y - fromPosition.y;
    const z = position.z - fromPosition.z;
    return worldChunkObject.getBlock( { x, y, z } );
  }

  /**
   * @return {WorldObject[]}
   */
  getChunks () {
    return [ ...this._map.values() ];
  }

  /**
   * @return {THREE.Mesh[]}
   */
  getMeshes () {
    return this.getChunks().map(worldObject => {
      return worldObject.mesh;
    });
  }

  /**
   * @param {THREE.Vector3|*} position
   */
  removeBlock (position) {
    let worldChunkObject = this.getMapChunkAt( position );
    if (!worldChunkObject) {
      return;
    }
    const fromPosition = worldChunkObject.chunk.fromPosition;
    const x = position.x - fromPosition.x;
    const y = position.y - fromPosition.y;
    const z = position.z - fromPosition.z;
    return worldChunkObject.removeBlock( { x, y, z } );
  }

  /**
   * @param {THREE.Vector3} position
   * @returns {WorldObject}
   */
  getMapChunkAt (position) {
    if (!this.inside(position.x, position.y, position.z)) {
      return null;
    }
    let chunkIndex = this._computeChunkIndex(position);
    return this._map.get( chunkIndex );
  }

  /**
   * @param {VoxModel|function|null} model
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {WorldObject}
   */
  createWorldChunk (model, { x, y, z }) {
    const mapChunkObject = new WorldObject(model, WorldObjectType.MAP);
    mapChunkObject.position.set(
      x * WORLD_MAP_CHUNK_SIZE,
      y,
      z * WORLD_MAP_CHUNK_SIZE
    );
    mapChunkObject.position.multiplyScalar( WORLD_MAP_BLOCK_SIZE );
    mapChunkObject.init();

    return mapChunkObject;
  }

  /**
   * Places world plate on the ground
   */
  placeGroundPlate () {
    let geo = new THREE.BoxGeometry(
      WORLD_MAP_BLOCK_SIZE * (WORLD_MAP_SIZE - 2),
      WORLD_MAP_BLOCK_SIZE * 2,
      WORLD_MAP_BLOCK_SIZE * (WORLD_MAP_SIZE - 2)
    );
    let mat = new THREE.MeshPhongMaterial({ color: 0x444444, shininess: 100 });
    let mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2,
      WORLD_MAP_BLOCK_SIZE * -2.01, // to prevent collisions with grid helper
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2
    );
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    this.add( mesh );

    // base
    geo = new THREE.BoxGeometry(
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE,
      WORLD_MAP_BLOCK_SIZE * 1000,
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE
    );
    mat = new THREE.MeshPhongMaterial({ color: 0xd56e00 });
    mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2,
      WORLD_MAP_BLOCK_SIZE * (-1000 / 2 - 2),
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2
    );
    mesh.receiveShadow = true;

    this.add( mesh );
  }

  /**
   * @param {WorldObject} mapObject
   */
  attach (mapObject) {
    this.add( mapObject );
    this.register( mapObject );
  }

  /**
   * @param {WorldObject} mapObject
   */
  detach (mapObject) {
    this.remove( mapObject );
    this.unregister( mapObject );
  }

  /**
   * @param {WorldObject} mapObject
   */
  register (mapObject) {
    this._map.set(mapObject.chunk.mapChunkIndex, mapObject);
  }

  /**
   * @param {WorldObject|string} mapObject
   */
  unregister (mapObject) {
    if (typeof mapObject === 'string') {
      this._map.delete( mapObject );
    } else if (mapObject.chunkInited) {
      this._map.delete( mapObject.chunk.mapChunkIndex );
    }
  }

  /**
   * @param {number|THREE.Vector3} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  inside (x, y, z) {
    if (typeof x === 'object') {
      const position = x;
      x = position.x;
      y = position.y;
      z = position.z;
    }
    let limits = {
      x: [0, WORLD_MAP_SIZE],
      y: [0, WORLD_MAP_CHUNK_HEIGHT],
      z: [0, WORLD_MAP_SIZE]
    };
    return x > limits.x[0] && x < limits.x[1] &&
      y >= limits.y[0] && y < limits.y[1] &&
      z > limits.z[0] && z < limits.z[1];
  }

  /**
   * @returns {number}
   */
  get chunksSideNumber () {
    return Math.ceil(WORLD_MAP_SIZE / WORLD_MAP_CHUNK_SIZE);
  }

  /**
   * @return {Map<string, WorldObject>}
   */
  get chunksMap () {
    return this._map;
  }

  /**
   * @param {THREE.Vector3} position
   * @returns {string}
   * @private
   */
  _computeChunkIndex (position) {
    const { x, z } = position;
    const chunkIndexX = (x / WORLD_MAP_CHUNK_SIZE) | 0;
    const chunkIndexZ = (z / WORLD_MAP_CHUNK_SIZE) | 0;
    return `${chunkIndexX}|${chunkIndexZ}`;
  }
}

