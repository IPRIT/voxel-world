export class Particle extends THREE.Mesh {

  constructor (geometry, material) {
    super( geometry, material );
  }

  /**
   * @returns {boolean}
   */
  get shadows () {
    return this.castShadow || this.receiveShadow;
  }

  /**
   * @param {boolean} value
   */
  set shadows (value) {
    this.receiveShadow = value;
    this.castShadow = value;
  }
}
