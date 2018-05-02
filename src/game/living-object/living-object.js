import { WorldObjectAnimated } from "../world/world-object/animated";
import { warp } from "../utils";
import { WORLD_MAP_BLOCK_SIZE } from "../settings";

const EPS = 1e-5;

export class LivingObject extends WorldObjectAnimated {

  /**
   * @type {THREE.Vector3}
   */
  _targetLocation = null;

  /**
   * @type {LivingObject}
   */
  _targetObject = null;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _velocityDirection = new THREE.Vector3(0, 0, 0);

  /**
   * @type {number}
   * @private
   */
  _velocityScalar = 0;

  /**
   * @type {THREE.Matrix4}
   * @private
   */
  _rotationMatrix;

  /**
   * Player needs to get the target
   * @type {boolean}
   * @private
   */
  _coming = false;

  /**
   * @param {object} options
   * @returns {*}
   */
  init (options = {}) {
    this._initOptions( options );
    return super.init( options );
  }

  /**
   * @param {number} deltaTime
   */
  update ( deltaTime ) {
    if (this._coming) {
      if (this._targetObject && !this._targetLocation) {
        this._updateVelocityDirection();
      }

      if (this.getComingLocationDistance() > 2 * this._velocityScalar) {
        this._nextPosition( deltaTime );
      } else {
        this.setComingState( false );
      }
    }

    super.update( deltaTime );
  }

  /**
   * @param {THREE.Vector3} location
   */
  setTargetLocation (location) {
    if (location) {
      this._targetLocation = new THREE.Vector3(location.x, location.y, location.z);
      this._updateVelocityDirection();
      this.setComingState();
    }
  }

  /**
   * @param {LivingObject} livingObject
   */
  setTargetObject (livingObject) {
    if (livingObject) {
      this._targetObject = livingObject;
      this._targetLocation = null;
      this._updateVelocityDirection();
    }
  }

  /**
   * @param {boolean} coming
   */
  setComingState (coming = true) {
    this._coming = coming;

    if (this.animationMixerInited) {
      let actionName;
      if (coming) {
        actionName = 'RunAction';
      } else {
        actionName = 'Pose';
      }
      if (this.currentClipActionName !== actionName) {
        this.activateClipAction( actionName );
      }
    }
  }

  /**
   * @param {number} velocityScalar
   */
  setVelocityScalar (velocityScalar) {
    this._velocityScalar = velocityScalar;
  }

  /**
   * @returns {THREE.Vector3}
   */
  getComingLocation () {
    if (this._targetLocation) {
      return this._targetLocation.clone();
    }
    return this._targetObject && this.targetObject.position.clone();
  }

  /**
   * @returns {number}
   */
  getComingLocationDistance () {
    let comingLocation = this.getComingLocation();
    return comingLocation && comingLocation.distanceTo( this.position ) || 0;
  }

  /**
   * @returns {THREE.Vector3}
   */
  get targetLocation () {
    return this._targetLocation;
  }

  /**
   * @returns {LivingObject}
   */
  get targetObject () {
    return this._targetObject;
  }

  /**
   * @returns {boolean}
   */
  get isComing () {
    return this._coming;
  }

  /**
   * @returns {number}
   */
  get velocityScalar () {
    return this._velocityScalar;
  }

  /**
   * @returns {THREE.Vector3}
   */
  get velocityDirection () {
    return this._velocityDirection;
  }

  /**
   * @param {object} options
   * @private
   */
  _initOptions (options) {
    let { velocityScalar } = options;
    this._velocityScalar = velocityScalar;
  }

