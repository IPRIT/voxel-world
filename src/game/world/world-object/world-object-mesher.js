import { WorldChunkType } from "../chunks";
import { WORLD_MAP_BLOCK_SIZE } from "../world-map";

export class WorldObjectMesher {

  /**
   * @type {WorldObject}
   * @private
   */
  _worldObject = null;

  /**
   * @param {WorldObject} worldObject
   */
  constructor (worldObject) {
    this._worldObject = worldObject;
  }

  /**
   * @param {number[][]} vertices
   * @param {number[][]} colors
   * @returns {THREE.BufferGeometry}
   */
  createOrUpdateGeometry (vertices, colors) {
    const worldObject = this._worldObject;
    const chunk = this._worldObject.chunk;

    const bs = WORLD_MAP_BLOCK_SIZE;

    chunk.triangles = vertices.length / 3;

    if (!worldObject.mesh) {
      let startingBlocks = 0;

      for (let i = 0; i < chunk.blocks.length; i++) {
        if (chunk.blocks[ i ] !== 0) {
          startingBlocks++;
          chunk.blocks[ i ] &= 0xFFFFFFE0; // why 0xFFFFFFE0? why not 0xFFFFFFC0?
        }
      }

      chunk.startingBlocks = startingBlocks;
      chunk.currentBlocks = startingBlocks;
    }

    let verticesAttribute, colorsAttribute, geometry;

    if (worldObject.mesh && chunk.previousVerticesLength === vertices.length) {
      verticesAttribute = worldObject.vertices;
      colorsAttribute = worldObject.colors;
      geometry = worldObject.geometry;

      for (let i = 0; i < vertices.length; i++) {
        verticesAttribute.setXYZ(i, vertices[i][0] * bs, vertices[i][1] * bs, vertices[i][2] * bs);
        colorsAttribute.setXYZW(i, colors[i][0], colors[i][1], colors[i][2], 1);
      }
      geometry.setDrawRange(0, vertices.length);
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.computeVertexNormals();
    } else {
      verticesAttribute = new THREE.BufferAttribute(new Float32Array(vertices.length * 3), 3);
      colorsAttribute = new THREE.BufferAttribute(new Float32Array(colors.length * 3), 3);

      for (let i = 0; i < vertices.length; i++) {
        verticesAttribute.setXYZ(i, vertices[i][0] * bs, vertices[i][1] * bs, vertices[i][2] * bs);
        colorsAttribute.setXYZW(i, colors[i][0], colors[i][1], colors[i][2], 1);
      }
      geometry = new THREE.BufferGeometry();
      geometry.dynamic = true;
      geometry.addAttribute('position', verticesAttribute);
      geometry.addAttribute('color', colorsAttribute);
      geometry.attributes.position.dynamic = true;
      geometry.attributes.color.dynamic = true;
      geometry.computeBoundingBox();
      geometry.computeVertexNormals();
    }

    worldObject.geometry = geometry;
    worldObject.vertices = verticesAttribute;
    worldObject.colors = colorsAttribute;

    chunk.previousVerticesLength = vertices.length;
    chunk.needsUpdate = false;

    return geometry;
  }

