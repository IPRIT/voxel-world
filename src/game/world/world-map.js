import {
  WORLD_MAP_CHUNK_HEIGHT,
  WORLD_MAP_CHUNK_SIZE,
  WORLD_MAP_CHUNK_SIZE_VECTOR,
  WORLD_MAP_CHUNK_VIEW_DISTANCE
} from "./chunks";
import { WorldObject, WorldObjectType } from "./world-object";
import { resetDecimal } from "../utils";
import { WorldMapLoader } from "./map/world-map-loader";

export const WORLD_MAP_SIZE = 1 << 9;
export const WORLD_MAP_BLOCK_SIZE = 2;

export class WorldMap extends THREE.Group {

  /**
   * @type {Map<string, WorldObject>}
   * @private
   */
  _map = new Map();

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
   * @param {number} x
   * @param {number} z
   * @returns {*[]}
   * @private
   */
  _dummyModelFunction = (x, z) => ([{ x, y: 0, z }, [255, 0, 0]]);

  constructor () {
    super();
  }

  /**
   * @param {VoxModel|function|null} model
   */
  init () {
    this.placeGroundPlate();

    this.updateAtPosition(
      new THREE.Vector3(WORLD_MAP_SIZE / 2, 0, WORLD_MAP_SIZE / 2)
    );
  }

  /**
   * @param {THREE.Vector3} position
   */
  async updateAtPosition (position) {
    if (this._chunksLoading) {
      return;
    }
    this._chunksLoading = true;
    let newVisibleChunks = this.getVisibleChunksAt( position );
    let chunksToLoad = newVisibleChunks.filter(chunkIndex => {
      return !this._map.has( chunkIndex );
    });
    let chunksToUnload = [ ...this._map.keys() ].filter(chunkIndex => {
      return !newVisibleChunks.includes( chunkIndex );
    });

    // loading chunks
    let loadings = [];
    for (let chunkToLoad of chunksToLoad) {
      let [ x, z ] = this._parseChunkIndex( chunkToLoad );

      let loadingEntry = this.loadChunkModel( chunkToLoad ).then(data => {
        let { cached, model = null, worldObject = null } = data || {};
        if (cached && worldObject) {
          // if cached just attach object was created before
          this.attach( worldObject );
        } else {
          // if not cached just create a chunk with a received model
          worldObject = this.createWorldChunk( model, { x, y: 0, z } );
        }
        this.attach( worldObject );
      }).catch(_ => {
        console.error(_);
        // using default function to render a chunk when we have an error
        let newChunk = this.createWorldChunk(
          this._dummyModelFunction,
          { x, y: 0, z }
        );
        this.attach( newChunk );
      }).finally(_ => {
        // unload existing chunk
        if (chunksToUnload.length) {
          let chunkIndex = chunksToUnload.shift();
          this.unloadChunk( chunkIndex );
        }
      });

      loadings.push( loadingEntry );
    }

    await Promise.all( loadings );

    // unloading the rest of array
    this.unloadChunks( chunksToUnload );

    this._chunksLoading = false;
  }

  /**
   * @param {string} chunkIndex
   * @returns {Promise<VoxModel>}
   */
  loadChunkModel (chunkIndex) {
    let mapLoader = WorldMapLoader.getLoader();
    try {
      return mapLoader.load( chunkIndex );
    } catch (e) {
      console.log(e);
    }
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
    let mapLoader = WorldMapLoader.getLoader();
    if (this._map.has( chunkIndex )) {
      let chunk = this._map.get( chunkIndex );
      mapLoader.addToCache( chunkIndex, chunk );
      this.detach( chunk );
    }
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
   * @returns {string[]}
   */
  getVisibleChunksAt (position) {
    position = new THREE.Vector3(position.x, position.y, position.z);
    let visibleChunksBox = this.getVisibleChunksBoxAt( position );
    let chunksIndicies = [];
    for (let xIndex = visibleChunksBox.from.x; xIndex <= visibleChunksBox.to.x; ++xIndex) {
      for (let zIndex = visibleChunksBox.from.z; zIndex <= visibleChunksBox.to.z; ++zIndex) {
        chunksIndicies.push( this._buildChunkStringIndex(xIndex, zIndex) );
      }
    }
    return chunksIndicies;
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
      y + WORLD_MAP_BLOCK_SIZE / 2,
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
    let groundPlate = new THREE.Group();

    let geo = new THREE.BoxGeometry(
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE,
      WORLD_MAP_BLOCK_SIZE * 2,
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE
    );
    let mat = new THREE.MeshPhongMaterial({ color: 0x444444, shininess: 100 });
    let mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2,
      -WORLD_MAP_BLOCK_SIZE,
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2
    );
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    groundPlate.add( mesh );

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

    groundPlate.add( mesh );
    this._groundPlate = groundPlate;

    this.add( groundPlate );
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
   * @returns {THREE.Group}
   */
  get groundPlate () {
    return this._groundPlate;
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