  /**
   * @param {number} deltaTimeMs
   * @private
   */
  _nextPosition ( deltaTimeMs ) {
    let shiftVector = this._velocityDirection.clone()
      .normalize()
      .multiplyScalar(
        warp( this._velocityScalar, deltaTimeMs )
      );

    let { shiftPosition, changed } = this._clampNextPosition(shiftVector);

    if (changed) {
      this._updateVelocityDirection();
    }

    let oldPosition = this.position.clone();
    this.position.add( shiftPosition );
    let distancePassed = oldPosition.distanceTo( this.position );
    if (distancePassed < .001) {
      this.setComingState( false );
    }

    if (this.mesh) {
      this.mesh.setRotationFromMatrix( this._rotationMatrix );
    }
  }

  /**
   * @param {THREE.Vector3} shiftVector
   * @private
   */
  _clampNextPosition (shiftVector) {
    let shiftX = shiftVector.x;
    let shiftY = shiftVector.y;
    let shiftZ = shiftVector.z;

    const bs = WORLD_MAP_BLOCK_SIZE;

    let currentPosition = this.position.clone();
    let desiredPosition = currentPosition.clone().add( shiftVector );

    let playerRadius = bs * 1.5;
    let playerHeight = bs * 3;

    let blockPosition = new THREE.Vector3(
      this._blockCoord(currentPosition.x) + 1,
      this._blockCoord(currentPosition.y) + (shiftY > 0 ? playerHeight / bs : 0),
      this._blockCoord(currentPosition.z) + 1
    );

    let map = game.world.map;

    let changed = false;

    // clamp for X
    {
      let shiftXVector = new THREE.Vector3(Math.sign(shiftX), 0, 0);
      let nextBlockPosition = blockPosition.clone().add( shiftXVector );
      let frontBlocksPositions = [
        nextBlockPosition.clone(),
        nextBlockPosition.clone().add(new THREE.Vector3(0, 1, 0)),
        nextBlockPosition.clone().add(new THREE.Vector3(0, 2, 0))
      ];
      let frontBlocks = frontBlocksPositions.map(frontBlockPosition => {
        return map.getBlock(frontBlockPosition);
      });

      for (let blockIndex = frontBlocks.length - 1; blockIndex >= 0; --blockIndex) {
        let frontBlock = frontBlocks[ blockIndex ];
        if (!frontBlock) {
          continue;
        }
        let frontBlockWorldPosition = frontBlocksPositions[ blockIndex ].clone()
          .add({x: -1, y: 0, z: -1 }).multiplyScalar( bs );
        let playerPoint = currentPosition.clone().setY(frontBlockWorldPosition.y);
        let nextPlayerPoint = desiredPosition.clone().setY(frontBlockWorldPosition.y);
        let linePointA = frontBlockWorldPosition.clone();
        let linePointB = frontBlockWorldPosition.clone().add(new THREE.Vector3(0, 0, bs));

        if (shiftX < 0) {
          linePointA.add({ x: bs, y: 0, z: 0 });
          linePointB.add({ x: bs, y: 0, z: 0 });
        }

        let line = new THREE.Line3(linePointA, linePointB);
        let crossPoint = new THREE.Vector3();
        line.closestPointToPoint(playerPoint, false, crossPoint);

        let distanceToPlane = nextPlayerPoint.distanceTo( crossPoint );

        if (distanceToPlane < playerRadius) {
          let overlapBy = playerRadius - distanceToPlane;
          shiftX = 0;
          changed = true;
          break;
        }
      }
    }

    // clamp for Z
    {
      let shiftZVector = new THREE.Vector3(0, 0, Math.sign(shiftZ));
      let nextBlockPosition = blockPosition.clone().add( shiftZVector );
      let frontBlocksPositions = [
        nextBlockPosition.clone(),
        nextBlockPosition.clone().add(new THREE.Vector3(0, 1, 0)),
        nextBlockPosition.clone().add(new THREE.Vector3(0, 2, 0))
      ];
      let frontBlocks = frontBlocksPositions.map(frontBlockPosition => {
        return map.getBlock(frontBlockPosition);
      });

      for (let blockIndex = frontBlocks.length - 1; blockIndex >= 0; --blockIndex) {
        let frontBlock = frontBlocks[ blockIndex ];
        if (!frontBlock) {
          continue;
        }
        let frontBlockWorldPosition = frontBlocksPositions[ blockIndex ].clone()
          .add({x: -1, y: 0, z: -1 }).multiplyScalar( bs );
        let playerPoint = currentPosition.clone().setY(frontBlockWorldPosition.y);
        let nextPlayerPoint = desiredPosition.clone().setY(frontBlockWorldPosition.y);
        let linePointA = frontBlockWorldPosition.clone();
        let linePointB = frontBlockWorldPosition.clone().add(new THREE.Vector3(bs, 0, 0));

        if (shiftZ < 0) {
          linePointA.add({ x: 0, y: 0, z: bs });
          linePointB.add({ x: 0, y: 0, z: bs });
        }

        let line = new THREE.Line3(linePointA, linePointB);
        let crossPoint = new THREE.Vector3();
        line.closestPointToPoint(playerPoint, false, crossPoint);

        let distanceToPlane = nextPlayerPoint.distanceTo( crossPoint );

        if (distanceToPlane < playerRadius) {
          let overlapBy = playerRadius - distanceToPlane;
          shiftZ = 0;
          changed = true;
          break;
        }
      }
    }

    // clamp for Y
    {
      let shiftYVector = new THREE.Vector3(0, Math.sign(shiftY), 0);
      let nextBlockPosition = blockPosition.clone().add( shiftYVector );
      let frontBlocksPositions = [
        nextBlockPosition.clone()
      ];
      let frontBlocks = frontBlocksPositions.map(frontBlockPosition => {
        return map.getBlock(frontBlockPosition);
      });

      for (let blockIndex = frontBlocks.length - 1; blockIndex >= 0; --blockIndex) {
        let frontBlock = frontBlocks[ blockIndex ];
        if (!frontBlock) {
          continue;
        }
        let frontBlockWorldPosition = frontBlocksPositions[ blockIndex ].clone().multiplyScalar( bs );
        let nextPlayerPoint = desiredPosition.clone();

        let yDiff = 0;
        if (shiftY < 0) {
          yDiff = nextPlayerPoint.y - (frontBlockWorldPosition.y + bs);
        } else {
          yDiff = frontBlockWorldPosition.y - (nextPlayerPoint.y + playerHeight);
        }
        if (yDiff < 0) {
          shiftY = shiftY < 0 ? shiftY - yDiff : shiftY + yDiff;
          changed = true;
          break;
        }
      }
    }

    return {
      shiftPosition: shiftVector.setX(shiftX).setZ(shiftZ).setY(shiftY),
      changed
    };
  }

  /**
   * @param {number} value
   * @returns {number}
   * @private
   */
  _worldBlockCoord (value) {
    return this._blockCoord(value) * WORLD_MAP_BLOCK_SIZE;
  }

  /**
   * @param {number} value
   * @returns {number}
   * @private
   */
  _blockCoord (value) {
    return (value / WORLD_MAP_BLOCK_SIZE) | 0;
  }

  /**
   * @private
   */
  _updateVelocityDirection () {
    let target = this.getComingLocation();
    let current = this.position.clone();
    this._velocityDirection = target.sub( current ).normalize();

    this._updateRotationMatrix();
  }

  /**
   * @private
   */
  _updateRotationMatrix () {
    let velocityDirection = this._velocityDirection.clone();
    let originDirection = new THREE.Vector3(0, 0, -1);

    let cross = velocityDirection.clone().cross(originDirection);

    let angle = velocityDirection.angleTo( originDirection );
    let angleSign = cross.y < 0 ? 1 : -1;

    let rotationMatrix = new THREE.Matrix4();
    let axis = new THREE.Vector3( 0, 1, 0 ).normalize();
    rotationMatrix.makeRotationAxis( axis, angleSign * angle );

    this._rotationMatrix = rotationMatrix;
  }
}
