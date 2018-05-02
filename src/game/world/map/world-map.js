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

export class WorldMap extends THREE.Group {

  /**
   * @type {Map<string, WorldObjectVox>}
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
    let newVisibleChunks = this.getVisibleChunksAt( position, true );
    let chunksToLoad = newVisibleChunks.filter(chunkIndex => {
      return !this._map.has( chunkIndex );
    });
    let chunksToUnload = [ ...this._map.keys() ].filter(chunkIndex => {
      return !newVisibleChunks.includes( chunkIndex );
    });

    // loading chunks
    return Promise.resolve(chunksToLoad).mapSeries(chunkToLoad => {
      let [ x, z ] = this._parseChunkIndex( chunkToLoad );

      return this.loadChunkModel( chunkToLoad ).then(data => {
        let { cached, model = null, worldObject = null } = data || {};
        if (cached && worldObject) {
          // if cached attach object was created before
          this.attach( worldObject );
        } else if (model) {
          // if not cached just create a chunk with a received model
          worldObject = this.createWorldChunk( model, { x, y: 0, z } );
        } else {
          throw new Error('Can\'t load a model');
        }
        this.attach( worldObject );
      }).catch(_ => {
        console.log('Using fallback chunk because error:', _);
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
    }).then(_ => {
      // unload the rest
      this.unloadChunks( chunksToUnload );

      this._chunksLoading = false;
    });
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
      let curChunk = resetDecimal( position.clone().divide( chunkSize ).setY(0) );

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
   * @param {THREE.Vector3} position
   * @returns {WorldObjectVox}
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
   * @returns {WorldObjectVox}
   */
  createWorldChunk (model, { x, y, z }) {
    const mapChunkObject = new WorldObjectVox( WorldObjectType.MAP, ModelType.VOX );

    mapChunkObject.setModel( model );
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
   * @param {WorldObjectVox} mapObject
   */
  attach (mapObject) {
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
    this._map.set(mapObject.chunk.mapChunkIndex, mapObject);
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

