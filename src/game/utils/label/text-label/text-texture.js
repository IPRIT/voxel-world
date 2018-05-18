export class TextTexture extends THREE.Texture {

  /**
   * @type {string}
   * @private
   */
  _text = '';

  /**
   * @type {string}
   * @private
   */
  _fontStyle;

  /**
   * @type {string}
   * @private
   */
  _fontVariant;

  /**
   * @type {string}
   * @private
   */
  _fontWeight;

  /**
   * @type {number}
   * @private
   */
  _fontSize;

  /**
   * @type {string}
   * @private
   */
  _fontFamily;

  /**
   * @type {string}
   * @private
   */
  _textAlign;

  /**
   * @type {number}
   * @private
   */
  _lineHeight;

  /**
   * @type {number}
   * @private
   */
  _padding;

  /**
   * @type {boolean}
   */
  autoRedraw = true;

  /**
   * @type {string[]}
   * @private
   */
  _lines;

  /**
   * @type {number}
   * @private
   */
  _textBoxWidthInPixels;

  /**
   * @param {*} options
   */
  constructor (options = {}) {
    let {
      autoRedraw = true, text = '',
      fontStyle = 'normal', fontVariant = 'normal',
      fontWeight = 'normal', fontSize = 16,
      fontFamily = 'sans-serif', textAlign = 'center',
      lineHeight = 1.15, padding = 0.25,
      magFilter = THREE.LinearFilter, minFilter = THREE.LinearFilter,
      mapping, wrapS, wrapT, format, type, anisotropy
    } = options;

    let canvas = document.createElement( 'canvas' );
    super(
      canvas, mapping, wrapS, wrapT,
      magFilter, minFilter, format,
      type, anisotropy
    );
    this._text = text;
    this._fontStyle = fontStyle;
    this._fontVariant = fontVariant;
    this._fontWeight = fontWeight;
    this._fontSize = fontSize;
    this._fontFamily = fontFamily;
    this._textAlign = textAlign;
    this._lineHeight = lineHeight;
    this._padding = padding;

    this.autoRedraw = autoRedraw;

    this.redraw();
  }

  /**
   * Redraws the text
   */
  redraw () {
    let context = this.image.getContext('2d');
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    if (this.textBoxWidthInPixels && this.textBoxHeightInPixels) {
      let [ width, height ] = [ this.paddingBoxWidthInPixels, this.paddingBoxHeightInPixels ];
      context.canvas.width = this.paddingBoxWidthInPixels;
      context.canvas.height = this.paddingBoxHeightInPixels;
      context.font = this.font;
      context.textBaseline = 'middle';
      context.fillStyle = 'white';

      let left;
      switch (this.textAlign) {
        case 'left':
          context.textAlign = 'left';
          left = this.paddingInPixels;
          break;
        case 'right':
          context.textAlign = 'right';
          left = this.paddingInPixels + this.textBoxWidthInPixels;
          break;
        case 'center':
          context.textAlign = 'center';
          left = this.paddingInPixels + this.textBoxWidthInPixels / 2;
          break;
      }

      let top = this.paddingInPixels + this.fontSize / 2;
      for (let i = 0; i < this.lines.length; ++i) {
        context.fillText(this.lines[ i ], left, top);
        context.strokeText(this.lines[ i ], left, top);
        top += this.lineHeightInPixels;
      }
    } else {
      context.canvas.width = context.canvas.height = 1;
    }

    this.needsUpdate = true;
  }

  /**
   * @returns {string}
   */
  get text () {
    return this._text;
  }

  /**
   * @param {string} value
   */
  set text (value) {
    if (this._text === value) {
      return;
    }
    this._text = value;
    this._lines = undefined;
    this._textBoxWidthInPixels = undefined;
    this._redrawIfAuto();
  }

  /**
   * @returns {string[]}
   */
  get lines () {
    if (this._lines === undefined) {
      this._lines = this._text ? this._text.split('\n') : [];
    }
    return this._lines;
  }

  /**
   * @returns {string}
   */
  get fontStyle () {
    return this._fontStyle;
  }

  /**
   * @param {string} value
   */
  set fontStyle (value) {
    if (this._fontStyle === value) {
      return;
    }
    this._fontStyle = value;
    this._textBoxWidthInPixels = undefined;
    this._redrawIfAuto();
  }

  /**
   * @returns {string}
   */
  get fontVariant () {
    return this._fontVariant;
  }

  /**
   * @param {string} value
   */
  set fontVariant (value) {
    if (this._fontVariant === value) {
      return;
    }
    this._fontVariant = value;
    this._textBoxWidthInPixels = undefined;
    this._redrawIfAuto();
  }

  /**
   * @returns {string}
   */
  get fontWeight () {
    return this._fontWeight;
  }

  /**
   * @param {string} value
   */
  set fontWeight (value) {
    if (this._fontWeight === value) {
      return;
    }
    this._fontWeight = value;
    this._textBoxWidthInPixels = undefined;
    this._redrawIfAuto();
  }

  /**
   * @returns {number}
   */
  get fontSize () {
    return this._fontSize;
  }

  /**
   * @param {number} value
   */
  set fontSize (value) {
    if (this._fontSize === value) {
      return;
    }
    this._fontSize = value;
    this._textBoxWidthInPixels = undefined;
    this._redrawIfAuto();
  }

  /**
   * @returns {string}
   */
  get fontFamily () {
    return this._fontFamily;
  }

  /**
   * @param {string} value
   */
  set fontFamily (value) {
    if (this._fontFamily === value) {
      return;
    }
    this._fontFamily = value;
    this._textBoxWidthInPixels = undefined;
    this._redrawIfAuto();
  }

  /**
   * @returns {string}
   */
  get font () {
    return [
      this.fontStyle,
      this.fontVariant,
      this.fontWeight,
      `${this.fontSize}px`,
      this.fontFamily,
    ].join(' ');
  }

  /**
   * @returns {string}
   */
  get textAlign () {
    return this._textAlign;
  }

  /**
   * @param {string} value
   */
  set textAlign (value) {
    if (this._textAlign === value) {
      return;
    }
    this._textAlign = value;
    this._redrawIfAuto();
  }

  /**
   * @returns {number}
   */
  get lineHeight () {
    return this._lineHeight;
  }

  /**
   * @param {number} value
   */
  set lineHeight (value) {
    if (this._lineHeight === value) {
      return;
    }
    this._lineHeight = value;
    this._redrawIfAuto();
  }

  /**
   * @returns {number}
   */
  get lineHeightInPixels () {
    return this.fontSize * this.lineHeight;
  }

  /**
   * @returns {number}
   */
  get textBoxWidthInPixels () {
    if (this._textBoxWidthInPixels === undefined) {
      this._textBoxWidthInPixels = this._computeTextBoxWidth( this.lines, this.font );
    }
    return this._textBoxWidthInPixels;
  }

  /**
   * @returns {number}
   */
  get textBoxHeight () {
    return this.lineHeight * (this.lines.length - 1) + 1;
  }

  /**
   * @returns {number}
   */
  get textBoxHeightInPixels() {
    return this.fontSize * this.textBoxHeight;
  }

  /**
   * @returns {number}
   */
  get padding () {
    return this._padding;
  }

  /**
   * @param {number} value
   */
  set padding (value) {
    if (this._padding === value) {
      return;
    }
    this._padding = value;
    this._redrawIfAuto();
  }

  /**
   * @returns {number}
   */
  get paddingInPixels () {
    return this.fontSize * this.padding;
  }

  /**
   * @returns {number}
   */
  get paddingBoxWidthInPixels () {
    return this.textBoxWidthInPixels + 2 * this.paddingInPixels;
  }

  /**
   * @returns {number}
   */
  get paddingBoxHeight () {
    return this.textBoxHeight + 2 * this.padding;
  }

  /**
   * @returns {number}
   */
  get paddingBoxHeightInPixels () {
    return this.textBoxHeightInPixels + 2 * this.paddingInPixels;
  }

  /**
   * @returns {number}
   */
  get aspect () {
    if (!this.image.width || !this.image.height) {
      return 1;
    }
    return this.image.width / this.image.height;
  }

  /**
   * @private
   */
  _redrawIfAuto () {
    if (this.autoRedraw) {
      this.redraw();
    }
  }

  /**
   * @param {string[]} lines
   * @param {string} font
   * @returns {number}
   * @private
   */
  _computeTextBoxWidth (lines, font) {
    if ( !lines.length ) {
      return 0;
    }

    let canvas = document.createElement( 'canvas' );
    let context = canvas.getContext( '2d' );
    context.font = font;

    return Math.max(
      ...lines.map( line => context.measureText( line ).width )
    );
  }
}
