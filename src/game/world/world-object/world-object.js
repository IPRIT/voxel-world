import { WorldObjectType } from "./world-object-type";
import { WorldChunkMap, WorldChunkBase, WorldChunkObject } from "../chunks";
import { WorldObjectMesher } from "./world-object-mesher";
import { WORLD_MAP_BLOCK_SIZE } from "../world-map";

let WORLD_GLOBAL_OBJECT_ID = 1;

export class WorldObject extends THREE.Group {

  /**
   * @type {number}
   * @private
   */
  _id = WORLD_GLOBAL_OBJECT_ID++;

  /**
   * @type {VoxModel}
   * @private
   */
  _model = null;

  /**
   * @type {WorldObjectMesher}
   * @private
   */
  _mesher = null;

  /**
   * @type {THREE.Mesh}
   * @private
   */
  _mesh = null;

  /**
   * @type {THREE.BufferGeometry}
   * @private
   */
  _geometry = null;

  /**
   * @type {THREE.BufferAttribute}
   * @private
   */
  _vertices = null;

  /**
   * @type {THREE.BufferAttribute}
   * @private
   */
  _colors = null;

  /**
   * @type {THREE.Material}
   * @private
   */
  _material = null;

  /**
   * @type {*}
   * @private
   */
  _options = {};

  /**
   * @type {number}
   * @private
   */
  _objectType;

  /**
   * @type {WorldChunkMap|WorldChunkObject}
   * @private
   */
  _chunk = null;

  /**
   * @type {boolean}
   * @private
   */
  _wireframe = false;

  /**
   * @param {VoxModel} model
   * @param {number} type - @type WorldObjectType
   */
  constructor (model, type) {
    if (!model) {
      throw new Error(`Unsupported model data. Expected: VoxModel, got: ${model}`);
    } else if (typeof type === 'undefined') {
      throw new Error(`Unsupported object type. Expected: WorldObjectType, got: ${type}`);
    }
    super();
    this._model = model;
    this._objectType = type;
  }

  /**
   * @param {*} options
   */
  init (options = {}) {
    this._options = options;
    this._createChunk();
    this._createMesh();

    this.add(this._mesh);
  }

  /**
   * @param {boolean} force
   */
  update (force = false) {
    if (!force && !this._chunk.needsUpdate) {
      return;
    }
    this._mesher.createOrUpdateMesh();
  }

  addBlock (...args) {
    if (!this.chunkInited) {
      return;
    }
    this._chunk.addBlock( ...args );
  }

  getBlock (...args) {
    if (!this.chunkInited) {
      return 0;
    }
    this._chunk.getBlock( ...args );
  }

  removeBlock (...args) {
    if (!this.chunkInited) {
      return;
    }
    this._chunk.removeBlock( ...args );
  }

  /**
   * @returns {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @returns {VoxModel}
   */
  get model () {
    return this._model;
  }

  /**
   * @returns {THREE.Mesh}
   */
  get mesh () {
    return this._mesh;
  }

  /**
   * @param {THREE.Mesh} value
   */
  set mesh (value) {
    this._mesh = value;
  }

  /**
   * @returns {WorldChunkMap|WorldChunkObject|WorldChunkBase}
   */
  get chunk () {
    return this._chunk;
  }

  /**
   * @returns {THREE.BufferAttribute}
   */
  get vertices () {
    return this._vertices;
  }

  /**
   * @param {THREE.BufferAttribute} value
   */
  set vertices (value) {
    this._vertices = value;
  }

  /**
   * @returns {THREE.BufferAttribute}
   */
  get colors () {
    return this._colors;
  }

  /**
   * @param {THREE.BufferAttribute} value
   */
  set colors (value) {
    this._colors = value;
  }

  /**
   * @returns {THREE.BufferGeometry}
   */
  get geometry () {
    return this._geometry;
  }

  /**
   * @param {THREE.BufferGeometry} value
   */
  set geometry (value) {
    this._geometry = value;
  }

  /**
   * @returns {THREE.Material}
   */
  get material () {
    if (!this._material) {
      this._material = new THREE.MeshLambertMaterial({
        vertexColors: THREE.VertexColors,
        wireframe: this._wireframe
      })
    }
    return this._material;
  }

  /**
   * @returns {boolean}
   */
  get chunkInited () {
    return this._chunk && this._chunk.inited;
  }

  /**
   * @private
   */
  _createChunk () {
    if (this._chunk || !this._model) {
      return;
    }
    switch (this._objectType) {
      case WorldObjectType.MAP:
        this._chunk = new WorldChunkMap(this._model, {
          worldPosition: this.position.multiplyScalar(1 / WORLD_MAP_BLOCK_SIZE)
        });
        break;
      case WorldObjectType.OBJECT:
        this._chunk = new WorldChunkObject(this._model, options);
        break;
    }
    // creating chunk buffer
    this._chunk.init();
  }

  /**
   * @private
   */
  _createMesh () {
    this._mesher = new WorldObjectMesher(this);
    this._mesher.createOrUpdateMesh();
  }
}
