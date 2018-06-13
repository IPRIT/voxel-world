import { TextLabel } from "../../../utils/label/text-label/index";
import { translate } from "../../../utils/i18n/translate";

export class DamageText extends TextLabel {

  /**
   * @type {number}
   * @private
   */
  _damage = 0;

  /**
   * @type {boolean}
   * @private
   */
  _isForeign = false;

  /**
   * @type {boolean}
   * @private
   */
  _isCritical = false;

  /**
   * @type {boolean}
   * @private
   */
  _isMiss = false;

  /**
   * @type {boolean}
   * @private
   */
  _isImmunity = false;

  /**
   * @param {*} options
   * @param {THREE.Object3D} object3D
   */
  constructor (options = {}, object3D = {}) {
    let {
      damage = 1,
      isForeign = false,
      isCritical = false,
      isMiss = false,
      isImmunity = false
    } = options;

    const fontColor = isForeign ? '#ffca2d' : '#f90000';
    const strokeColor = isForeign ? 'rgba(0, 0, 0, .5)' : 'rgba(0, 0, 0, .3)';

    let textOptions = {
      textSize: 5,
      textureOptions: {
        fontWeight: 'bold',
        fontFamily: '"Yanone Kaffeesatz", Arial, Helvetica, sans-serif',
        fontColor,
        strokeColor,
        strokeWidth: 1
      }
    };

    let text = '0';
    if (isMiss) {
      text = translate( 'miss' );
    } else if (isImmunity) {
      text = translate( 'immunity' );
    } else if (isCritical && damage > 0) {
      text = `${translate( 'critical_hit' )} ${damage}`;
    } else {
      text = (Number( damage ) || 0).toFixed(0).toString();
    }

    super( text, textOptions, object3D );

    this._damage = damage;
    this._isForeign = isForeign;
    this._isCritical = isCritical;
    this._isMiss = isMiss;
    this._isImmunity = isImmunity;
  }
}
