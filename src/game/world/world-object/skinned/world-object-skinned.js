import { WorldObjectBase } from "../world-object-base";

export class WorldObjectSkinned extends WorldObjectBase {

  /**
   * @type {THREE.BufferGeometry|THREE.Geometry}
   * @private
   */
  _geometry = null;

  /**
   * @type {THREE.Material}
   * @private
   */
  _material = null;

  /**
   * @param {*} options
   */
  init (options = {}) {
    super.init( options );
    this._createMesh( options );
    this.attachMesh();
  }

  /**
   * @returns {THREE.BufferGeometry|THREE.Geometry}
   */
  get geometry () {
    return this._geometry;
  }

  /**
   * @param {THREE.BufferGeometry|THREE.Geometry} value
   */
  set geometry (value) {
    this._geometry = value;
  }

  /**
   * @returns {THREE.Material}
   */
  get material () {
    return this._material;
  }

  /**
   * @returns {THREE.AnimationClip[]}
   */
  get geometryAnimations () {
    return this.mesh.geometry.animations || [];
  }

  /**
   * @returns {THREE.AnimationClip[]}
   */
  get geometryAnimationNames () {
    return this.geometryAnimations.map(animation => animation.name);
  }

  /**
   * @param {THREE.BufferGeometry|THREE.Geometry} geometry
   * @param {THREE.Material} material
   */
  _createMesh ({ geometry, material } = {}) {
    this._geometry = geometry;
    this._material = material;

    let skinnedMesh = new THREE.SkinnedMesh( geometry, material );
    skinnedMesh.castShadow = true;
    skinnedMesh.receiveShadow = true;

    skinnedMesh.scale.set( .4, -.4, .4 );

    this.mesh = skinnedMesh;
  }
}

