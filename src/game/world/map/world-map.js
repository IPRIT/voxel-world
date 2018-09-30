import { WorldObjectVox } from "../world-object/index";
import { WorldMapLoader } from "./world-map-loader";
import {
  WORLD_MAP_BLOCK_SIZE,
  WORLD_MAP_CHUNK_HEIGHT,
  WORLD_MAP_CHUNK_SIZE, WORLD_MAP_CHUNK_SIZE_POWER,
  WORLD_MAP_SIZE
} from "../../settings";
import { WorldMapCollisions } from "./world-map-collisions";
import { Tween } from "../../utils/tween";
import { buildChunkIndex } from "../../utils";
import { TweenEvents } from "../../utils/tween/tween-events";

export class WorldMap extends THREE.Group {

  /**
   * @type {Map<string, WorldObjectVox>}
   * @private
   */
  _map = new Map();

  /**
   * @type {WorldMapCollisions}
   * @private
   */
  _collisions = null;

  /**
   * @type {THREE.Group}
   * @private
   */
  _groundPlate = null;

  /**
   * @type {Array<Tween>}
   * @private
   */
  _showingAnimations = [];

  /**
   * Preparing the world
   *
   * @returns {WorldMap}
   */
  init () {
    this._placeGroundPlate();
    this._initCollisions();

    return this;
  }

  /**
   * @param force
   */
  update (force = false) {
    /**
     * @type {WorldObjectVox[]}
     */
    let chunks = [ ...this._map.values() ];
    for (let i = 0; i < chunks.length; ++i) {
      chunks[i].update( force );
    }
  }

  /**
   * @param {THREE.Vector3} position
   */
  updateAtPosition (position) {
    const mapLoader = WorldMapLoader.getLoader();
    return mapLoader.update( this, position );
  }

  /**
   * @param {number} deltaTime
   */
  updateShowingAnimations (deltaTime) {
    if (this._showingAnimations) {
      this._showingAnimations.forEach( animation => animation.update( deltaTime ) );
    }
  }

