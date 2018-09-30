import { Player } from "../../living-object/player";
import { GameConnection } from "../game-connection";
import { throttle } from "../../../util/common-utils";
import { NetworkPlayerEvents } from "./network-player-events";
import { isVectorZero } from "../../utils";

export class NetworkPlayer extends Player {

  /**
   * @type {Function}
   * @private
   */
  _sendTargetLocationThrottled = throttle( this._sendTargetLocation.bind( this ), 250 );

  /**
   * @type {Function}
   * @private
   */
  _sendTargetLocationFastThrottled = throttle( this._sendTargetLocation.bind( this ), 25 );

  /**
   * @type {number}
   * @private
   */
  _lastTargetLocationSentAtMs = 0;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _lastTargetLocation = null;

  /**
   * @param {THREE.Vector3} location
   * @param {boolean} isInfinite
   */
  setTargetLocation (location, isInfinite = false) {
    this.emitTargetLocation( location, isInfinite );
    super.setTargetLocation( location, isInfinite );
  }

  /**
   * @param {LivingObject} livingObject
   */
  setTargetObject (livingObject) {
    if (livingObject) {
      this.socket.emit( NetworkPlayerEvents.SET_TARGET_OBJECT, livingObject.id );
    }

    super.setTargetObject( livingObject );
  }

  jump () {
    this.socket.emit( NetworkPlayerEvents.JUMP );

    super.jump();
  }

  /**
   * @param {THREE.Vector3} location
   * @param {boolean} isInfinite
   */
  emitTargetLocation (location, isInfinite) {
    const lastTargetLocation = this._lastTargetLocation;
    const args = [ location, isInfinite, Date.now() ];

    let needsToSend = true;
    if (isInfinite && lastTargetLocation) {
      const diffVector = lastTargetLocation.clone().subVectors( lastTargetLocation, location );
      if (isVectorZero( diffVector, 10 )) {
        needsToSend = false;
      }
    }

    if (needsToSend) {
      if (!isInfinite || !lastTargetLocation
        || lastTargetLocation.angleTo( location ) < Math.PI / 6) {
        this._sendTargetLocationThrottled( ...args );
      } else {
        this._sendTargetLocationFastThrottled( ...args );
      }
    }
  }

  /**
   * @returns {GameConnection}
   */
  get connection () {
    return GameConnection.getConnection();
  }

  /**
   * @returns {Socket}
   */
  get socket () {
    return this.connection.socket;
  }

  /**
   * @param {THREE.Vector3} location
   * @param {boolean} isInfinite
   * @param {number} calledAtMs
   * @private
   */
  _sendTargetLocation (location = this.targetLocation, isInfinite = this.targetLocationInfinite, calledAtMs = 0) {
    if (calledAtMs <= this._lastTargetLocationSentAtMs) {
      return;
    }

    this._lastTargetLocationSentAtMs = Date.now();
    this._lastTargetLocation = location;

    this.socket.emit( NetworkPlayerEvents.SET_TARGET_LOCATION, location.toArray(), isInfinite, this._lastTargetLocationSentAtMs );
  }
}
