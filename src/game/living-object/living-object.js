import { WorldObjectAnimated } from "../world/world-object/animated";
import { warp } from "../utils";
import { WORLD_MAP_BLOCK_SIZE } from "../settings";
import { ObjectGravity } from "../physic";

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

    this._gravity.update( deltaTime );
    this._updateVerticalPosition();

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
    return comingLocation && comingLocation.setY( 0 )
      .distanceTo(
        this.position.clone().setY( 0 )
      ) || 0;
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

    let playerRadius = bs * .9;

    let blockPosition = new THREE.Vector3(
      this._blockCoord(currentPosition.x) + 1,
      this._blockCoord(currentPosition.y),
      this._blockCoord(currentPosition.z) + 1
    );

    let map = game.world.map;

    let changed = false;

    // clamp for X
    {
      let shiftXVector = new THREE.Vector3(Math.sign(shiftX), 0, 0);
      let nextBlockPosition = blockPosition.clone().add( shiftXVector );

      let frontBlocksPositions = [[
        nextBlockPosition.clone().add({ x: 0, y: 0, z: -1 }),
        nextBlockPosition.clone().add({ x: 0, y: 0, z: 0 }),
        nextBlockPosition.clone().add({ x: 0, y: 0, z: 1 })
      ], [
        nextBlockPosition.clone().add({ x: 0, y: 1, z: -1 }),
        nextBlockPosition.clone().add({ x: 0, y: 1, z: 0 }),
        nextBlockPosition.clone().add({ x: 0, y: 1, z: 1 })
      ], [
        nextBlockPosition.clone().add({ x: 0, y: 2, z: -1 }),
        nextBlockPosition.clone().add({ x: 0, y: 2, z: 0 }),
        nextBlockPosition.clone().add({ x: 0, y: 2, z: 1 })
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
        let shiftsX = [];

        for (let levelIndex = frontBlocksValues.length - 1; levelIndex >= 0; --levelIndex) {
          let levelBlocksValues = frontBlocksValues[ levelIndex ];
          let levelBlocksPositions = frontBlocksPositions[ levelIndex ];
          let frontBlocksWorldPositions = [];
          let frontBlockPoint = new THREE.Vector3();

          for (let levelBlockIndex = 0; levelBlockIndex < levelBlocksValues.length; ++levelBlockIndex) {
            let zOffset = (2 - levelBlockIndex) / 2;
            frontBlocksWorldPositions.push(
              levelBlocksPositions[ levelBlockIndex ].clone()
                .add({ x: shiftX > 0 ? -1 : 0, y: .5, z: -1 + zOffset })
                .multiplyScalar( bs )
            );
          }

          let nextPlayerPoint = desiredPosition.clone().setY(frontBlocksWorldPositions[1].y);

          let line = new THREE.Line3(frontBlocksWorldPositions[0], frontBlocksWorldPositions[2]);
          line.closestPointToPoint(nextPlayerPoint, false, frontBlockPoint);

          let levelBlockValue = levelBlocksValues[ 1 ];
          if (!levelBlockValue) {
            continue;
          }
          let distanceToPoint = nextPlayerPoint.distanceTo( frontBlockPoint );
          if (distanceToPoint > playerRadius) {
            continue;
          }

          let overlap = playerRadius - distanceToPoint;
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

          let nextPlayerPoint = desiredPosition.clone().setY(frontBlocksWorldPositions[1].y);

          let line = new THREE.Line3(frontBlocksWorldPositions[0], frontBlocksWorldPositions[2]);
          line.closestPointToPoint(nextPlayerPoint, false, frontBlockPoint);

          let levelBlockValue = levelBlocksValues[ 1 ];
          if (!levelBlockValue) {
            continue;
          }

          let distanceToPoint = nextPlayerPoint.distanceTo( frontBlockPoint );
          if (distanceToPoint > playerRadius) {
            continue;
          }

          let overlap = playerRadius - distanceToPoint;
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
  _updateVerticalPosition () {
    let shiftY = -this._gravity.velocity;

    this.position.y += this._clampVerticalPosition( shiftY );
  }

  /**
   * @param {number} shiftY
   * @returns {number}
   * @private
   */
  _clampVerticalPosition (shiftY) {
    const bs = WORLD_MAP_BLOCK_SIZE;

    let currentPosition = this.position.clone();
    let nextPlayerPosition = currentPosition.clone().add({ x: 0, y: shiftY, z: 0 });

    let playerBlocksHeight = 3;

    let blockPosition = new THREE.Vector3(
      this._blockCoord(currentPosition.x) + 1,
      this._blockCoord(currentPosition.y) + (shiftY > 0 ? playerBlocksHeight : 0),
      this._blockCoord(currentPosition.z) + 1
    );

    let map = game.world.map;
    let changed = false;

    // clamp for Y
    {
      let shiftYVector = new THREE.Vector3(0, Math.sign(shiftY), 0);
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
        return frontBlocksLevel.map( position => map.getBlock(position) );
      });

      let hasValue = false;
      for (let i = 0; i < frontBlocksValues.length; ++i) {
        for (let j = 0; j < frontBlocksValues[i].length; ++j) {
          if (frontBlocksValues[i][j]) {
            hasValue = true;
            break;
          }
        }
      }

      if (hasValue) {
        let frontBlocksWorldPositions = [];
        let centerPosition = frontBlocksPositions[ 1 ][ 1 ].clone()
          .add({ x: -1, y: 0, z: -1});

        frontBlocksWorldPositions.push(
          centerPosition.clone()
            .add({ x: 1, y: shiftY > 0 ? 0 : 1, z: 0 })
            .multiplyScalar( bs )
        );
        frontBlocksWorldPositions.push(
          centerPosition.clone()
            .add({ x: 1, y: shiftY > 0 ? 0 : 1, z: 1 })
            .multiplyScalar( bs )
        );
        frontBlocksWorldPositions.push(
          centerPosition.clone()
            .add({ x: 0, y: shiftY > 0 ? 0 : 1, z: 1 })
            .multiplyScalar( bs )
        );
        frontBlocksWorldPositions.push(
          centerPosition.clone()
            .add({ x: 0, y: shiftY > 0 ? 0 : 1, z: 0 })
            .multiplyScalar( bs )
        );

        let blockY = frontBlocksWorldPositions[0].y;

        if (shiftY > 0) {
          changed = nextPlayerPosition.y > blockY;
          shiftY = changed
            ? shiftY - (nextPlayerPosition.y - blockY)
            : shiftY;
        } else {
          changed = blockY > nextPlayerPosition.y;
          shiftY = changed
            ? shiftY + (blockY - nextPlayerPosition.y) + .01 // to prevent model collisions with ground
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

    let newPlayerY = currentPosition.y + shiftY;
    if (newPlayerY < minMaxY) {
      shiftY += minMaxY - newPlayerY;
    }

    if (changed) {
      this._gravity.resetVelocity();
    }

    return shiftY;
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
