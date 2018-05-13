import { WorldObjectBase } from "../world-object-base";
import { ModelType, SkinnedObjectLoader } from "../../../model";
import { WorldObjectType } from "../index";
import { WORLD_MAP_BLOCK_SIZE } from "../../../settings";

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
   * Setting up skinned object
   */
  constructor () {
    super(WorldObjectType.OBJECT, ModelType.SKINNED);
  }

  /**
   * @param {*} options
   */
  init (options = {}) {
    super.init( options );
    return this._load().then(([ model ]) => {
      this._createMesh( model );
      this.attachMesh();
    });
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
   * @returns {Promise<*>}
   * @private
   */
  async _load () {
    let { model } = await this._loadObjectModel();
    return [ model ];
  }

  async _loadObjectModel () {
    const { modelName } = this.options;

    let skinnedObjectLoader = SkinnedObjectLoader.getLoader();
    return skinnedObjectLoader.load( modelName );
  }

  /**
   * @param {THREE.BufferGeometry|THREE.Geometry} geometry
   * @param {THREE.Material} material
   */
  _createMesh ({ geometry, material } = {}) {
    /*geometry = new THREE.CylinderGeometry(
      .1 * WORLD_MAP_BLOCK_SIZE,
      .1 * WORLD_MAP_BLOCK_SIZE,
      WORLD_MAP_BLOCK_SIZE * 3,
      18,
      4,
      false
    );*/

    this._geometry = geometry;
    this._material = material;

    let skinnedMesh = new THREE.SkinnedMesh( geometry, material );
    // let skinnedMesh = new THREE.Mesh( geometry, material );
    // skinnedMesh.position.y = WORLD_MAP_BLOCK_SIZE * 3 / 2;

    skinnedMesh.castShadow = true;
    skinnedMesh.receiveShadow = true;

    skinnedMesh.scale.set( this.worldScale, -this.worldScale, this.worldScale );

    this.mesh = skinnedMesh;
  }
}