  /**
   * @returns {THREE.Mesh}
   */
  createOrUpdateMesh () {
    const worldObject = this._worldObject;

    this.resetFaces();
    const { vertices, colors } = this.computeVertices();
    const geometry = this.createOrUpdateGeometry(vertices, colors);

    let mesh = worldObject.mesh;
    if (!mesh) {
      mesh = new THREE.Mesh(geometry, worldObject.material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    } else {
      mesh.geometry = geometry;
    }

    return (this._worldObject.mesh = mesh);
  }

  /**
   * Resets faces of block
   */
  resetFaces () {
    const chunk = this._worldObject.chunk;
    if (!chunk.inited) {
      throw new Error('Chunk hasn\'t initialized');
    }
    // resetting last 6 bits of block (faces bits)
    for (let i = 0; i < chunk.blocks.length; ++i) {
      chunk.blocks[ i ] &= 0xFFFFFFC0; // 11111111111111111111111111000000
    }
  }

  /**
   * @returns {{vertices: number[][], colors: number[][]}}
   * @private
   */
  computeVertices () {
    let worldObject = this._worldObject;
    let chunk = worldObject.chunk;

    const isMapChunk = chunk.type === WorldChunkType.MAP_CHUNK;
    const vertices = [];
    const colors = [];

    let colorsNumber = 0;
    let blocksNumber = 0;
    let [ r, g, b ] = [ 0, 0, 0 ];

    for (let x = 0; x < chunk.size.x; x++) {
      for (let y = 0; y < chunk.size.y; y++) {
        for (let z = 0; z < chunk.size.z; z++) {
          const blockIndex = chunk.blockIndex(x, y, z);
          if (chunk.blocks[ blockIndex ] === 0) {
            continue; // Skip empty blocks
          }
          blocksNumber++;

          // Check if hidden
          let {
            front, above, right,
            left, back, below
          } = this._isBlockHidden({ x, y, z });

          if (isMapChunk) {
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
          if (!isMapChunk) {
            if (!below) {
              // Get below (bit 6)
              if ((chunk.blocks[ blockIndex ] & 0x20) === 0) {
                let maxX = 0;
                let maxZ = 0;
                let end = 0;

                for (let x_ = x; x_ < chunk.size.x; x_++) {
                  // Check not drawn + same color
                  if ((chunk.blocks[ chunk.blockIndex(x_, y, z) ] & 0x20) === 0
                    && this._isSameColors(chunk.blocks[ chunk.blockIndex(x_, y, z) ], chunk.blocks[ blockIndex ])) {
                    maxX++;
                  } else {
                    break;
                  }
                  let tmpZ = 0;
                  for (let z_ = z; z_ < chunk.size.z; z_++) {
                    if ((chunk.blocks[ chunk.blockIndex(x_, y, z_) ] & 0x20) === 0
                      && this._isSameColors(chunk.blocks[ chunk.blockIndex(x_, y, z_) ], chunk.blocks[ blockIndex ])) {
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
                    chunk.blocks[ chunk.blockIndex(x_, y, z_) ] = chunk.blocks[ chunk.blockIndex(x_, y, z_) ] | 0x20;
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

                r = ((chunk.blocks[ blockIndex ] >> 24) & 0xFF) / 255;
                g = ((chunk.blocks[ blockIndex ] >> 16) & 0xFF) / 255;
                b = ((chunk.blocks[ blockIndex ] >> 8) & 0xFF) / 255;
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
            if ((chunk.blocks[ blockIndex ] & 0x2) === 0) {
              let maxX = 0;
              let maxZ = 0;
              let end = 0;

              for (let x_ = x; x_ < chunk.size.x; x_++) {
                // Check not drawn + same color
                if ((chunk.blocks[ chunk.blockIndex(x_, y, z) ] & 0x2) === 0
                  && this._isSameColors(chunk.blocks[ chunk.blockIndex(x_, y, z) ], chunk.blocks[ blockIndex ])) {
                  maxX++;
                } else {
                  break;
                }
                let tmpZ = 0;
                for (let z_ = z; z_ < chunk.size.z; z_++) {
                  if ((chunk.blocks[ chunk.blockIndex(x_, y, z_) ] & 0x2) === 0
                    && this._isSameColors(chunk.blocks[ chunk.blockIndex(x_, y, z_) ], chunk.blocks[ blockIndex ])) {
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
                  chunk.blocks[ chunk.blockIndex(x_, y, z_) ] = chunk.blocks[ chunk.blockIndex(x_, y, z_) ] | 0x2;
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

              r = ((chunk.blocks[ blockIndex ] >> 24) & 0xFF) / 255;
              g = ((chunk.blocks[ blockIndex ] >> 16) & 0xFF) / 255;
              b = ((chunk.blocks[ blockIndex ] >> 8) & 0xFF) / 255;
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
            if ((chunk.blocks[ blockIndex ] & 0x10) === 0) {
              let maxX = 0;
              let maxY = 0;

              for (let x_ = x; x_ < chunk.size.x; x_++) {
                // Check not drawn + same color
                if ((chunk.blocks[ chunk.blockIndex(x_, y, z) ] & 0x10) === 0
                  && this._isSameColors(chunk.blocks[ chunk.blockIndex(x_, y, z) ], chunk.blocks[ blockIndex ])) {
                  maxX++;
                } else {
                  break;
                }
                let tmpY = 0;
                for (let y_ = y; y_ < chunk.size.y; y_++) {
                  if ((chunk.blocks[ chunk.blockIndex(x_, y_, z) ] & 0x10) === 0
                    && this._isSameColors(chunk.blocks[ chunk.blockIndex(x_, y_, z) ], chunk.blocks[ blockIndex ])) {
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
                  chunk.blocks[ chunk.blockIndex(x_, y_, z) ] = chunk.blocks[ chunk.blockIndex(x_, y_, z) ] | 0x10;
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

              r = ((chunk.blocks[ blockIndex ] >> 24) & 0xFF) / 255;
              g = ((chunk.blocks[ blockIndex ] >> 16) & 0xFF) / 255;
              b = ((chunk.blocks[ blockIndex ] >> 8) & 0xFF) / 255;
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
            if ((chunk.blocks[ blockIndex ] & 0x1) === 0) {
              let maxX = 0;
              let maxY = 0;

              for (let x_ = x; x_ < chunk.size.x; x_++) {
                // Check not drawn + same color
                if ((chunk.blocks[ chunk.blockIndex(x_, y, z) ] & 0x1) === 0
                  && this._isSameColors(chunk.blocks[ chunk.blockIndex(x_, y, z) ], chunk.blocks[ blockIndex ])) {
                  maxX++;
                } else {
                  break;
                }
                let tmpY = 0;
                for (let y_ = y; y_ < chunk.size.y; y_++) {
                  if ((chunk.blocks[ chunk.blockIndex(x_, y_, z) ] & 0x1) === 0
                    && this._isSameColors(chunk.blocks[ chunk.blockIndex(x_, y_, z) ], chunk.blocks[ blockIndex ])) {
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
                  chunk.blocks[ chunk.blockIndex(x_, y_, z) ] = chunk.blocks[ chunk.blockIndex(x_, y_, z) ] | 0x1;
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

              r = ((chunk.blocks[ blockIndex ] >> 24) & 0xFF) / 255;
              g = ((chunk.blocks[ blockIndex ] >> 16) & 0xFF) / 255;
              b = ((chunk.blocks[ blockIndex ] >> 8) & 0xFF) / 255;
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
            }
          }
          if (!left) {
            if ((chunk.blocks[ blockIndex ] & 0x8) === 0) {
              let maxZ = 0;
              let maxY = 0;

              for (let z_ = z; z_ < chunk.size.z; z_++) {
                // Check not drawn + same color
                if ((chunk.blocks[ chunk.blockIndex(x, y, z_) ] & 0x8) === 0
                  && this._isSameColors(chunk.blocks[ chunk.blockIndex(x, y, z_) ], chunk.blocks[ blockIndex ])) {
                  maxZ++;
                } else {
                  break;
                }
                let tmpY = 0;
                for (let y_ = y; y_ < chunk.size.y; y_++) {
                  if ((chunk.blocks[ chunk.blockIndex(x, y_, z_) ] & 0x8) === 0
                    && this._isSameColors(chunk.blocks[ chunk.blockIndex(x, y_, z_) ], chunk.blocks[ blockIndex ])) {
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
                  chunk.blocks[ chunk.blockIndex(x, y_, z_) ] = chunk.blocks[ chunk.blockIndex(x, y_, z_) ] | 0x8;
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

              r = ((chunk.blocks[ blockIndex ] >> 24) & 0xFF) / 255;
              g = ((chunk.blocks[ blockIndex ] >> 16) & 0xFF) / 255;
              b = ((chunk.blocks[ blockIndex ] >> 8) & 0xFF) / 255;
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
              colors[colorsNumber++] = [r,g,b];
            }
          }
          if (!right) {
            if ((chunk.blocks[ blockIndex ] & 0x4) === 0) {
              let maxZ = 0;
              let maxY = 0;

              for (let z_ = z; z_ < chunk.size.z; z_++) {
                // Check not drawn + same color
                if ((chunk.blocks[ chunk.blockIndex(x, y, z_) ] & 0x4) === 0
                  && this._isSameColors(chunk.blocks[ chunk.blockIndex(x, y, z_) ], chunk.blocks[ blockIndex ])) {
                  maxZ++;
                } else {
                  break;
                }
                let tmpY = 0;
                for (let y_ = y; y_ < chunk.size.y; y_++) {
                  if ((chunk.blocks[ chunk.blockIndex(x, y_, z_) ] & 0x4) === 0
                    && this._isSameColors(chunk.blocks[ chunk.blockIndex(x, y_, z_) ], chunk.blocks[ blockIndex ])) {
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
                  chunk.blocks[ chunk.blockIndex(x, y_, z_) ] = chunk.blocks[ chunk.blockIndex(x, y_, z_) ] | 0x4;
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

              r = ((chunk.blocks[ blockIndex ] >> 24) & 0xFF) / 255;
              g = ((chunk.blocks[ blockIndex ] >> 16) & 0xFF) / 255;
              b = ((chunk.blocks[ blockIndex ] >> 8) & 0xFF) / 255;
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

    return {
      vertices,
      colors
    };
  }

  /**
   * @param {number} blockValue1
   * @param {number} blockValue2
   * @returns {boolean}
   * @private
   */
  _isSameColors (blockValue1, blockValue2) {
    return ((blockValue1 >> 8) & 0xFFFFFF) === ((blockValue2 >> 8) & 0xFFFFFF)
      && blockValue1 !== 0
      && blockValue2 !== 0;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @private
   */
  _isBlockHidden ({ x, y, z }) {
    const chunk = this._worldObject.chunk;
    const isMapChunk = chunk.type === WorldChunkType.MAP_CHUNK;
    const blockIndex = chunk.blockIndex(x, y, z);
    const worldMap = game.world.map;

    let left = 0, right = 0, above = 0, front = 0, back = 0, below = 0;

    if (z > 0) {
      if (chunk.blocks[ chunk.blockIndex(x, y, z - 1) ] !== 0) {
        back = 1;
        chunk.blocks[ blockIndex ] = chunk.blocks[ blockIndex ] | 0x10;
      }
    } else {
      if (isMapChunk) {
        // Check hit towards other chunks.
        let blockExists = !!worldMap.getBlock(
          chunk.computeWorldPosition({ x, y, z: z - 1 })
        );
        if (blockExists) {
          back = 1;
          chunk.blocks[ blockIndex ] = chunk.blocks[ blockIndex ] | 0x10;
        }
      }
    }
    if (x > 0) {
      if (chunk.blocks[ chunk.blockIndex(x - 1, y, z) ] !== 0) {
        left = 1;
        chunk.blocks[ blockIndex ] = chunk.blocks[ blockIndex ] | 0x8;
      }
    } else if (isMapChunk) {
      let blockExists = !!worldMap.getBlock(
        chunk.computeWorldPosition({ x: x - 1, y, z })
      );
      // Check hit towards other chunks.
      if (blockExists) {
        left = 1;
        chunk.blocks[ blockIndex ] = chunk.blocks[ blockIndex ] | 0x8;
      }
    }
    if (x < chunk.size.x - 1) {
      if (chunk.blocks[ chunk.blockIndex(x + 1, y, z) ] !== 0) {
        right = 1;
        chunk.blocks[ blockIndex ] = chunk.blocks[ blockIndex ] | 0x4;
      }
    } else if (isMapChunk) {
      let blockExists = !!worldMap.getBlock(
        chunk.computeWorldPosition({ x: x + 1, y, z })
      );
      if (blockExists) {
        right = 1;
        chunk.blocks[ blockIndex ] = chunk.blocks[ blockIndex ] | 0x4;
      }
    }

    // Only check / draw bottom if we are an object!
    if (!isMapChunk) {
      if (y > 0) {
        if (chunk.blocks[ chunk.blockIndex(x, y - 1, z) ] !== 0) {
          below = 1;
          chunk.blocks[ blockIndex ] = chunk.blocks[ blockIndex ] | 0x20; // bit 6
        }
      }
    }

    if (y < chunk.size.y - 1) {
      if (chunk.blocks[ chunk.blockIndex(x, y + 1, z) ] !== 0) {
        above = 1;
        chunk.blocks[ blockIndex ] = chunk.blocks[ blockIndex ] | 0x2;
      }
    } else if (isMapChunk) {
      let blockExists = !!worldMap.getBlock(
        chunk.computeWorldPosition({ x, y: y + 1, z })
      );
      // Check hit towards other chunks.
      if (blockExists) {
        above = 1;
        chunk.blocks[ blockIndex ] = chunk.blocks[ blockIndex ] | 0x2;
      }
    }
    if (z < chunk.size.z - 1) {
      if (chunk.blocks[ chunk.blockIndex(x, y, z + 1) ] !== 0) {
        front = 1;
        chunk.blocks[ blockIndex ] = chunk.blocks[ blockIndex ] | 0x1;
      }
    } else if (isMapChunk) {
      let blockExists = !!worldMap.getBlock(
        chunk.computeWorldPosition({ x, y, z: z - 1 })
      );
      // Check hit towards other chunks.
      if (blockExists) {
        front = 1;
        chunk.blocks[ blockIndex ] = chunk.blocks[ blockIndex ] | 0x1;
      }
    }

    return {
      front, above, right,
      left, back, below
    }
  }
}
