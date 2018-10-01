import { Player } from "../../living-object/player";
import { GameConnection } from "../game-connection";
import { throttle } from "../../../util/common-utils";
import { NetworkPlayerEvents } from "./network-player-events";
import { isVectorZero } from "../../utils";
import { StopMovingReason } from "../../living-object/living-object";
import { Game } from "../../game";
import { SphereParticle } from "../../visual-effects/particle";
import { Tween } from "../../utils/tween";
import { WORLD_MAP_BLOCK_SIZE } from "../../settings";

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
  _lastActionAtMs = 0;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _lastTargetLocation = null;

  /**
   * @param {Object} options
   * @returns {*}
   */
  init (options) {
    this._initNetworkCursor();

    return super.init( options );
  }

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
      this.socket.emit( NetworkPlayerEvents.SET_TARGET_OBJECT, livingObject.id, Date.now() );
    }

    super.setTargetObject( livingObject );
  }

  jump () {
    this.socket.emit( NetworkPlayerEvents.JUMP, Date.now() );

    super.jump();
  }

  /**
   * Start moving to the target
   */
  startMoving () {
    super.startMoving();
  }

  /**
   * @param {Symbol} reason
   */
  stopMoving (reason) {
    this._lastTargetLocation = null;

    if (this.isMoving && reason === StopMovingReason.CANCEL_BY_USER) {
      this._emitStopMoving( Date.now() );
    }

    super.stopMoving( reason );
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
    if (!this._isActualAction( calledAtMs )) {
      console.log( calledAtMs, this._lastActionAtMs );
      return;
    }

    this._updateLastAction();
    this._lastTargetLocation = location;

    this.socket.emit(
      NetworkPlayerEvents.SET_TARGET_LOCATION,
      location.toArray(),
      isInfinite,
      this._lastActionAtMs
    );
  }

  /**
   * @param {number} calledAtMs
   * @private
   */
  _emitStopMoving (calledAtMs = Date.now()) {
    if (!this._isActualAction( calledAtMs )) {
      return;
    }
    this._updateLastAction();

    this.socket.emit( NetworkPlayerEvents.STOP_MOVING, Date.now() );
  }

  /**
   * @private
   */
  _updateLastAction () {
    this._lastActionAtMs = Date.now();
  }

  /**
   * @param {number} calledAtMs
   * @returns {boolean}
   * @private
   */
  _isActualAction (calledAtMs = 0) {
    return calledAtMs > this._lastActionAtMs;
  }

  /**
   * @private
   */
  _initNetworkCursor () {
    const particle = new SphereParticle({ size: 2, color: 0xff15a0 });
    const game = Game.getInstance();
    game.scene.add( particle );
    particle.position.copy( this.position );

    const connection = this.connection;
    connection.on( 'player.position', position => {
      position[1] = this.objectHeight + 2 + this.worldPosition.y;
      particle.position.copy( new THREE.Vector3( ...position ) );
    });
  }
}
