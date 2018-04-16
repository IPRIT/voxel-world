export class VoxModel {

  _voxelData = null;
  _rotated = false;

  /**
   * @param {*} voxelData
   * @param {boolean} rotated
   */
  constructor (voxelData, rotated = false) {
    this._voxelData = voxelData;
    !rotated && this._rotate();
  }

  /**
   * @returns {Array<{color: number[], x: number, y: number, z: number}>}
   */
  getBlocks () {
    const result = [];
    for (let index = 0; index < this.xyzi.length; ++index) {
      result.push( this.getBlock(index) );
    }
    return result;
  }

  /**
   * @param {number} index
   * @returns {{color: number[], x: number, y: number, z: number, c: number}}
   */
  getBlock (index) {
    const xyzi = this.xyzi[ index ];
    return {
      color: this.getColorArrayByIndex(xyzi.c),
      ...xyzi
    };
  }

  /**
   * @param {number} index
   * @returns {number[]}
   */
  getPositionArrayByIndex (index) {
    const position = this.getPositionObjectByIndex(index);
    return [ position.x, position.y, position.z ];
  }

  /**
   * @param {number} index
   * @returns {{x: number, y: number, z: number}}
   */
  getPositionObjectByIndex (index) {
    return this.xyzi[ index ];
  }

  /**
   * @param {number} index
   * @returns {number[]}
   */
  getColorArrayByIndex (index) {
    const color = this.getColorObjectByIndex(index);
    return [ color.r, color.g, color.b, color.a ];
  }

  /**
   * @param {number} index
   * @returns {{r: number, g: number, b: number, a: number}}
   */
  getColorObjectByIndex (index) {
    const color = this.rgba[ index ];
    if (!color) {
      return { r: 0, g: 0, b: 0, a: 1};
    }
    return color;
  }

  /**
   * @returns {{x: number, y: number, z: number, c: number}[]}
   */
  get xyzi () {
    return this._voxelData.XYZI;
  }

  /**
   * @returns {{r: number, g: number, b: number, a: number}[]}
   */
  get rgba () {
    return this._voxelData.RGBA;
  }

  /**
   * @returns {{x: number, y: number, z: number}}
   */
  get size () {
    return this._voxelData.SIZE;
  }

  _rotate () {
    if (this._rotated) {
      console.warn('Model has been rotated before', this);
    }
    const rotatedXyzi = [];
    for (let index = 0, length = this.xyzi.length; index < length; ++index) {
      let { x, y, z, c } = this.xyzi[ index ];
      rotatedXyzi.push({ x: x, y: z, z: y, c });
    }
    this._voxelData.XYZI = rotatedXyzi;
    this._rotated = true;
  }
}
