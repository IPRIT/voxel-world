import { buildChunkIndex, floorVector, parseChunkIndexToVector } from "../../utils";
import { WorldMapLoadingOperation, WorldMapLoadingOperationEvents } from "./world-map-loading-operation";
import {
  WORLD_MAP_CHUNK_HEIGHT,
  WORLD_MAP_CHUNK_SIZE,
  WORLD_MAP_CHUNK_SIZE_POWER,
  WORLD_MAP_CHUNK_SIZE_VECTOR,
  WORLD_MAP_CHUNK_VIEW_DISTANCE,
  WORLD_MAP_SIZE
} from "../../settings";

export class WorldMapLoader {

  /**
   * @type {WorldMap}
   * @private
   */
  _worldMap = null;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _chunkSize = new THREE.Vector3( ...WORLD_MAP_CHUNK_SIZE_VECTOR );

  /**
   * @type {string|*}
   * @private
   */
  _lastChunkIndex = null;

  /**
   * @type {WorldMapLoader}
   * @private
   */
  static _instance = null;

  /**
   * @returns {WorldMapLoader}
   */
  static getLoader () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new WorldMapLoader() );
  }

  /**
   * @param {WorldMap} worldMap
   * @param {THREE.Vector3} position
   */
  update (worldMap, position) {
    if (!this._worldMap) {
      this._worldMap = worldMap;
    }

    // Step 1
    const currentChunkIndex = this._getChunkIndex( position );
    if (this._lastChunkIndex === currentChunkIndex) {
      return;
    }

    if (this._downloadOperation) {
      this._downloadOperation.cancel();
    }

    // Step 2
    const visibleChunks = this._getVisibleChunksAt( position );
    const chunksToLoad = this._getChunksToLoad( visibleChunks );
    const chunksToUnload = this._getChunksToUnload( visibleChunks );

    const groups = this._groupChunksByDistance( currentChunkIndex, chunksToLoad );
    let sortedGroups = this._sortChunkGroupsByDistance( groups );

    // join first 2 groups
    if (sortedGroups.length >= 2) {
      const joinedGroups = [].concat( sortedGroups[0], sortedGroups[1] );
      sortedGroups = sortedGroups.slice( 2 );
      sortedGroups.unshift( joinedGroups );
    }

    // Step 3
    this._downloadOperation = new WorldMapLoadingOperation();
    this._downloadOperation.load( ...sortedGroups );

    if (!sortedGroups.length) {
      this.worldMap.unloadChunks( chunksToUnload );
    }

    // Subscribing to load events
    // On success loaded
    this._downloadOperation.on(WorldMapLoadingOperationEvents.CHUNK_LOADED, worldObject => {
      // adding chunk to the world
      this.worldMap.attach( worldObject );

      // unload next chunk
      if (chunksToUnload.length) {
        let chunkIndex = chunksToUnload.shift();
        this.worldMap.unloadChunk( chunkIndex );
      }
    });

    // On all chunks loaded
    this._downloadOperation.once(WorldMapLoadingOperationEvents.ALL_CHUNKS_LOADED, _ => {
      // unload the rest
      this.worldMap.unloadChunks( chunksToUnload );
    });

    // Step 4
    this._lastChunkIndex = currentChunkIndex;
  }

  /**
   * @returns {WorldMap}
   */
  get worldMap () {
    return this._worldMap;
  }

  /**
   * @param {THREE.Vector3} position
   * @returns {Array<string>}
   */
  _getVisibleChunksAt (position) {
    position = new THREE.Vector3( position.x, position.y, position.z );

    const visibleChunksBox = this._getVisibleChunksBoxAt( position );
    const chunkIndexes = [];

    for (let xIndex = visibleChunksBox.from.x; xIndex <= visibleChunksBox.to.x; ++xIndex) {
      for (let zIndex = visibleChunksBox.from.z; zIndex <= visibleChunksBox.to.z; ++zIndex) {
        chunkIndexes.push( buildChunkIndex( xIndex, zIndex ) );
      }
    }

    return chunkIndexes;
  }

  /**
   * @param {THREE.Vector3} position
   * @returns {{from: THREE.Vector3, to: THREE.Vector3}}
   * @private
   */
  _getVisibleChunksBoxAt (position) {
    position = new THREE.Vector3(position.x, position.y, position.z);

    let visibleBox = this._getVisibleBoxAt( position );
    return {
      from: floorVector( visibleBox.from.clone().divide( this._chunkSize ).setY(0) ),
      to: floorVector( visibleBox.to.clone().divide( this._chunkSize ).setY(0) )
    };
  }

  /**
   * @param {THREE.Vector3} position
   * @returns {{from: THREE.Vector3, to: THREE.Vector3}}
   */
  _getVisibleBoxAt (position) {
    position = new THREE.Vector3( position.x, position.y, position.z );

    let worldBorders = [
      new THREE.Vector3( 0, 0, 0 ),
      new THREE.Vector3( WORLD_MAP_SIZE - 1, WORLD_MAP_CHUNK_HEIGHT - 1, WORLD_MAP_SIZE - 1 )
    ];

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
      .sub( this._chunkSize.clone().subScalar(1) )
      .max( worldBorders[0] )
      .divide( this._chunkSize );

    /**
     * @type {THREE.Vector3}
     */
    let viewBorderTo = position.clone()
      .add( viewAreaBox )
      .add( this._chunkSize.clone().subScalar(1) )
      .min( worldBorders[1] )
      .divide( this._chunkSize );

    floorVector( viewBorderFrom );
    floorVector( viewBorderTo );

    viewBorderFrom.multiply( this._chunkSize );
    viewBorderTo.multiply( this._chunkSize )
      .add( this._chunkSize.clone().subScalar(1) );

    return {
      from: viewBorderFrom,
      to: viewBorderTo
    };
  }

  /**
   * @param {Array<string>} visibleChunks
   * @returns {Array<string>}
   * @private
   */
  _getChunksToLoad (visibleChunks) {
    return visibleChunks.filter(chunkIndex => {
      return !this.worldMap.chunksMap.has( chunkIndex );
    });
  }

  /**
   * @param {Array<string>} visibleChunks
   * @returns {Array<string>}
   * @private
   */
  _getChunksToUnload (visibleChunks) {
    return [ ...this.worldMap.chunksMap.keys() ].filter(chunkIndex => {
      return !visibleChunks.includes( chunkIndex );
    }).reverse();
  }

  /**
   * @param {string} targetChunkIndex
   * @param {Array<string>} chunks
   * @private
   */
  _groupChunksByDistance (targetChunkIndex, chunks = []) {
    // converting indexes to their vector positions
    const targetChunkPosition = parseChunkIndexToVector( targetChunkIndex );
    const chunksPositions = chunks.map(chunkIndex => {
      return parseChunkIndexToVector( chunkIndex );
    });

    // grouping
    const groupsMap = new Map();
    for (let i = 0; i < chunksPositions.length; ++i) {
      const chunkPosition = chunksPositions[ i ];
      const distanceFloored = Math.floor( targetChunkPosition.distanceTo( chunkPosition ) );

      if (!groupsMap.has( distanceFloored )) {
        groupsMap.set( distanceFloored, [] );
      }
      const group = groupsMap.get( distanceFloored );
      group.push(
        buildChunkIndex( chunkPosition.x, chunkPosition.z )
      );
    }

    return [ ...groupsMap.entries() ];
  }

  /**
   * @param {Array<*>} groups
   * @returns {Array<Array<string>>}
   * @private
   */
  _sortChunkGroupsByDistance (groups = []) {
    return groups.sort((a, b) => {
      return a[ 0 ] - b[ 0 ];
    }).map(([, group]) => group);
  }

  /**
   * @param {THREE.Vector3} position
   * @returns {string}
   * @private
   */
  _getChunkIndex (position) {
    const { x, z } = position;
    return buildChunkIndex(
      x >> WORLD_MAP_CHUNK_SIZE_POWER,
      z >> WORLD_MAP_CHUNK_SIZE_POWER
    );
  }
}
