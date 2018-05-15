export class SpriteLabel extends THREE.Object3D {

  /**
   * @type {THREE.Object3D}
   * @private
   */
  _object3D = null;

  /**
   * @type {{fontFace: string, fontSize: number, borderWidth: number, borderColor: string, backgroundColor: string}}
   * @private
   */
  _defaultOptions = {
    color: 'white',
    fontFace: 'Arial',
    fontSize: 18,
    strokeColor: 'black',
    strokeWidth: 2,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  };

  /**
   * @type {THREE.Sprite}
   * @private
   */
  _sprite = null;

  /**
   * @type {*}
   * @private
   */
  _textMetrics = {};

  /**
   * @type {boolean}
   * @private
   */
  _attachedToObject = false;

  /**
   * @param {THREE.Object3D} object3D
   */
  constructor (object3D) {
    super();
    this._object3D = object3D;
  }

  /**
   * @param {string} text
   * @param {THREE.Vector3} positionOffset
   * @param {{fontFace: string, fontSize: number, borderWidth: number, borderColor: string, backgroundColor: string}} textStyles
   * @returns {SpriteLabel}
   */
  create (text, positionOffset = new THREE.Vector3(), textStyles = {}) {
    const sprite = this._createTextSprite( text, textStyles );
    this.add( sprite );
    this._sprite = sprite;

    this.position.add( positionOffset );

    return this;
  }

  /**
   * @param {THREE.Vector3} positionOffset
   * @returns {SpriteLabel}
   */
  updatePosition (positionOffset = new THREE.Vector3()) {
    this.position.set(0, 0, 0).add( positionOffset );
    return this;
  }

  /**
   * Attaches label to object
   *
   * @returns {SpriteLabel}
   */
  attachToObject () {
    if (this._object3D) {
      this._object3D.add( this );
      this._attachedToObject = true;
    }
    return this;
  }

  /**
   * Detaches label from object
   *
   * @returns {SpriteLabel}
   */
  detachFromObject () {
    if (this._object3D) {
      this._object3D.remove( this );
      this._attachedToObject = false;
    }
    return this;
  }

  /**
   * Detaches & removes sprite
   */
  destroy () {
    this.detachFromObject();
    this._sprite && this.remove( this._sprite );
    this._sprite = null;
  }

  /**
   * @returns {number}
   */
  get textWidth () {
    return this._textMetrics.width || 0;
  }

  /**
   * @param {string} text
   * @param {*} params
   * @returns {*}
   * @private
   */
  _createTextSprite (text, params = {}) {
    let {
      color,
      fontFace,
      fontSize,
      strokeColor,
      strokeWidth,
      borderWidth,
      borderColor,
      backgroundColor
    } = this._mergeDefaultOptions( params );

    let canvas = document.createElement( 'canvas' );
    let context = canvas.getContext( '2d' );

    context.font = "Bold " + fontSize + "px " + fontFace;

    // get size data (height depends only on font size)
    let metrics = context.measureText( text );
    let textWidth = metrics.width;
    this._textMetrics = metrics;

    console.log(metrics, this);

    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
      + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
      + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderWidth;

    if (borderWidth && borderColor !== 'transparent') {
      // 1.4 is extra height factor for text below baseline: g,j,p,q.
      this._roundRect(
        context, borderWidth / 2, borderWidth / 2,
        textWidth + borderWidth, fontSize * 1.4 + borderWidth, 6
      );
    }

    // text color
    context.fillStyle = color;
    context.fillText( text, borderWidth, fontSize + borderWidth );
    context.strokeStyle = strokeColor;
    context.strokeText( text, 0, fontSize + borderWidth * 2 );

    // canvas contents will be used for a texture
    const texture = new THREE.Texture( canvas );
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, fog: true });

    const sprite = new THREE.Sprite( spriteMaterial );
    sprite.position.set(-textWidth / 20, 0, 0);
    sprite.scale.set(10, 5, 1.0);

    return sprite;
  }

  /**
   * @param ctx
   * @param x
   * @param y
   * @param w
   * @param h
   * @param r
   * @private
   */
  _roundRect (ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  /**
   * @param {object} options
   * @returns {object}
   * @private
   */
  _mergeDefaultOptions (options = {}) {
    return Object.assign( {}, this._defaultOptions, options );
  }
}
