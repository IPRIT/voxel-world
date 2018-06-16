import { WorldChunkType } from '../../chunks/world-chunk-type';
import { WORLD_MAP_CHUNK_HEIGHT, WORLD_MAP_CHUNK_SIZE_POWER } from "../../../settings";
import { hasBit } from "../../../utils";

export function computeVertices (context) {
  let {
    chunkBlocks,
    heightMap,
    chunkType,
    chunkSize,
    bs,
    renderNegY = false
  } = context;

  const chunkBlockIndex = (x, y, z) => {
    return x * chunkSize.y * chunkSize.z
      + y * chunkSize.z
      + z;
  };

  const isSameColors = (blockValue1, blockValue2) => {
    return ((blockValue1 >> 8) & 0xFFFFFF) === ((blockValue2 >> 8) & 0xFFFFFF)
      && blockValue1 !== 0
      && blockValue2 !== 0;
  };

  const isMapChunk = chunkType === WorldChunkType.MAP_CHUNK;
  const vertices = [];
  const colors = [];

  let colorsNumber = 0;
  let blocksNumber = 0;
  let [ r, g, b ] = [ 0, 0, 0 ];

  for (let x = 0; x < chunkSize.x; x++) {
    for (let y = 0; y < chunkSize.y; y++) {
      for (let z = 0; z < chunkSize.z; z++) {
        const blockIndex = chunkBlockIndex(x, y, z);
        if (chunkBlocks[ blockIndex ] === 0) {
          continue; // Skip empty blocks
        }
        blocksNumber++;

        // Check if hidden
        let left = 0, right = 0, above = 0, front = 0, back = 0, below = 0;

        if (z > 0) {
          if (chunkBlocks[ chunkBlockIndex(x, y, z - 1) ] !== 0) {
            back = 1;
            chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x10;
          }
        } else {
          if (isMapChunk) {
            // Check hit towards other chunks.
            /*let blockExists = !!worldMap.getBlock(
              chunk.computeWorldPosition({ x, y, z: z - 1 })
            );*/
            let blockExists = false;
            if (blockExists) {
              back = 1;
              chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x10;
            }
          }
        }
        if (x > 0) {
          if (chunkBlocks[ chunkBlockIndex(x - 1, y, z) ] !== 0) {
            left = 1;
            chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x8;
          }
        } else if (isMapChunk) {
          // Check hit towards other chunks.
          /*let blockExists = !!worldMap.getBlock(
            chunk.computeWorldPosition({ x: x - 1, y, z })
          );*/
          let blockExists = false;
          if (blockExists) {
            left = 1;
            chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x8;
          }
        }
        if (x < chunkSize.x - 1) {
          if (chunkBlocks[ chunkBlockIndex(x + 1, y, z) ] !== 0) {
            right = 1;
            chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x4;
          }
        } else if (isMapChunk) {
          /*let blockExists = !!worldMap.getBlock(
            chunk.computeWorldPosition({ x: x + 1, y, z })
          );*/
          let blockExists = false;
          if (blockExists) {
            right = 1;
            chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x4;
          }
        }

        // Only check / draw bottom if we are an object!
        if (!isMapChunk || renderNegY) {
          if (isMapChunk) {
            let minMaxY = getMinMaxBlock( heightMap, x, z );
            if (y - 2 < minMaxY) {
              below = 1;
            } else {
              if (chunkBlocks[ chunkBlockIndex(x, y - 1, z) ] !== 0) {
                below = 1;
                chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x20; // bit 6
              }
            }
          } else if (y > 0) {
            if (chunkBlocks[ chunkBlockIndex(x, y - 1, z) ] !== 0) {
              below = 1;
              chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x20; // bit 6
            }
          }
        }

        if (y < chunkSize.y - 1) {
          if (chunkBlocks[ chunkBlockIndex(x, y + 1, z) ] !== 0) {
            above = 1;
            chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x2;
          }
        } else if (isMapChunk) {
          /*let blockExists = !!worldMap.getBlock(
            chunk.computeWorldPosition({ x, y: y + 1, z })
          );*/
          let blockExists = false;
          // Check hit towards other chunks.
          if (blockExists) {
            above = 1;
            chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x2;
          }
        }
        if (z < chunkSize.z - 1) {
          if (chunkBlocks[ chunkBlockIndex(x, y, z + 1) ] !== 0) {
            front = 1;
            chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x1;
          }
        } else if (isMapChunk) {
          // Check hit towards other chunks.
          /*let blockExists = !!worldMap.getBlock(
            chunk.computeWorldPosition({ x, y, z: z - 1 })
          );*/
          let blockExists = false;
          if (blockExists) {
            front = 1;
            chunkBlocks[ blockIndex ] = chunkBlocks[ blockIndex ] | 0x1;
          }
        }

        if (isMapChunk && !renderNegY) {
          if (front === 1 && left === 1 && right === 1 && above === 1 && back === 1) {
            continue; // block is hidden (map)
          }
        } else {
          if (front === 1 && left === 1 && right === 1 && above === 1 && back === 1 && below === 1) {
            continue; // block is hidden (object)
          }
        }

        // Draw blocks

        // Only draw below if we are an object
        if (!isMapChunk || renderNegY) {
          if (!below) {
            // Get below (bit 6)
            if ((chunkBlocks[ blockIndex ] & 0x20) === 0) {
              let maxX = 0;
              let maxZ = 0;
              let end = 0;

              for (let x_ = x; x_ < chunkSize.x; x_++) {
                // Check not drawn + same color
                if ((chunkBlocks[ chunkBlockIndex(x_, y, z) ] & 0x20) === 0
                  && isSameColors(chunkBlocks[ chunkBlockIndex(x_, y, z) ], chunkBlocks[ blockIndex ])) {
                  maxX++;
                } else {
                  break;
                }
                let tmpZ = 0;
                for (let z_ = z; z_ < chunkSize.z; z_++) {
                  if ((chunkBlocks[ chunkBlockIndex(x_, y, z_) ] & 0x20) === 0
                    && isSameColors(chunkBlocks[ chunkBlockIndex(x_, y, z_) ], chunkBlocks[ blockIndex ])) {
                    tmpZ++;
                  } else {
                    break;
                  }
                }
                if (tmpZ < maxZ || maxZ === 0) {
                  maxZ = tmpZ;
                }
              }
              for (let x_ = x; x_ < x + maxX; x_++) {
                for (let z_ = z; z_ < z + maxZ; z_++) {
                  chunkBlocks[ chunkBlockIndex(x_, y, z_) ] = chunkBlocks[ chunkBlockIndex(x_, y, z_) ] | 0x20;
                }
              }
              maxX--;
              maxZ--;

              vertices.push([x + (maxX), y - 1, z + (maxZ)]);
              vertices.push([x - 1, y - 1, z + (maxZ)]);
              vertices.push([x - 1, y - 1, z - 1]);

              vertices.push([x + (maxX), y - 1, z + (maxZ)]);
              vertices.push([x - 1, y - 1, z - 1]);
              vertices.push([x + (maxX), y - 1, z - 1]);

              r = ((chunkBlocks[ blockIndex ] >> 24) & 0xFF) / 255;
              g = ((chunkBlocks[ blockIndex ] >> 16) & 0xFF) / 255;
              b = ((chunkBlocks[ blockIndex ] >> 8) & 0xFF) / 255;
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
            }
          }
        }

        if (!above) {
          // Get above (0010)
          if ((chunkBlocks[ blockIndex ] & 0x2) === 0) {
            let maxX = 0;
            let maxZ = 0;
            let end = 0;

            for (let x_ = x; x_ < chunkSize.x; x_++) {
              // Check not drawn + same color
              if ((chunkBlocks[ chunkBlockIndex(x_, y, z) ] & 0x2) === 0
                && isSameColors(chunkBlocks[ chunkBlockIndex(x_, y, z) ], chunkBlocks[ blockIndex ])) {
                maxX++;
              } else {
                break;
              }
              let tmpZ = 0;
              for (let z_ = z; z_ < chunkSize.z; z_++) {
                if ((chunkBlocks[ chunkBlockIndex(x_, y, z_) ] & 0x2) === 0
                  && isSameColors(chunkBlocks[ chunkBlockIndex(x_, y, z_) ], chunkBlocks[ blockIndex ])) {
                  tmpZ++;
                } else {
                  break;
                }
              }
              if (tmpZ < maxZ || maxZ === 0) {
                maxZ = tmpZ;
              }
            }
            for (let x_ = x; x_ < x + maxX; x_++) {
              for (let z_ = z; z_ < z + maxZ; z_++) {
                chunkBlocks[ chunkBlockIndex(x_, y, z_) ] = chunkBlocks[ chunkBlockIndex(x_, y, z_) ] | 0x2;
              }
            }
            maxX--;
            maxZ--;

            vertices.push([x + (maxX), y, z + (maxZ)]);
            vertices.push([x - 1, y, z - 1]);
            vertices.push([x - 1, y, z + (maxZ)]);

            vertices.push([x + (maxX), y, z + (maxZ)]);
            vertices.push([x + (maxX), y, z - 1]);
            vertices.push([x - 1, y, z - 1]);

            r = ((chunkBlocks[ blockIndex ] >> 24) & 0xFF) / 255;
            g = ((chunkBlocks[ blockIndex ] >> 16) & 0xFF) / 255;
            b = ((chunkBlocks[ blockIndex ] >> 8) & 0xFF) / 255;
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
          }
        }
        if (!back) {
          // back  10000
          // this.shadow_blocks.push([x, y, z]);
          if ((chunkBlocks[ blockIndex ] & 0x10) === 0) {
            let maxX = 0;
            let maxY = 0;

            for (let x_ = x; x_ < chunkSize.x; x_++) {
              // Check not drawn + same color
              if ((chunkBlocks[ chunkBlockIndex(x_, y, z) ] & 0x10) === 0
                && isSameColors(chunkBlocks[ chunkBlockIndex(x_, y, z) ], chunkBlocks[ blockIndex ])) {
                maxX++;
              } else {
                break;
              }
              let tmpY = 0;
              for (let y_ = y; y_ < chunkSize.y; y_++) {
                if ((chunkBlocks[ chunkBlockIndex(x_, y_, z) ] & 0x10) === 0
                  && isSameColors(chunkBlocks[ chunkBlockIndex(x_, y_, z) ], chunkBlocks[ blockIndex ])) {
                  tmpY++;
                } else {
                  break;
                }
              }
              if (tmpY < maxY || maxY === 0) {
                maxY = tmpY;
              }
            }
            for (let x_ = x; x_ < x + maxX; x_++) {
              for (let y_ = y; y_ < y + maxY; y_++) {
                chunkBlocks[ chunkBlockIndex(x_, y_, z) ] = chunkBlocks[ chunkBlockIndex(x_, y_, z) ] | 0x10;
              }
            }
            maxX--;
            maxY--;
            vertices.push([x + (maxX), y + (maxY), z - 1]);
            vertices.push([x + (maxX), y - 1, z - 1]);
            vertices.push([x - 1, y - 1, z - 1]);

            vertices.push([x + (maxX), y + (maxY), z - 1]);
            vertices.push([x - 1, y - 1, z - 1]);
            vertices.push([x - 1, y + (maxY), z - 1]);

            r = ((chunkBlocks[ blockIndex ] >> 24) & 0xFF) / 255;
            g = ((chunkBlocks[ blockIndex ] >> 16) & 0xFF) / 255;
            b = ((chunkBlocks[ blockIndex ] >> 8) & 0xFF) / 255;
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
          }
        }
        if (!front) {
          // front 0001
          if ((chunkBlocks[ blockIndex ] & 0x1) === 0) {
            let maxX = 0;
            let maxY = 0;

            for (let x_ = x; x_ < chunkSize.x; x_++) {
              // Check not drawn + same color
              if ((chunkBlocks[ chunkBlockIndex(x_, y, z) ] & 0x1) === 0
                && isSameColors(chunkBlocks[ chunkBlockIndex(x_, y, z) ], chunkBlocks[ blockIndex ])) {
                maxX++;
              } else {
                break;
              }
              let tmpY = 0;
              for (let y_ = y; y_ < chunkSize.y; y_++) {
                if ((chunkBlocks[ chunkBlockIndex(x_, y_, z) ] & 0x1) === 0
                  && isSameColors(chunkBlocks[ chunkBlockIndex(x_, y_, z) ], chunkBlocks[ blockIndex ])) {
                  tmpY++;
                } else {
                  break;
                }
              }
              if (tmpY < maxY || maxY === 0) {
                maxY = tmpY;
              }
            }
            for (let x_ = x; x_ < x + maxX; x_++) {
              for (let y_ = y; y_ < y + maxY; y_++) {
                chunkBlocks[ chunkBlockIndex(x_, y_, z) ] = chunkBlocks[ chunkBlockIndex(x_, y_, z) ] | 0x1;
              }
            }
            maxX--;
            maxY--;

            vertices.push([x + (maxX), y + (maxY), z]);
            vertices.push([x - 1, y + (maxY), z]);
            vertices.push([x + (maxX), y - 1, z]);

            vertices.push([x - 1, y + (maxY), z]);
            vertices.push([x - 1, y - 1, z]);
            vertices.push([x + (maxX), y - 1, z]);

            r = ((chunkBlocks[ blockIndex ] >> 24) & 0xFF) / 255;
            g = ((chunkBlocks[ blockIndex ] >> 16) & 0xFF) / 255;
            b = ((chunkBlocks[ blockIndex ] >> 8) & 0xFF) / 255;
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
          }
        }
        if (!left) {
          if ((chunkBlocks[ blockIndex ] & 0x8) === 0) {
            let maxZ = 0;
            let maxY = 0;

            for (let z_ = z; z_ < chunkSize.z; z_++) {
              // Check not drawn + same color
              if ((chunkBlocks[ chunkBlockIndex(x, y, z_) ] & 0x8) === 0
                && isSameColors(chunkBlocks[ chunkBlockIndex(x, y, z_) ], chunkBlocks[ blockIndex ])) {
                maxZ++;
              } else {
                break;
              }
              let tmpY = 0;
              for (let y_ = y; y_ < chunkSize.y; y_++) {
                if ((chunkBlocks[ chunkBlockIndex(x, y_, z_) ] & 0x8) === 0
                  && isSameColors(chunkBlocks[ chunkBlockIndex(x, y_, z_) ], chunkBlocks[ blockIndex ])) {
                  tmpY++;
                } else {
                  break;
                }
              }
              if (tmpY < maxY || maxY === 0) {
                maxY = tmpY;
              }
            }
            for (let z_ = z; z_ < z + maxZ; z_++) {
              for (let y_ = y; y_ < y + maxY; y_++) {
                chunkBlocks[ chunkBlockIndex(x, y_, z_) ] = chunkBlocks[ chunkBlockIndex(x, y_, z_) ] | 0x8;
              }
            }
            maxZ--;
            maxY--;

            vertices.push([x - 1, y - 1, z - 1]);
            vertices.push([x - 1, y - 1, z + (maxZ)]);
            vertices.push([x - 1, y + (maxY), z + (maxZ)]);

            vertices.push([x - 1, y - 1, z - 1]);
            vertices.push([x - 1, y + (maxY), z + (maxZ)]);
            vertices.push([x - 1, y + (maxY), z - 1]);

            r = ((chunkBlocks[ blockIndex ] >> 24) & 0xFF) / 255;
            g = ((chunkBlocks[ blockIndex ] >> 16) & 0xFF) / 255;
            b = ((chunkBlocks[ blockIndex ] >> 8) & 0xFF) / 255;
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
          }
        }
        if (!right) {
          if ((chunkBlocks[ blockIndex ] & 0x4) === 0) {
            let maxZ = 0;
            let maxY = 0;

            for (let z_ = z; z_ < chunkSize.z; z_++) {
              // Check not drawn + same color
              if ((chunkBlocks[ chunkBlockIndex(x, y, z_) ] & 0x4) === 0
                && isSameColors(chunkBlocks[ chunkBlockIndex(x, y, z_) ], chunkBlocks[ blockIndex ])) {
                maxZ++;
              } else {
                break;
              }
              let tmpY = 0;
              for (let y_ = y; y_ < chunkSize.y; y_++) {
                if ((chunkBlocks[ chunkBlockIndex(x, y_, z_) ] & 0x4) === 0
                  && isSameColors(chunkBlocks[ chunkBlockIndex(x, y_, z_) ], chunkBlocks[ blockIndex ])) {
                  tmpY++;
                } else {
                  break;
                }
              }
              if (tmpY < maxY || maxY === 0) {
                maxY = tmpY;
              }
            }
            for (let z_ = z; z_ < z + maxZ; z_++) {
              for (let y_ = y; y_ < y + maxY; y_++) {
                chunkBlocks[ chunkBlockIndex(x, y_, z_) ] = chunkBlocks[ chunkBlockIndex(x, y_, z_) ] | 0x4;
              }
            }
            maxZ--;
            maxY--;

            vertices.push([x, y - 1, z - 1]);
            vertices.push([x, y + (maxY), z + (maxZ)]);
            vertices.push([x, y - 1, z + (maxZ)]);

            vertices.push([x, y + (maxY), z + (maxZ)]);
            vertices.push([x, y - 1, z - 1]);
            vertices.push([x, y + (maxY), z - 1]);

            r = ((chunkBlocks[ blockIndex ] >> 24) & 0xFF) / 255;
            g = ((chunkBlocks[ blockIndex ] >> 16) & 0xFF) / 255;
            b = ((chunkBlocks[ blockIndex ] >> 8) & 0xFF) / 255;
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
            colors[colorsNumber++] = [r,g,b];
          }
        }
      }
    }
  }

  for (let i = 0; i < vertices.length; ++i) {
    vertices[i][0] *= bs;
    vertices[i][1] *= bs;
    vertices[i][2] *= bs;
  }

  return {
    vertices,
    colors
  };
}

/**
 * @param {Uint32Array} map
 * @param {number} x
 * @param {number} z
 * @return {number}
 */
function getColumn (map, x, z) {
  return map[ (x << WORLD_MAP_CHUNK_SIZE_POWER) + z ];
}

/**
 * @param {Uint32Array} map
 * @param {number} x
 * @param {number} z
 * @return {number}
 */
function getMinMaxBlock (map, x, z) {
  let column = getColumn( map, x, z );
  let minMaxY = 0, minY = -1;
  for (let y = 0; y < WORLD_MAP_CHUNK_HEIGHT; ++y) {
    if (hasBit( column, y )) {
      minMaxY = y;
      if (minY === -1) {
        minY = y;
      }
    } else if (minY >= 0) {
      break;
    }
  }
  return minMaxY;
}