  /**
   * @param {Tween} animation
   */
  deleteShowingAnimation (animation) {
    const indexToDelete = this._showingAnimations.findIndex(activeAnimation => {
      return activeAnimation.id === animation.id;
    });
    if (indexToDelete >= 0) {
      this._showingAnimations.splice( indexToDelete, 1 );
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
    const x = position.x - worldChunkObject.chunk._fromX;
    const y = position.y - worldChunkObject.chunk._fromY;
    const z = position.z - worldChunkObject.chunk._fromZ;
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
    const x = position.x - worldChunkObject.chunk._fromX;
    const y = position.y - worldChunkObject.chunk._fromY;
    const z = position.z - worldChunkObject.chunk._fromZ;
    return worldChunkObject.getBlock( { x, y, z } );
  }

  /**
   * @param {{x: number, y: number, z: number}} position
   * @returns {boolean}
   */
  hasBlock (position) {
    return !!this.getBlock(position);
  }

  /**
   * @return {WorldObjectVox[]}
   */
  getChunks () {
    return [ ...this._map.values() ];
  }

  /**
   * @return {THREE.Mesh[]}
   */
  getMeshes () {
    return this.getChunks().filter(worldObject => {
      return worldObject && worldObject.mesh;
    }).map(worldObject => {
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
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number}
   */
  getMinMaxBlockY ({ x, y, z }) {
    x |= 0;
    y |= 0;
    z |= 0;
    let chunkObject = this.getMapChunkAt({ x, y, z });
    if (!chunkObject) {
      return 0;
    }
    let relativePosition = new THREE.Vector3(x, y, z).sub(chunkObject.chunk.fromPosition);
    return chunkObject.chunk.getMinMaxBlockY( relativePosition );
  }

  /**
   * @param {THREE.Vector3} position
   * @returns {WorldObjectVox}
   */
  getMapChunkAt (position) {
    if (!this.inside( position.x, position.y, position.z )) {
      return null;
    }
    let chunkIndex = this._computeChunkIndex(position);
    return this._map.get( chunkIndex );
  }

  /**
   * @param {string[]} chunks
   */
  unloadChunks (chunks = []) {
    for (let chunkIndex of chunks) {
      this.unloadChunk( chunkIndex );
    }
  }

  /**
   * @param {string} chunkIndex
   */
  unloadChunk (chunkIndex) {
    if (this._map.has( chunkIndex )) {
      let chunk = this._map.get( chunkIndex );
      this.detach( chunk );
    }
  }

  /**
   * @param {WorldObjectVox} mapObject
   */
  attach (mapObject) {
    mapObject.material.transparent = true;
    mapObject.material.opacity = 0;

    const animation = new Tween( mapObject.material, 'opacity', 1, {
      duration: 400,
      timingFunction: 'easeInQuad'
    });
    animation.start();
    animation.on(TweenEvents.COMPLETE, _ => {
      // webgl doesn't sort transparent objects properly by z-depth
      // so we need turn off this to get rid of unexpected results
      mapObject.material.transparent = false;
      this.deleteShowingAnimation( animation );
    });
    this._showingAnimations.push( animation );

    this.add( mapObject );
    this.register( mapObject );
  }

  /**
   * @param {WorldObjectVox} mapObject
   */
  detach (mapObject) {
    this.remove( mapObject );
    this.unregister( mapObject );
  }

  /**
   * @param {WorldObjectVox} mapObject
   */
  register (mapObject) {
    this._map.set(
      mapObject.chunk.mapChunkIndex,
      mapObject
    );
  }

  /**
   * @param {WorldObjectVox|string} mapObjectOrIndex
   */
  unregister (mapObjectOrIndex) {
    if (typeof mapObjectOrIndex === 'string') {
      this._map.delete( mapObjectOrIndex );
    } else if (mapObjectOrIndex.chunkInited) {
      this._map.delete( mapObjectOrIndex.chunk.mapChunkIndex );
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  inside (x, y, z) {
    return x >= 0 && x < WORLD_MAP_SIZE &&
      y >= 0 && y < WORLD_MAP_CHUNK_HEIGHT &&
      z >= 0 && z < WORLD_MAP_SIZE;
  }

  /**
   * @returns {number}
   */
  get chunksSideNumber () {
    return Math.ceil( WORLD_MAP_SIZE / WORLD_MAP_CHUNK_SIZE );
  }

  /**
   * @return {Map<string, WorldObjectVox>}
   */
  get chunksMap () {
    return this._map;
  }

  /**
   * @returns {THREE.Group}
   */
  get groundPlate () {
    return this._groundPlate;
  }

  /**
   * @returns {WorldMapCollisions}
   */
  get collisions () {
    return this._collisions;
  }

  /**
   * @private
   */
  _initCollisions () {
    this._collisions = new WorldMapCollisions( this );
  }

  /**
   * Places world plate on the ground
   */
  _placeGroundPlate () {
    let groundPlate = new THREE.Group();

    let geo = new THREE.PlaneBufferGeometry(
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE,
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE
    );
    let mat = new THREE.MeshPhongMaterial({ color: 0x444444, shininess: 100 });
    let mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x -= Math.PI / 2;
    mesh.position.set(
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2,
      0,
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2
    );
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    groundPlate.add( mesh );

    this._groundPlate = groundPlate;

    this.add( groundPlate );
  }

  /**
   * @param {THREE.Vector3} position
   * @returns {string}
   * @private
   */
  _computeChunkIndex (position) {
    const { x, z } = position;
    const chunkIndexX = x >> WORLD_MAP_CHUNK_SIZE_POWER;
    const chunkIndexZ = z >> WORLD_MAP_CHUNK_SIZE_POWER;
    return buildChunkIndex(chunkIndexX, chunkIndexZ);
  }
}

