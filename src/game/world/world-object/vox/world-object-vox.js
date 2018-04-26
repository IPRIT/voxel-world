import { WorldObjectBase } from "../world-object-base";
import { WorldChunkMap, WorldChunkObject } from "../../chunks/index";
import { WorldObjectVoxMesher } from "./world-object-vox-mesher";
import { WorldObjectType } from '../world-object-type';
import { WORLD_MAP_BLOCK_SIZE } from "../../../settings";

export class WorldObjectVox extends WorldObjectBase {

  /**
   * @type {VoxModel|function|null}
   * @private
   */
  _model = null;

  /**
   * @type {WorldObjectVoxMesher}
   * @private
   */
  _voxMesher = null;

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
   * @type {WorldChunkMap|WorldChunkObject|WorldChunkBase}
   * @private
   */
  _chunk = null;

  /**
   * @param {*} options
   */
  init (options = {}) {
    super.init( options );

    this._createChunk();
    this._createMesh();

    if (this.objectType === WorldObjectType.OBJECT && this.model) {
      this._centerMesh();
    }

    this.attachMesh();
  }

  /**
   * @param {VoxModel|function} model
   */
  setModel (model) {
    this.model = model;
    return this;
  }

  /**
   * @param {boolean} force
   */
  update (force = false) {
    if (!force && !this._chunk.needsUpdate) {
      return;
    }
    this._voxMesher.createOrUpdateMesh( this.blockSize );
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
   * @returns {VoxModel|function}
   */
  get model () {
    return this._model;
  }

  /**
   * @param {VoxModel|function} value
   */
  set model (value) {
    this._model = value;
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
      this._rebuildMaterial();
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
    if (this._chunk) {
      return;
    }
    switch (this.objectType) {
      case WorldObjectType.MAP:
        this._chunk = new WorldChunkMap(this._model, {
          worldPosition: this.position.clone().divideScalar( WORLD_MAP_BLOCK_SIZE )
        });
        break;
      case WorldObjectType.OBJECT:
        this._chunk = new WorldChunkObject(this._model);
        break;
    }
    // creating chunk buffer
    this._chunk.init();
  }

  /**
   * @private
   */
  _createMesh () {
    this._voxMesher = new WorldObjectVoxMesher(this);
    this._voxMesher.createOrUpdateMesh( this.blockSize );
  }

  /**
   * @private
   */
  _rebuildMaterial () {
    // this._material = shaderMaterial;
    this._material = new THREE.MeshLambertMaterial({
      vertexColors: THREE.VertexColors,
      wireframe: this.wireframe
    });
  }

  /**
   * @private
   */
  _centerMesh () {
    this.mesh.position.sub(
      new THREE.Vector3(
        this.model.size.x / 2 * this.blockSize,
        0,
        this.model.size.z / 2 * this.blockSize
      )
    );
  }
}
