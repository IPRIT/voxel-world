import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_BLOCK_SIZE_POWER } from "../../settings";

export class WorldMapCollisions {

  /**
   * @type {WorldMap}
   * @private
   */
  _map = null;

  /**
   * @param {WorldMap} map
   */
  constructor (map) {
    this._map = map;
  }

  /**
   * @param {THREE.Vector3} position
   * @param {THREE.Vector3} shiftVector
   * @param {*} options
   * @returns {{shiftPosition: *, changed: boolean}}
   */
  clampNextPosition (position, shiftVector, options = {}) {
    let { objectBlocksRadius, objectBlocksHeight } = options;

    let shiftX = shiftVector.x;
    let shiftY = 0;
    let shiftZ = shiftVector.z;

    const bs = WORLD_MAP_BLOCK_SIZE;
    const objectRadius = objectBlocksRadius * bs;

    let desiredPosition = position.clone().add( shiftVector );

    let currentBlockPosition = new THREE.Vector3(
      this._blockCoord(position.x) + 1,
      this._blockCoord(position.y),
      this._blockCoord(position.z) + 1
    );
    let nextBlockPosition = new THREE.Vector3(
      this._blockCoord(desiredPosition.x) + 1,
      this._blockCoord(desiredPosition.y),
      this._blockCoord(desiredPosition.z) + 1
    );

    let map = this._map;

    let changed = false;
    let onlyFirstLevelX = true;
    let onlyFirstLevelZ = true;

    // clamp for X
    if (shiftX) {
      const sign = Math.sign( shiftX );
      const signedObjectBlocksRadius = sign * objectBlocksRadius;
      const currentBorderBlockPosition = currentBlockPosition.clone()
        .add({ x: signedObjectBlocksRadius + sign, y: 0, z: 0 });
      const nextBorderBlockPosition = nextBlockPosition.clone()
        .add({ x: signedObjectBlocksRadius + sign, y: 0, z: 0 });

      let blocksPositions = [];
      let blocksValues = [];
      let found = false;

      for (let blockX = currentBorderBlockPosition.x - sign * 2; blockX !== nextBorderBlockPosition.x; blockX += sign) {
        blocksPositions = [];
        blocksValues = [];

        for (let y = 0; y < objectBlocksHeight; ++y) {
          let level = [];
          for (let z = -objectBlocksRadius; z <= objectBlocksRadius; ++z) {
            level.push(
              currentBorderBlockPosition.clone().add({ x: 0, y, z }).setX( blockX )
            );
          }
          blocksPositions.push( level );
        }

        blocksValues = blocksPositions.map(level => {
          return level.map( blockPosition => map.getBlock( blockPosition ) );
        });

        let firstHalfHasValue = false,
          secondHalfHasValue = false,
          middleHasValue = false;
        for (let levelIndex = 0; levelIndex < blocksValues.length; ++levelIndex) {
          for (let blockIndex = 0, length = blocksValues[ levelIndex ].length; blockIndex < length; ++blockIndex) {
            let middleIndex = length >> 1;
            if (blockIndex < middleIndex && blocksValues[ levelIndex ][ blockIndex ]) {
              // first half
              firstHalfHasValue = true;
            } else if (blockIndex > middleIndex && blocksValues[ levelIndex ][ blockIndex ]) {
              // second half
              secondHalfHasValue = true;
            } else if (blocksValues[ levelIndex ][ blockIndex ]) {
              // middle
              middleHasValue = true;
            }
            if (levelIndex > 0 && blocksValues[ levelIndex ][ blockIndex ]) {
              onlyFirstLevelX = false;
            }
          }
        }

        if (firstHalfHasValue && secondHalfHasValue || middleHasValue) {
          found = true;
          break;
        }
      }

      if (found) {
        let shiftsX = [];

        for (let levelIndex = blocksValues.length - 1; levelIndex >= 0; --levelIndex) {
          let levelBlocksValues = blocksValues[ levelIndex ];
          let levelBlocksPositions = blocksPositions[ levelIndex ];
          let blocksWorldPositions = [];

          for (let levelBlockIndex = 0; levelBlockIndex < levelBlocksValues.length; ++levelBlockIndex) {
            blocksWorldPositions.push(
              levelBlocksPositions[ levelBlockIndex ].clone()
                .add({ x: shiftX > 0 ? -1 : 0, y: .5, z: 0 })
                .multiplyScalar( bs )
            );
          }

          let nextLivingObjectPoint = desiredPosition.clone().setY(blocksWorldPositions[0].y);
          let constraintX = blocksWorldPositions[0].x;

          let shouldPass = shiftX > 0
            ? nextLivingObjectPoint.x + objectRadius <= constraintX
            : nextLivingObjectPoint.x - objectRadius >= constraintX;

          if (shouldPass) {
            continue;
          }

          let overlap = shiftX > 0
            ? (nextLivingObjectPoint.x + objectRadius - .05) - constraintX
            : constraintX - (nextLivingObjectPoint.x - objectRadius + .05);
          shiftsX.push(
            shiftX + -sign * overlap
          );
        }

        if (shiftsX.length) {
          if (!onlyFirstLevelX) {
            shiftX = shiftX > 0
              ? Math.min( ...shiftsX )
              : Math.max( ...shiftsX );
          }
          changed = true;
        }
      }
    }

    // clamp for Z
    if (shiftZ) {
      const sign = Math.sign( shiftZ );
      const signedObjectBlocksRadius = sign * objectBlocksRadius;
      const currentBorderBlockPosition = currentBlockPosition.clone()
        .add({ x: 0, y: 0, z: signedObjectBlocksRadius + sign });
      const nextBorderBlockPosition = nextBlockPosition.clone()
        .add({ x: 0, y: 0, z: signedObjectBlocksRadius + sign });

      let blocksPositions = [];
      let blocksValues = [];
      let found = false;

      for (let blockZ = currentBorderBlockPosition.z - sign; blockZ !== nextBorderBlockPosition.z + sign; blockZ += sign) {
        blocksPositions = [];
        blocksValues = [];

        for (let y = 0; y < objectBlocksHeight; ++y) {
          let level = [];
          for (let x = -objectBlocksRadius; x <= objectBlocksRadius; ++x) {
            level.push(
              currentBorderBlockPosition.clone().add({ x, y, z: 0 }).setZ( blockZ )
            );
          }
          blocksPositions.push( level );
        }

        blocksValues = blocksPositions.map(level => {
          return level.map( blockPosition => map.getBlock( blockPosition ) );
        });

        let firstHalfHasValue = false,
          secondHalfHasValue = false,
          middleHasValue = false;
        for (let levelIndex = 0; levelIndex < blocksValues.length; ++levelIndex) {
          for (let blockIndex = 0, length = blocksValues[ levelIndex ].length; blockIndex < length; ++blockIndex) {
            let middleIndex = length >> 1;
            if (blockIndex < middleIndex && blocksValues[ levelIndex ][ blockIndex ]) {
              // first half
              firstHalfHasValue = true;
            } else if (blockIndex > middleIndex && blocksValues[ levelIndex ][ blockIndex ]) {
              // second half
              secondHalfHasValue = true;
            } else if (blocksValues[ levelIndex ][ blockIndex ]) {
              // middle
              middleHasValue = true;
            }
            if (levelIndex > 0 && blocksValues[ levelIndex ][ blockIndex ]) {
              onlyFirstLevelZ = false;
            }
          }
        }

        if (firstHalfHasValue && secondHalfHasValue || middleHasValue) {
          found = true;
          break;
        }
      }

      if (found) {
        let shiftsZ = [];

        for (let levelIndex = blocksValues.length - 1; levelIndex >= 0; --levelIndex) {
          let levelBlocksValues = blocksValues[ levelIndex ];
          let levelBlocksPositions = blocksPositions[ levelIndex ];
          let blocksWorldPositions = [];

          for (let levelBlockIndex = 0; levelBlockIndex < levelBlocksValues.length; ++levelBlockIndex) {
            blocksWorldPositions.push(
              levelBlocksPositions[ levelBlockIndex ].clone()
                .add({ x: 0, y: .5, z: shiftZ > 0 ? -1 : 0 })
                .multiplyScalar( bs )
            );
          }

          let nextLivingObjectPoint = desiredPosition.clone().setY(blocksWorldPositions[0].y);
          let constraintZ = blocksWorldPositions[0].z;

          let shouldPass = shiftZ > 0
            ? nextLivingObjectPoint.z + objectRadius <= constraintZ
            : nextLivingObjectPoint.z - objectRadius >= constraintZ;

          if (shouldPass) {
            continue;
          }

          let overlap = shiftZ > 0
            ? (nextLivingObjectPoint.z + objectRadius - .05) - constraintZ
            : constraintZ - (nextLivingObjectPoint.z - objectRadius + .05);
          shiftsZ.push(
            shiftZ + -sign * overlap
          );
        }

        if (shiftsZ.length) {
          if (!onlyFirstLevelZ) {
            shiftZ = shiftZ > 0
              ? Math.min( ...shiftsZ )
              : Math.max( ...shiftsZ );
          }
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
   * @param {THREE.Vector3} currentPosition
   * @param {number} shiftY
   * @param {*} options
   * @returns {{shiftY: *, changed: boolean}}
   */
  clampVerticalPosition (currentPosition, shiftY, options = {}) {
    let { objectBlocksHeight, objectBlocksRadius } = options;
    const bs = WORLD_MAP_BLOCK_SIZE;
    const objectHeight = objectBlocksHeight * bs;

    let nextLivingObjectPoint = currentPosition.clone().add({ x: 0, y: shiftY, z: 0 });

    let currentBlockPosition = new THREE.Vector3(
      this._blockCoord(currentPosition.x) + 1,
      this._blockCoord(currentPosition.y) + (shiftY > 0 ? objectBlocksHeight : 0),
      this._blockCoord(currentPosition.z) + 1
    );
    let nextBlockPosition = new THREE.Vector3(
      this._blockCoord(nextLivingObjectPoint.x) + 1,
      this._blockCoord(nextLivingObjectPoint.y) + (shiftY > 0 ? objectBlocksHeight : 0),
      this._blockCoord(nextLivingObjectPoint.z) + 1
    );

    let map = this._map;
    let changed = false;

    // clamp for Y
    {
      const sign = Math.sign( shiftY );

      let blocksPositions = [];
      let blocksValues = [];
      let found = false;

      for (let blockY = currentBlockPosition.y - sign; blockY !== nextBlockPosition.y + sign; blockY += sign) {
        blocksPositions = [];
        blocksValues = [];

        for (let x = -objectBlocksRadius; x <= objectBlocksRadius; ++x) {
          let level = [];
          for (let z = -objectBlocksRadius; z <= objectBlocksRadius; ++z) {
            level.push(
              currentBlockPosition.clone().add({ x, y: 0, z }).setY( blockY )
            );
          }
          blocksPositions.push( level );
        }

        blocksValues = blocksPositions.map(level => {
          return level.map( blockPosition => map.getBlock( blockPosition ) );
        });

        let topLeftHasValue = false,
          topRightHasValue = false,
          bottomLeftHasValue = false,
          bottomRightHasValue = false,
          middleHasValue = false;
        loop: for (let levelIndex = 0; levelIndex < blocksValues.length; ++levelIndex) {
          for (let blockIndex = 0, length = blocksValues[ levelIndex ].length; blockIndex < length; ++blockIndex) {
            let middleIndex = length >> 1;
            if (levelIndex === middleIndex && blockIndex === middleIndex) {
              if (blocksValues[ levelIndex ][ blockIndex ]) {
                middleHasValue = true;
                break loop;
              }
            }
            if (levelIndex <= middleIndex
              && blockIndex <= middleIndex
              && blocksValues[ levelIndex ][ blockIndex ]) {
              topLeftHasValue = true;
            }
            if (levelIndex <= middleIndex
              && blockIndex >= middleIndex
              && blocksValues[ levelIndex ][ blockIndex ]) {
              topRightHasValue = true;
            }
            if (levelIndex >= middleIndex
              && blockIndex <= middleIndex
              && blocksValues[ levelIndex ][ blockIndex ]) {
              bottomLeftHasValue = true;
            }
            if (levelIndex >= middleIndex
              && blockIndex >= middleIndex
              && blocksValues[ levelIndex ][ blockIndex ]) {
              bottomRightHasValue = true;
            }
          }
        }

        if (middleHasValue
          || topLeftHasValue && bottomRightHasValue
          || topRightHasValue && bottomLeftHasValue) {
          found = true;
          break;
        }
      }

      if (found) {
        let yOffset = shiftY > 0 ? 0 : 1;

        let blockWorldPosition = blocksPositions[ blocksPositions.length >> 1 ][ blocksPositions.length >> 1 ].clone()
          .add({ x: 0, y: yOffset, z: 0 })
          .multiplyScalar( bs );

        let constraintY = Math.max(blockWorldPosition.y, bs);

        let overlap = shiftY > 0
          ? (nextLivingObjectPoint.y + objectHeight) - constraintY
          : constraintY - nextLivingObjectPoint.y;

        if (overlap > 0) {
          if (shiftY > 0) {
            shiftY -= overlap;
          } else {
            shiftY += overlap + .01;
          }
          changed = true;
        }
      }
    }

    let minY = bs;

    let newObjectY = currentPosition.y + shiftY;
    if (newObjectY < minY) {
      shiftY += minY - newObjectY;
      changed = true;
    }

    return { shiftY, changed };
  }

  /**
   * @param {number} value
   * @returns {number}
   * @private
   */
  _blockCoord (value) {
    return value >> WORLD_MAP_BLOCK_SIZE_POWER;
  }
}
