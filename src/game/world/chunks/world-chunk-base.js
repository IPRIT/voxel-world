export class WorldChunkBase {

  /**
   * @type {VoxModel}
   * @private
   */
  _model = null;

  /**
   * Block value represents as unsigned integer value
   * Structure: [R-color]  [G-color]  [B-color]  [0][00]   [below_back_left_right_above_front]
   *            8bit       8bit       8bit       2bit(ff)  6bit(faces)
   * @type {Uint32Array}
   * @private
   */
  _blocks = new Uint32Array(0);

  /**
   * @type {number}
   * @private
   */
  _type;

  /**
   * @type {boolean}
   * @private
   */
  _inited = false;

  /**
   * @type {number}
   * @private
   */
  _voxBlocksNumber = 0;

  /**
   * @type {number}
   * @private
   */
  _triangles = 0;

  /**
   * @type {boolean}
   */
  needsUpdate = false;

  /**
   * @type {number}
   */
  previousVerticesLength = 0;

  /**
   * @type {number}
   */
  currentBlocks = 0;

  /**
   * @type {number}
   */
  startingBlocks = 0;

  /**
   * @param {VoxModel} model
   */
  constructor (model) {
    this._model = model;
  }

  /**
   * Initializing chunk buffer
   */
  init () {
    this._createBlocksBuffer();
    this._inited = true;
  }

  /**
   * @param {number} type
   */
  setType (type) {
    this._type = type;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number}
   */
  blockIndex (x, y, z) {
    return x * this.size.y * this.size.z
      + y * this.size.z
      + z;
  }

  /**
   * @returns {Uint32Array}
   */
  get blocks () {
    return this._blocks;
  }

  /**
   * @returns {number}
   */
  get blocksNumber () {
    return this._voxBlocksNumber;
  }

  /**
   * @param {number} value
   */
  set triangles (value) {
    this._triangles = value;
  }

  /**
   * @returns {boolean}
   */
  get inited () {
    return this._inited;
  }

  /**
   * @returns {{x: number, y: number, z: number}}
   */
  get size () {
    const {
      x = 0, y = 0, z = 0
    } = (this._model && this._model.size) || {};
    return { x, y, z };
  }

  /**
   * @returns {number}
   */
  get bufferSize () {
    const { x, y, z } = this.size;
    return x * y * z;
  }

  /**
   * @returns {Uint32Array}
   * @private
   */
  _createBlocksBuffer () {
    return (this._blocks = new Uint32Array( this.bufferSize ));
  }
}
