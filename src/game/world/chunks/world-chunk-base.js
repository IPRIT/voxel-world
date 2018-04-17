import { rgbToInt } from "../../utils";

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
    this._buildModel();
    this._inited = true;
  }

  /**
   * @param {number} type
   */
  setType (type) {
    this._type = type;
  }

  /**
   * Computes buffer offset
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
   * @param {number} index
   * @returns {{x: number, y: number, z: number}}
   */
  blockPosition (index) {
    const yz = this.size.y * this.size.z;
    const t1 = index % yz;
    const z = t1 % this.size.z;
    const y = (t1 - z) / this.size.z;
    const x = (index - t1) / yz;
    return { x, y, z };
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param color
   */
  addBlock ({ x, y, z }, color) {
    if (typeof color !== 'number') {
      if (Array.isArray(color)) {
        color = rgbToInt( color )
      } else {
        color = 0;
      }
    }

    if (!this.inside(x, y, z)) {
      return;
    }

    const blockIndex = this.blockIndex(x, y, z);
    if (this.blocks[ blockIndex ] === 0) {
      this._voxBlocksNumber ++;
    }
    this.blocks[ blockIndex ] = color;
    this.needsUpdate = true;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number}
   */
  getBlock ({ x, y, z }) {
    if (!this.inside(x, y, z)) {
      return 0;
    }
    return this._blocks[ this.blockIndex(x, y, z) ];
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  removeBlock ({ x, y, z }) {
    if (!this.inside(x, y, z)) {
      return;
    }
    const blockIndex = this.blockIndex(x, y, z);
    this.blocks[ blockIndex ] = 0;
    this.needsUpdate = true;
  }

  /**
   * Gets world coordinates
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
      x: [0, this.size.x],
      y: [0, this.size.y],
      z: [0, this.size.z]
    };
    return x > limits.x[0] && x < limits.x[1] &&
      y >= limits.y[0] && y < limits.y[1] &&
      z > limits.z[0] && z < limits.z[1];
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
   * @returns {number}
   */
  get type () {
    return this._type;
  }

  /**
   * @returns {Uint32Array}
   * @private
   */
  _createBlocksBuffer () {
    return (this._blocks = new Uint32Array( this.bufferSize ));
  }

  /**
   * @private
   */
  _buildModel () {
    let model = this._model;
    let blocks = model.getBlocks();

    for (let i = 0; i < blocks.length; ++i) {
      this.addBlock( blocks[i], blocks[i].color );
    }
  }
}
