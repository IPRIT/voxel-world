import Promise from 'bluebird';
import { WorldObjectVox, WorldObjectType } from "../world-object/index";
import { resetDecimal } from "../../utils/index";
import { WorldMapLoader } from "./world-map-loader";
import {
  WORLD_MAP_BLOCK_SIZE,
  WORLD_MAP_CHUNK_HEIGHT,
  WORLD_MAP_CHUNK_SIZE, WORLD_MAP_CHUNK_SIZE_POWER,
  WORLD_MAP_CHUNK_SIZE_VECTOR,
  WORLD_MAP_CHUNK_VIEW_DISTANCE,
  WORLD_MAP_SIZE
} from "../../settings";
import { ModelType } from "../../model";
import { WorldMapCollisions } from "./world-map-collisions";
import { Tween } from "../../utils/tween";

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
   * @type {boolean}
   * @private
   */
  _chunksLoading = false;

  /**
   * @type {Array<Tween>}
   * @private
   */
  _showingAnimations = [];

  /**
   * @param {number} x
   * @param {number} z
   * @returns {*[]}
   * @private
   */
  _dummyModelFunction = (x, z) => ([{ x, y: 0, z }, [255, 255, 255]]);

  /**
   * World preparing
   */
  init () {
    this._placeGroundPlate();
    this._initCollisions();
  }

  /**
   * @param {number} deltaTime
   */
  updateAppearAnimations (deltaTime) {
    this._showingAnimations && this._showingAnimations.forEach((animation, index) => {
      if (animation.isStopped) {
        this._showingAnimations.splice( index, 1 );
      } else {
        animation.update( deltaTime );
      }
    });
  }

  /**
   * @param {THREE.Vector3} position
   */
  async updateAtPosition (position) {
    if (this._chunksLoading) {
      return;
    }
    this._chunksLoading = true;

    let newVisibleChunks = this.getVisibleChunksAt( position, true );
    let chunksToLoad = newVisibleChunks.filter(chunkIndex => {
      return !this._map.has( chunkIndex );
    });
    let chunksToUnload = [ ...this._map.keys() ].filter(chunkIndex => {
      return !newVisibleChunks.includes( chunkIndex );
    });

    return this._loadChunks( chunksToLoad, chunksToUnload );
  }

  /**
   * @param {THREE.Vector3} position
   * @returns {{from: THREE.Vector3, to: THREE.Vector3}}
   */
  getVisibleBoxAt (position) {
    position = new THREE.Vector3(position.x, position.y, position.z);

    let worldBorders = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(WORLD_MAP_SIZE - 1, WORLD_MAP_CHUNK_HEIGHT - 1, WORLD_MAP_SIZE - 1)
    ];

    let chunkSize = WORLD_MAP_CHUNK_SIZE_VECTOR.clone();

    let viewAreaBox = new THREE.Vector3(
      WORLD_MAP_CHUNK_SIZE * WORLD_MAP_CHUNK_VIEW_DISTANCE,
      WORLD_MAP_CHUNK_HEIGHT,
      WORLD_MAP_CHUNK_SIZE * WORLD_MAP_CHUNK_VIEW_DISTANCE
    );

    /**
     * @type {THREE.Vector3}
     */
    let viewBorderFrom = position.clone()
      .sub( viewAreaBox )
      .sub( chunkSize.clone().subScalar(1) )
      .max( worldBorders[0] )
      .divide( chunkSize );

    /**
     * @type {THREE.Vector3}
     */
    let viewBorderTo = position.clone()
      .add( viewAreaBox )
      .add( chunkSize.clone().subScalar(1) )
      .min( worldBorders[1] )
      .divide( chunkSize );

    resetDecimal( viewBorderFrom );
    resetDecimal( viewBorderTo );

    viewBorderFrom.multiply( chunkSize );
    viewBorderTo.multiply( chunkSize )
      .add( chunkSize.clone().subScalar(1) );

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
      from: resetDecimal( visibleBox.from.clone().divide( chunkSize ).setY(0) ),
      to: resetDecimal( visibleBox.to.clone().divide( chunkSize ).setY(0) )
    };
  }

  /**
   * @param {THREE.Vector3} position
   * @param {boolean} sort
   * @returns {string[]}
   */
  getVisibleChunksAt (position, sort = false) {
    position = new THREE.Vector3(position.x, position.y, position.z);
    let visibleChunksBox = this.getVisibleChunksBoxAt( position );
    let chunksIndicies = [];
    for (let xIndex = visibleChunksBox.from.x; xIndex <= visibleChunksBox.to.x; ++xIndex) {
      for (let zIndex = visibleChunksBox.from.z; zIndex <= visibleChunksBox.to.z; ++zIndex) {
        chunksIndicies.push( new THREE.Vector3(xIndex, 0, zIndex) );
      }
    }

    if (sort) {
      let chunkSize = WORLD_MAP_CHUNK_SIZE_VECTOR.clone();
      let curChunk = resetDecimal(
        position.clone()
          .divide( chunkSize )
          .setY(0)
      );

      chunksIndicies = chunksIndicies.sort((chunkA, chunkB) => {
        return curChunk.distanceTo( chunkA ) - curChunk.distanceTo( chunkB );
      });
    }

    return chunksIndicies.map(chunkVector => {
      return this._buildChunkStringIndex( chunkVector.x, chunkVector.z );
    });
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
   * @param {WorldObjectVox} mapObject
   */
  attach (mapObject) {
    mapObject.material.transparent = true;
    mapObject.material.opacity = 0;

    const tween = new Tween( mapObject.material, 'opacity', 1, {
      duration: 400,
      timingFunction: 'easeInQuad'
    });
    tween.start();
    this._showingAnimations.push( tween );

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
   * @param {WorldObjectVox|string} mapObject
   */
  unregister (mapObject) {
    if (typeof mapObject === 'string') {
      this._map.delete( mapObject );
    } else if (mapObject.chunkInited) {
      this._map.delete( mapObject.chunk.mapChunkIndex );
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
    return Math.ceil(WORLD_MAP_SIZE / WORLD_MAP_CHUNK_SIZE);
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
   * @param {Array<string>} chunksToLoad
   * @param {Array<string>} chunksToUnload
   * @returns {Promise<any>}
   * @private
   */
  _loadChunks (chunksToLoad = [], chunksToUnload = []) {
    // loading chunks
    return Promise.resolve( chunksToLoad ).map(chunkToLoad => {
      return Promise.all([
        chunkToLoad,
        this._loadChunkModel( chunkToLoad )
          .catch(error => this._onChunkLoadError( error, chunkToLoad ))
      ]);
    }, { concurrency: 20 }).mapSeries(async ([ chunkToLoad, data ]) => {
      let [ x, z ] = this._parseChunkIndex( chunkToLoad );
      let { cached, model = null, worldObject = null } = data || {};
      if (!cached && model) {
        // if not cached just create a chunk with a received model
        worldObject = await this._createWorldChunk( model, { x, y: 0, z } );
      } else if (!model && !worldObject) {
        // when error occurred both objects are empty
        return;
      }

      // adding chunk to the world
      this.attach( worldObject );

      // unload next chunk
      if (chunksToUnload.length) {
        let chunkIndex = chunksToUnload.shift();
        this._unloadChunk( chunkIndex );
      }
    }).finally(_ => {
      // unload the rest
      this._unloadChunks( chunksToUnload );
      this._chunksLoading = false;
    });
  }

  /**
   * @param {string} chunkIndex
   * @returns {Promise<{cached: boolean, worldObject?: WorldObjectVox, model?: VoxModel}>}
   */
  async _loadChunkModel (chunkIndex) {
    let mapLoader = WorldMapLoader.getLoader();
    return mapLoader.load( chunkIndex );
  }

  /**
   * @param {string[]} chunks
   */
  _unloadChunks (chunks = []) {
    for (let chunkIndex of chunks) {
      this._unloadChunk( chunkIndex );
    }
  }

  /**
   * @param {string} chunkIndex
   */
  _unloadChunk (chunkIndex) {
    let mapLoader = WorldMapLoader.getLoader();
    if (this._map.has( chunkIndex )) {
      let chunk = this._map.get( chunkIndex );
      mapLoader.addToCache( chunkIndex, chunk );
      this.detach( chunk );
    }
  }

  /**
   * @param {*} error
   * @param {string} targetChunk
   * @private
   */
  _onChunkLoadError (error, targetChunk) {
    console.log('Using fallback chunk due to error:', error);

    let [ x, z ] = this._parseChunkIndex( targetChunk );
    // using a function to generate plane
    let fallback = this._createWorldChunk(
      this._dummyModelFunction,
      { x, y: 0, z }
    );
    this.attach( fallback );
  }

  /**
   * @param {VoxModel|function|null} model
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {WorldObjectVox}
   */
  _createWorldChunk (model, { x, y, z }) {
    const mapChunkObject = new WorldObjectVox( WorldObjectType.MAP, ModelType.VOX );

    mapChunkObject.setModel( model );
    mapChunkObject.position.set(
      x * WORLD_MAP_CHUNK_SIZE,
      y + WORLD_MAP_BLOCK_SIZE / 2,
      z * WORLD_MAP_CHUNK_SIZE
    );
    mapChunkObject.position.multiplyScalar( WORLD_MAP_BLOCK_SIZE );

    return mapChunkObject.init();
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
    return this._buildChunkStringIndex(chunkIndexX, chunkIndexZ);
  }

  /**
   * @param {number} x
   * @param {number} z
   * @returns {string}
   * @private
   */
  _buildChunkStringIndex (x, z) {
    return `${x}|${z}`;
  }

  /**
   * @param {string} chunkIndex
   * @returns {number[]}
   * @private
   */
  _parseChunkIndex (chunkIndex) {
    return chunkIndex.split('|').map(Number);
  }
}

