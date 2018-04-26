import { WorldObjectType } from "./world-object-type";
import { ModelType } from "../../model/model-type";
import { WORLD_MAP_BLOCK_SIZE } from "../../settings";

let WORLD_GLOBAL_OBJECT_ID = 1;

export class WorldObjectBase extends THREE.Group {

  /**
   * @type {number}
   * @private
   */
  _id = 0;

  /**
   * @type {THREE.Mesh|THREE.SkinnedMesh}
   * @private
   */
  _mesh = null;

  /**
   * @type {*}
   * @private
   */
  _options = {};

  /**
   * @class WorldObjectType
   * @type {number}
   * @private
   */
  _objectType;

  /**
   * @class ModelType
   * @type {number}
   * @private
   */
  _modelType;

  /**
   * @type {number}
   * @private
   */
  _worldScale = 1;

  /**
   * @type {number}
   * @private
   */
  _blockSize = WORLD_MAP_BLOCK_SIZE;

  /**
   * @type {boolean}
   * @private
   */
  _wireframe = false;

  /**
   * @param {number} objectType - @type WorldObjectType
   * @param {number} modelType - @type ModelType
   */
  constructor (objectType, modelType) {
    super();
    this._id = WORLD_GLOBAL_OBJECT_ID++;
    this._objectType = objectType;
    this._modelType = modelType;
  }

  /**
   * @param {{ worldScale: number }} options
   */
  init (options = {}) {
    this._options = options;
    this.setWorldScale(options);
  }

  update () {
    // not implemented
  }

  /**
   * @param {number} worldScale
   */
  setWorldScale ({ worldScale = 1 } = {}) {
    this._worldScale = worldScale;
    this._blockSize = WORLD_MAP_BLOCK_SIZE * this._worldScale;
    return this;
  }

  attachMesh () {
    this.add( this._mesh );
  }

  detachMesh () {
    this._mesh && this.remove( this._mesh );
  }

  /**
   * @returns {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @returns {THREE.Mesh|THREE.SkinnedMesh}
   */
  get mesh () {
    return this._mesh;
  }

  /**
   * @param {THREE.Mesh|THREE.SkinnedMesh} value
   */
  set mesh (value) {
    this._mesh = value;
  }

  /**
   * @returns {*}
   */
  get options () {
    return this._options;
  }

  /**
   * @returns {number}
   */
  get worldScale () {
    return this._worldScale;
  }

  /**
   * @param {number} scale
   */
  set worldScale (scale) {
    this._worldScale = scale;
    this._blockSize = WORLD_MAP_BLOCK_SIZE * scale;
  }

  /**
   * @returns {number}
   */
  get blockSize () {
    return this._blockSize;
  }

  /**
   * @returns {boolean}
   */
  get wireframe () {
    return this._wireframe;
  }

  /**
   * @returns {number}
   */
  get objectType () {
    return this._objectType;
  }

  /**
   * @returns {number}
   */
  get modelType () {
    return this._modelType;
  }
}
