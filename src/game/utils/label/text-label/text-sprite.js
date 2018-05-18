import { TextTexture } from './text-texture';

const MAX_FONT_SIZE = 100;

export class TextSprite extends THREE.Sprite {

  /**
   * @type {number}
   * @private
   */
  _textSize = 1;

  /**
   * @type {number}
   * @private
   */
  _redrawIntervalMs = 200;

  /**
   * @type {number}
   * @private
   */
  _maxFontSize = MAX_FONT_SIZE;

  /**
   * @type {number}
   * @private
   */
  _lastRedraw = 0;

  /**
   * @type {number}
   * @private
   */
  _distanceToCamera = 0;

  /**
   * @type {number}
   * @private
   */
  _scaleModifier = 1;

  /**
   * @param {*} options
   */
  constructor(options = {}) {
    let {
      textSize = 1,
      redrawIntervalMs = 0,
      maxFontSize = MAX_FONT_SIZE,
      textureOptions = {},
      materialOptions = {}
    } = options;

    const texture = new TextTexture( textureOptions );
    const material = new THREE.SpriteMaterial({
      map: texture,
      ...materialOptions
    });

    super( material );

    this._textSize = textSize;
    this._redrawIntervalMs = redrawIntervalMs;
    this._maxFontSize = maxFontSize;
    this._lastRedraw = Date.now();
  }

  /**
   * @returns {boolean}
   */
  get isTextSprite () {
    return true;
  }

  /**
   * @param renderer
   * @param scene
   * @param camera
   */
  onBeforeRender (renderer, scene, camera) {
    this.redraw( renderer, camera );
  }

  /**
   * Updates scale of text
   */
  updateScale () {
    this.scale.set( this.material.map.aspect, 1, 1 )
      .multiplyScalar(
        this._textSize * this.material.map.paddingBoxHeight * this._scaleModifier
      );
  }

  /**
   * @param {*} args
   * @returns {*}
   */
  updateMatrix (...args) {
    this.updateScale();
    return super.updateMatrix(...args);
  }

  /**
   * @param renderer
   * @param camera
   */
  redraw (renderer, camera) {
    if (!this._redrawIntervalMs
      || this._lastRedraw + this._redrawIntervalMs < Date.now()) {
      this.redrawNow( renderer, camera );
      this._lastRedraw = Date.now();
    }
  }

  /**
   * @param {WebGLRenderer} renderer
   * @param {THREE.PerspectiveCamera} camera
   */
  redrawNow (renderer, camera) {
    this.updateScale();
    this.material.map.fontSize = Math.min(
      THREE.Math.ceilPowerOfTwo(
        this._computeOptimalFontSize( renderer, camera )
      ),
      this._maxFontSize
    );

    if (!this.material.map.autoRedraw) {
      this.material.map.redraw();
    }
  }

  /**
   * Disposes texture
   */
  dispose () {
    this.material.map.dispose();
    this.material.dispose();

    if (super.dispose) {
      super.dispose();
    }
  }

  /**
   * @returns {number}
   */
  get distanceToCamera () {
    return this._distanceToCamera;
  }

  /**
   * @returns {number}
   */
  get scaleModifier () {
    return this._scaleModifier;
  }

  /**
   * @param {number} value
   */
  set scaleModifier (value) {
    this._scaleModifier = value;
  }

  /**
   * @param {WebGLRenderer} renderer
   * @param {THREE.PerspectiveCamera} camera
   * @returns {number}
   * @private
   */
  _computeOptimalFontSize (renderer, camera) {
    const objectWorldPosition = new THREE.Vector3();
    const cameraWorldPosition = new THREE.Vector3();
    const objectWorldScale = new THREE.Vector3();

    if (renderer.domElement.width
      && renderer.domElement.height
      && this.material.map.lines.length) {

      let distance = this.getWorldPosition( objectWorldPosition )
        .distanceTo(
          camera.getWorldPosition( cameraWorldPosition )
        );

      this._distanceToCamera = distance;

      if (distance) {
        let heightInPixels = this.getWorldScale( objectWorldScale ).y
          * renderer.domElement.height / distance;

        if (heightInPixels) {
          return Math.round(
            heightInPixels / this.material.map.paddingBoxHeight
          );
        }
      }
    }

    return 0;
  }
}
