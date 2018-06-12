import { TextLabel } from "../../utils/label/text-label";
import { extendDeep } from "../../utils";
import { translate } from "../../utils/i18n/translate";

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

    const fontColor = isForeign ? '#eab929' : '#f90000';

    let textOptions = {
      textSize: 3,
      textureOptions: {
        fontWeight: 'bold',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontColor,
        strokeColor: 'rgba(0, 0, 0, .6)',
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
      extendDeep(textOptions, {
        textSize: 4,
        textureOptions: {
          strokeWidth: 2
        }
      });
    }

    super( text, textOptions, object3D );

    this._damage = damage;
    this._isForeign = isForeign;
    this._isCritical = isCritical;
    this._isMiss = isMiss;
    this._isImmunity = isImmunity;
  }
}
