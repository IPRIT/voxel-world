import { WorldObjectAnimated } from "../world/world-object/animated";
import { warp } from "../utils";
import { WORLD_MAP_BLOCK_SIZE } from "../settings";
import { ObjectGravity } from "../physic";
import { debugPoints } from "../utils/debug-utils";

export class LivingObject extends WorldObjectAnimated {

  /**
   * @type {THREE.Vector3}
   */
  _targetLocation = null;

  /**
   * @type {boolean}
   * @private
   */
  _targetLocationInfinite = false;

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
   * @type {number}
   * @private
   */
  _objectBlocksHeight = 3;

  /**
   * @type {number}
   * @private
   */
  _objectBlocksRadius = 1;

  /**
   * @type {ObjectGravity}
   * @private
   */
  _gravity = new ObjectGravity();

  /**
   * @type {THREE.Matrix4}
   * @private
   */
  _rotationMatrix;

  /**
   * Object needs to get the target
   * @type {boolean}
   * @private
   */
  _coming = false;

  /**
   * @type {boolean}
   * @private
   */
  _isJumping = false;

  /**
   * @type {boolean}
   * @private
   */
  _needsVerticalUpdate = true;

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

      if (this.getComingLocationDistance() > warp( this._velocityScalar, deltaTime )) {
        this._nextPosition( deltaTime );
      } else {
        this.setComingState( false );
      }
    }

    if (this._needsVerticalUpdate) {
      this._updateVerticalPosition( deltaTime );
    }

    super.update( deltaTime );
  }

  /**
   * @param {THREE.Vector3} location
   * @param {boolean} infinite
   */
  setTargetLocation (location, infinite = false) {
    if (location) {
      this._targetLocation = new THREE.Vector3(location.x, location.y, location.z);
      this._targetLocationInfinite = infinite;
      this._updateVelocityDirection();
      this.setComingState();
    }
  }

  /**
   * @param {LivingObject} livingObject
   */
  setTargetObject (livingObject) {
    if (livingObject) {
      if (this._targetObject
        && this._targetObject.id === livingObject.id) {
        this.setComingState();
      }
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
        // this.activateClipAction( actionName );
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
    return comingLocation && comingLocation.setY( 0 )
      .distanceTo(
        this.position.clone().setY( 0 )
      ) || 0;
  }

  jump () {
    if (!this._needsVerticalUpdate) {
      this._resumeVerticalUpdate();
    }
    this._isJumping = true;
    this._gravity.setVelocity(-50);
  }

  /**
   * @returns {THREE.Vector3}
   */
  get targetLocation () {
    return this._targetLocation;
  }

  /**
   * @returns {boolean}
   */
  get targetLocationInfinite () {
    return this._targetLocationInfinite;
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
   * @returns {boolean}
   */
  get isJumping () {
    return this._isJumping;
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
   * @returns {number}
   */
  get objectBlocksHeight () {
    return this._objectBlocksHeight;
  }

  /**
   * @returns {number}
   */
  get objectBlocksRadius () {
    return this._objectBlocksRadius;
  }

  /**
   * @param {object} options
   * @private
   */
  _initOptions (options) {
    let { velocityScalar, objectBlocksHeight, objectBlocksRadius } = options;
    this._velocityScalar = velocityScalar;
    this._objectBlocksHeight = objectBlocksHeight;
    this._objectBlocksRadius = objectBlocksRadius;
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _nextPosition ( deltaTime ) {
    let shiftVector = this._velocityDirection.clone()
      .normalize()
      .multiplyScalar(
        warp( this._velocityScalar, deltaTime )
      );

    let { shiftPosition, changed } = this._clampNextPosition(shiftVector);

    if (changed) {
      this._updateVelocityDirection();
    }

    let oldPosition = this.position.clone();
    this.position.add( shiftPosition.setY( 0 ) );
    let distancePassed = oldPosition.distanceTo( this.position );
    if (distancePassed < .01) {
      this.setComingState( false );
    }

    if (!this._needsVerticalUpdate) {
      this._resumeVerticalUpdate();
    }

    if (this.mesh) {
      this.mesh.setRotationFromMatrix( this._rotationMatrix );
    }
  }

  /**
   * @param {THREE.Vector3} shiftVector
   * @returns {{shiftPosition: THREE.Vector3, changed: boolean}}
   * @private
   */
  _clampNextPosition (shiftVector) {
    let shiftX = shiftVector.x;
    let shiftY = shiftVector.y;
    let shiftZ = shiftVector.z;

    const bs = WORLD_MAP_BLOCK_SIZE;

    let currentPosition = this.position.clone();
    let desiredPosition = currentPosition.clone().add( shiftVector );

    let objectBlocksRadius = this._objectBlocksRadius;
    let objectRadius = objectBlocksRadius * bs;

    let blockPosition = new THREE.Vector3(
      this._blockCoord(currentPosition.x) + 1,
      this._blockCoord(currentPosition.y),
      this._blockCoord(currentPosition.z) + 1
    );

    let map = game.world.map;

    let changed = false;

    // clamp for X
    if (shiftX) {
      let frontBlocksPositions = [];
      const shiftBlocksX = Math.sign(shiftX) * this._objectBlocksRadius;
      for (let y = 0; y < this._objectBlocksHeight; ++y) {
        let level = [];
        for (let z = -this._objectBlocksRadius; z <= this._objectBlocksRadius; ++z) {
          level.push(
            blockPosition.clone().add({ x: shiftBlocksX, y, z })
          );
        }
        frontBlocksPositions.push( level );
      }

      let frontBlocksValues = frontBlocksPositions.map(level => {
        return level.map( blockPosition => map.getBlock( blockPosition ) );
      });

      let hasValue = false;
      loop: for (let levelIndex = 0; levelIndex < frontBlocksValues.length; ++levelIndex) {
        for (let blockIndex = 0; blockIndex < frontBlocksValues[ levelIndex ].length; ++blockIndex) {
          if (frontBlocksValues[ levelIndex ][ blockIndex ]) {
            hasValue = true;
            break loop;
          }
        }
      }

      if (hasValue || true) {
        let shiftsX = [];

        for (let levelIndex = frontBlocksValues.length - 1; levelIndex >= 0; --levelIndex) {
          let levelBlocksValues = frontBlocksValues[ levelIndex ];
          let levelBlocksPositions = frontBlocksPositions[ levelIndex ];
          let frontBlocksWorldPositions = [];
          let frontBlockPoint = new THREE.Vector3();

          for (let levelBlockIndex = 0; levelBlockIndex < levelBlocksValues.length; ++levelBlockIndex) {
            frontBlocksWorldPositions.push(
              levelBlocksPositions[ levelBlockIndex ].clone()
                .add({ x: shiftX > 0 ? -1 : 0, y: .5, z: 0 })
                .multiplyScalar( bs )
            );
          }

          debugPoints('test' + levelIndex, frontBlocksWorldPositions);

          let nextLivingObjectPoint = desiredPosition.clone().setY(frontBlocksWorldPositions[0].y);

          let line = new THREE.Line3(
            frontBlocksWorldPositions[0], frontBlocksWorldPositions[ frontBlocksWorldPositions.length - 1 ]
          );
          line.closestPointToPoint(nextLivingObjectPoint, false, frontBlockPoint);

          let levelBlockValue = levelBlocksValues[ 1 ];
          if (!levelBlockValue) {
            continue;
          }
          let distanceToPoint = nextLivingObjectPoint.distanceTo( frontBlockPoint );
          if (distanceToPoint > objectRadius) {
            continue;
          }

          let overlap = objectRadius - distanceToPoint;
          shiftsX.push(
            shiftX + Math.sign(-shiftX) * overlap
          );
        }

        if (shiftsX.length) {
          shiftX = shiftX > 0
            ? Math.min( ...shiftsX )
            : Math.max( ...shiftsX );
          changed = true;
        }
      }
    }

    // clamp for Z
    {
      let shiftZVector = new THREE.Vector3(0, 0, Math.sign(shiftZ));
      let nextBlockPosition = blockPosition.clone().add( shiftZVector );

      let frontBlocksPositions = [[
        nextBlockPosition.clone().add({ x: -1, y: 0, z: 0 }),
        nextBlockPosition.clone().add({ x: 0, y: 0, z: 0 }),
        nextBlockPosition.clone().add({ x: 1, y: 0, z: 0 })
      ], [
        nextBlockPosition.clone().add({ x: -1, y: 1, z: 0 }),
        nextBlockPosition.clone().add({ x: 0, y: 1, z: 0 }),
        nextBlockPosition.clone().add({ x: 1, y: 1, z: 0 })
      ], [
        nextBlockPosition.clone().add({ x: -1, y: 2, z: 0 }),
        nextBlockPosition.clone().add({ x: 0, y: 2, z: 0 }),
        nextBlockPosition.clone().add({ x: 1, y: 2, z: 0 })
      ]];

      let frontBlocksValues = frontBlocksPositions.map(frontBlocksLevel => {
        return frontBlocksLevel.map( position => map.getBlock(position) );
      });

      let leftRightValue = false;
      for (let i = 0; i < frontBlocksValues.length; ++i) {
        if (frontBlocksValues[i][0] && frontBlocksValues[i][2]
          || frontBlocksValues[i][1]) {
          leftRightValue = true;
          break;
        }
      }

      if (leftRightValue) {
        let shiftsZ = [];

        for (let levelIndex = frontBlocksValues.length - 1; levelIndex >= 0; --levelIndex) {
          let levelBlocksValues = frontBlocksValues[ levelIndex ];
          let levelBlocksPositions = frontBlocksPositions[ levelIndex ];
          let frontBlocksWorldPositions = [];
          let frontBlockPoint = new THREE.Vector3();

          for (let levelBlockIndex = 0; levelBlockIndex < levelBlocksValues.length; ++levelBlockIndex) {
            let xOffset = (2 - levelBlockIndex) / 2;
            frontBlocksWorldPositions.push(
              levelBlocksPositions[ levelBlockIndex ].clone()
                .add({ x: -1 + xOffset, y: .5, z: shiftZ > 0 ? -1 : 0 })
                .multiplyScalar( bs )
            );
          }

          let nextObjectPoint = desiredPosition.clone().setY(frontBlocksWorldPositions[1].y);

          let line = new THREE.Line3(frontBlocksWorldPositions[0], frontBlocksWorldPositions[2]);
          line.closestPointToPoint(nextObjectPoint, false, frontBlockPoint);

          let levelBlockValue = levelBlocksValues[ 1 ];
          if (!levelBlockValue) {
            continue;
          }

          let distanceToPoint = nextObjectPoint.distanceTo( frontBlockPoint );
          if (distanceToPoint > objectRadius) {
            continue;
          }

          let overlap = objectRadius - distanceToPoint;
          shiftsZ.push(
            shiftZ + Math.sign(-shiftZ) * overlap
          );
        }

        if (shiftsZ.length) {
          shiftZ = shiftZ > 0
            ? Math.min( ...shiftsZ )
            : Math.max( ...shiftsZ );
          changed = true;
        }
      }
    }

    return {
      shiftPosition: shiftVector.setX(shiftX).setZ(shiftZ).setY(shiftY),
      changed
    };
  }

  /**
   * @private
   */
  _updateVerticalPosition ( deltaTime ) {
    let shiftY = -this._gravity.update( deltaTime );
    let falling = shiftY < 0;

    let result = this._clampVerticalPosition( shiftY );
    shiftY = result.shiftY;
    this.position.y += shiftY;

    if (result.changed) {
      this._gravity.resetVelocity();

      if (falling) {
        !this._coming && this._stopVerticalUpdate();
        this._isJumping && (this._isJumping = false);
      }
    }
  }

  /**
   * @param shiftY
   * @returns {{shiftY: number, changed: boolean}}
   * @private
   */
  _clampVerticalPosition (shiftY) {
    const bs = WORLD_MAP_BLOCK_SIZE;

    let currentPosition = this.position.clone();
    let nextObjectPosition = currentPosition.clone().add({ x: 0, y: shiftY, z: 0 });

    let objectBlocksHeight = this._objectBlocksHeight;
    let objectHeight = objectBlocksHeight * bs;

    let blockPosition = new THREE.Vector3(
      this._blockCoord(currentPosition.x) + 1,
      this._blockCoord(currentPosition.y) + (shiftY > 0 ? objectBlocksHeight : 0),
      this._blockCoord(currentPosition.z) + 1
    );

    let map = game.world.map;
    let changed = false;

    // clamp for Y
    {
      let shiftYVector = new THREE.Vector3(0, shiftY > 0 ? 0 : Math.sign(shiftY), 0);
      let nextBlockPosition = blockPosition.clone().add( shiftYVector );

      let frontBlocksPositions = [[
        nextBlockPosition.clone().add({ x: 1, y: 0, z: -1 }),
        nextBlockPosition.clone().add({ x: 1, y: 0, z: 0 }),
        nextBlockPosition.clone().add({ x: 1, y: 0, z: 1 })
      ], [
        nextBlockPosition.clone().add({ x: 0, y: 0, z: -1 }),
        nextBlockPosition.clone().add({ x: 0, y: 0, z: 0 }),
        nextBlockPosition.clone().add({ x: 0, y: 0, z: 1 })
      ], [
        nextBlockPosition.clone().add({ x: -1, y: 0, z: -1 }),
        nextBlockPosition.clone().add({ x: -1, y: 0, z: 0 }),
        nextBlockPosition.clone().add({ x: -1, y: 0, z: 1 })
      ]];

      let frontBlocksValues = frontBlocksPositions.map(frontBlocksLevel => {
        return frontBlocksLevel.map( position => map.hasBlock(position) );
      });

      let hasValue = frontBlocksValues[1][0] && frontBlocksValues[1][2]
        || frontBlocksValues[0][1] && frontBlocksValues[2][1]
        || frontBlocksValues[1][1];

      if (hasValue) {
        let frontBlocksWorldPositions = [];
        let centerPosition = frontBlocksPositions[ 1 ][ 1 ].clone()
          .add({ x: -1, y: 0, z: -1});

        let yOffset = shiftY > 0 ? 0 : 1;

        frontBlocksWorldPositions.push(
          centerPosition.clone()
            .add({ x: 1, y: yOffset, z: 0 })
            .multiplyScalar( bs )
        );
        frontBlocksWorldPositions.push(
          centerPosition.clone()
            .add({ x: 1, y: yOffset, z: 1 })
            .multiplyScalar( bs )
        );
        frontBlocksWorldPositions.push(
          centerPosition.clone()
            .add({ x: 0, y: yOffset, z: 1 })
            .multiplyScalar( bs )
        );
        frontBlocksWorldPositions.push(
          centerPosition.clone()
            .add({ x: 0, y: yOffset, z: 0 })
            .multiplyScalar( bs )
        );

        let blockY = frontBlocksWorldPositions[0].y;

        if (shiftY > 0) {
          changed = nextObjectPosition.y + objectHeight * bs > blockY;
          shiftY = changed
            ? shiftY - (nextObjectPosition.y + objectHeight - blockY)
            : shiftY;
        } else {
          changed = blockY > nextObjectPosition.y;
          shiftY = changed
            ? shiftY + (blockY - nextObjectPosition.y) + .01 // to prevent model collisions with ground
            : shiftY;
        }
      }
    }

    let minMaxY = map.getMinMaxBlockY(
      new THREE.Vector3(
        this._blockCoord(currentPosition.x) + 1,
        this._blockCoord(currentPosition.y),
        this._blockCoord(currentPosition.z) + 1
      )
    );
    minMaxY = (minMaxY + 1) * bs;

    let newObjectY = currentPosition.y + shiftY;
    if (newObjectY < minMaxY) {
      shiftY += minMaxY - newObjectY;
      changed = true;
    }

    return { shiftY, changed };
  }

  /**
   * @private
   */
  _stopVerticalUpdate () {
    this._gravity.stopUpdatingVelocity();
    this._gravity.resetVelocity();
    this._needsVerticalUpdate = false;
  }

  /**
   * @private
   */
  _resumeVerticalUpdate () {
    this._gravity.resumeUpdatingVelocity();
    this._needsVerticalUpdate = true;
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
    let target = this.getComingLocation().setY( 0 );
    let current = this.position.clone().setY( 0 );
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
