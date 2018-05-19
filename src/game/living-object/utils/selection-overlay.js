import { warp } from "../../utils";
import { TEXTURE_SELECTION_IMAGE } from "../../constants";

export class SelectionOverlay extends THREE.Object3D {

  /**
   * @type {SelectionOverlay}
   * @private
   */
  static _instance = null;

  /**
   * @returns {SelectionOverlay}
   */
  static getOverlay () {
    if (!this._instance) {
      return ( this._instance = new SelectionOverlay() );
    }
    return this._instance;
  }

  /**
   * @type {THREE.Mesh}
   * @private
   */
  _sprite = null;

  /**
   * @type {THREE.Mesh}
   * @private
   */
  _cylinder = null;

  /**
   * @type {number}
   * @private
   */
  _cylinderVerticalTheta = 0;

  /**
   * @type {LivingObject}
   * @private
   */
  _attachedTo = null;

  constructor () {
    super();
    this.create();
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    this.rotateY(
      warp( -0.03, deltaTime )
    );
    this._cylinderVerticalTheta += warp( .1, deltaTime );
    let verticalOffset = Math.sin( this._cylinderVerticalTheta ) / 10;
    this._cylinder.position.add({
      x: 0, y: verticalOffset, z: 0
    });
  }

  create () {
    const textureLoader = new THREE.TextureLoader();

    this._texture = textureLoader.load( TEXTURE_SELECTION_IMAGE );
    this._texture.minFilter = this._texture.magFilter = THREE.LinearFilter;
    this._texture.anisotropy = 1;

    const material = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      map: this._texture,
      transparent: true,
      opacity: 0.8,
      emissive: 0x444444,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneBufferGeometry( 5, 5 );

    this._sprite = new THREE.Mesh( geometry, material );
    this._sprite.rotateX( -Math.PI / 2 );
    this._sprite.scale.set(2.5, 2.5, 1);
    this._sprite.position.set(0, .01, 0);
    this._sprite.receiveShadow = true;

    const cylGeometry = new THREE.CylinderGeometry( 3, 0, 4.5, 4, 1, false );
    const cylMaterial = new THREE.MeshLambertMaterial({ color: 0xfffa9e });
    this._cylinder = new THREE.Mesh( cylGeometry, cylMaterial );

    this.add( this._sprite );
    this.add( this._cylinder );
  }

  /**
   * @param {LivingObject} object3D
   */
  attachToObject (object3D) {
    if (!object3D) {
      return;
    } else if (this._attachedTo) {
      this.detachFromObject();
    }
    this._cylinder.position.set(0, object3D.objectHeight * 2, 0);
    this._cylinderVerticalTheta = 0;
    object3D.add( this );
    this._attachedTo = object3D;
  }

  /**
   * Detaches selection sprite from living object
   */
  detachFromObject () {
    if (!this._attachedTo) {
      return;
    }
    this._attachedTo.remove( this );
  }

  /**
   * @returns {LivingObject}
   */
  get attachedTo () {
    return this._attachedTo;
  }

  /**
   * @returns {boolean}
   */
  get isAttached () {
    return !!this._attachedTo;
  }
}
