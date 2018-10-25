import { WorldObjectBase } from "../world-object-base";
import { WorldObjectType } from '../world-object-type';
import { VoxMesher } from "./mesher/vox-mesher";
import { HeavyChunk, LightChunk } from "../../map/chunk";
import { transformToBlockCoords } from "../../../utils";

export class WorldObjectVox extends WorldObjectBase {

  /**
   * @type {VoxModel|function|null}
   * @private
   */
  _model = null;

  /**
   * @type {VoxMesher}
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
   * @type {Chunk|HeavyChunk|LightChunk}
   * @private
   */
  _chunk = null;

  /**
   * @param {*} options
   * @returns {Promise<WorldObjectVox>}
   */
  init (options = {}) {
    super.init( options );

    this._createChunk();

    return this._createMesh().then(_ => {
      if (this.model && this.objectType === WorldObjectType.OBJECT) {
        this._centerMesh();
      }
      this.attachMesh();
      this._switchToLightChunk();
      return this;
    });
  }

  /**
   * @param {VoxModel|Function} model
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

  hasBlock (...args) {
    if (!this.chunkInited) {
      return false;
    }
    return this._chunk.hasBlock( ...args );
  }

  getBlock (...args) {
    if (!this.chunkInited) {
      return 0;
    }
    return this._chunk.getBlock( ...args );
  }

  addBlock (...args) {
    if (!this.chunkInited) {
      return;
    }
    this._chunk.addBlock( ...args );
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
   * @returns {Chunk|HeavyChunk|LightChunk}
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
    return this._chunk && this._chunk.isInited;
  }

  /**
   * @private
   */
  _createChunk () {
    if (this._chunk) {
      return;
    }

    let chunk = null;

    switch (this.objectType) {
      case WorldObjectType.MAP:
        const { x, z } = transformToBlockCoords( this.position );
        chunk = new HeavyChunk();
        chunk.createFrom( this._model, { x, z } );
        break;
      case WorldObjectType.OBJECT:
        chunk = new HeavyChunk( false );
        chunk.createFrom( this._model, { x: 0, z: 0 } );
        break;
    }

    this._chunk = chunk;
  }

  /**
   * @private
   */
  _createMesh () {
    this._voxMesher = new VoxMesher( this );
    return this._voxMesher.createOrUpdateMesh( this.blockSize );
  }

  /**
   * @private
   */
  _rebuildMaterial () {
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

  /**
   * @private
   */
  _switchToLightChunk () {
    const chunk = this._chunk;
    const lightChunk = chunk.lightChunk;

    if (lightChunk) {
      chunk.disposeBuffer();

      this._chunk = lightChunk;
    }
  }
}
