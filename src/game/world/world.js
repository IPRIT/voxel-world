import { TYPE_CHUNK_FF, TYPE_CHUNK_OBJECT, WorldChunk } from "./world-chunk";
import { TYPE_MAP } from "../vox";

export const WORLD_SIZE = 1 << 8;
export const WORLD_BLOCK_SIZE = 1;
export const WORLD_CHUNK_SIZE = 1 << 6;
export const WORLD_HEIGHT = 1 << 7;

export class World {

  _game = null;

  chunks = {};
  blocks = [];

  _showChunks = false;
  _wireframe = false;
  _material = null;

  /**
   * @param {Game} game
   */
  constructor (game) {
    this._game = game;
  }

  init () {
    this._initBlocksArray();
    this._initChunks();

    this._buildGroundPlate();

    this._rebuildMaterial();
    this._rebuildDirtyChunks(true);

    // ok
    // this.addBlock({ x: 0, y: 1, z: 0}, [100, 200, 100]);
    // this.addBlock({ x: 1, y: 0, z: 0}, [100, 200, 100]);
    // this.addBlock({ x: 0, y: 0, z: 1}, [100, 200, 100]);

    this.addBlock({ x: 0, y: 1, z: 0}, [200, 100, 200]);


    function getY(x, z) {
      return Math.ceil(Math.cos(x / 20) * Math.sin(z / 20) * 10) + 10;
    }

    for (let x = 0; x < WORLD_SIZE; ++x) {
      // for (let y = 0; y < WORLD_HEIGHT; ++y) {
        for (let z = 0; z < WORLD_SIZE; ++z) {
          let y = getY(x, z);
          if (/*y <= maxY && */this.isInsideWorld(x, y, z)) {
            this.addBlock({ x, y, z }, [100, 200, 100]);
          }
        }
      // }
    }

    let maxY = 0;
    for (let x = WORLD_SIZE / 2; x < WORLD_SIZE / 2 + 4; ++x) {
      for (let z = WORLD_SIZE / 2; z < WORLD_SIZE / 2 + 6; ++z) {
        maxY = Math.max(getY(x, z), maxY);
      }
    }

    for (let y = maxY + 1; y <= maxY + 12; ++y) {
      for (let x = WORLD_SIZE / 2; x < WORLD_SIZE / 2 + 4; ++x) {
        for (let z = WORLD_SIZE / 2; z < WORLD_SIZE / 2 + 6; ++z) {
          this.addBlock({ x, y, z }, [200, 100, 200]);
        }
      }
    }

    this._rebuildDirtyChunks();
  }


  buildMap (voxelObject) {
    let { XYZI, RGBA, SIZE } = voxelObject;
    let color, colorArr;
    for (let i = 0; i < XYZI.length; ++i) {
      let {x, y, z, c} = XYZI[i];
      color = RGBA[ c ];
      colorArr = [ color.r, color.g, color.b ];
      this.addBlock({ x: x + WORLD_SIZE / 2 - 20, y: z + 0, z: y + WORLD_SIZE / 2 - 20 }, colorArr);
    }
    this._rebuildDirtyChunks();
  }

  /**
   * @param {number|THREE.Vector3} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  isInsideWorld (x, y = 0, z = 0) {
    // in case x is THREE.Vector3
    if (typeof x === 'object') {
      const position = x;
      x = position.x;
      y = position.y;
      z = position.z;
    }
    let limits = {
      x: [0, WORLD_SIZE],
      y: [0, WORLD_HEIGHT],
      z: [0, WORLD_SIZE]
    };
    return x > limits.x[0] && x < limits.x[1] &&
      y >= limits.y[0] && y < limits.y[1] &&
      z > limits.z[0] && z < limits.z[1];
  }

  getChunk (x, z) {
    const xIndex = this._getChunkIndexByAxis(x);
    const zIndex = this._getChunkIndexByAxis(z);
    return this.chunks[ this._getChunkIndex(xIndex, zIndex) ];
  }

  getBlockIndex (x, y, z) {
    return x * WORLD_HEIGHT * WORLD_SIZE
      + y * WORLD_SIZE
      + z;
  }

  getBlockCoord (index) {
    /**
      const yz = ySize * zSize;
      const t1 = index % yz;
      const z = t1 % zSize;
      const y = (t1 - z) / zSize;
      const x = (index - t1) / yz;
      return [x, y, z];
    */
    const yz = WORLD_HEIGHT * WORLD_SIZE;
    const t1 = index % yz;
    const z = t1 % WORLD_SIZE;
    const y = (t1 - z) / WORLD_SIZE;
    const x = (index - t1) / yz;
    return { x, y, z };
  }

  getBlock ({ x, y, z }) {
    return this.blocks[
      x * WORLD_HEIGHT * WORLD_SIZE
      + y * WORLD_SIZE
      + z
    ];
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} color
   */
  setBlock ({ x, y, z }, color) {
    this.blocks[
      x * WORLD_HEIGHT * WORLD_SIZE
      + y * WORLD_SIZE
      + z
    ] = color;
  }

  addBlock ({ x, y, z }, color) {
    const size = 1 / WORLD_BLOCK_SIZE;

    if (!this.isInsideWorld(x, y, z)) {
      return;
    }

    const chunk = this.getChunk(x, z);

    if (this.getBlock({ x, y, z }) === 0) {
      chunk.voxBlocksNumber += size;
      this.setBlock(
        { x, y, z },
        (color[0] & 0xFF) << 24 | (color[1] & 0xFF) << 16 | (color[2] & 0xFF) << 8 | 0 & 0xFF
      );
      chunk.dirty = true;
    }
  }

  _initBlocksArray () {
    this.blocks = new Uint32Array(WORLD_SIZE * WORLD_HEIGHT * WORLD_SIZE);
  }

  _initChunks () {
    const maxChunkNumber = this.chunksSideNumber;
    for (let x = 0; x < maxChunkNumber; ++x) {
      for (let z = 0; z < maxChunkNumber; ++z) {
        const chunk = new WorldChunk();
        chunk.type = TYPE_MAP;
        chunk.fromY = 0;
        chunk.toY = WORLD_HEIGHT;
        chunk.fromX = x * WORLD_BLOCK_SIZE * WORLD_CHUNK_SIZE;
        chunk.toX = chunk.fromX + WORLD_CHUNK_SIZE;
        chunk.fromZ = z * WORLD_BLOCK_SIZE * WORLD_CHUNK_SIZE;
        chunk.toZ = chunk.fromZ + WORLD_CHUNK_SIZE;
        chunk.x = x;
        chunk.z = z;

        this.chunks[ this._getChunkIndex(x, z) ] = chunk;

        this._showChunks && this._debugChunk(chunk);
      }
    }
  }

  _buildGroundPlate () {
    let geo = new THREE.BoxGeometry(
      WORLD_BLOCK_SIZE * WORLD_SIZE - 2,
      2,
      WORLD_BLOCK_SIZE * WORLD_SIZE - 2
    );
    let mat = new THREE.MeshPhongMaterial({ color: 0x444444, shininess: 100 });
    let mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      WORLD_SIZE / 2,
      -1.01, // to prevent collisions with grid helper
      WORLD_SIZE / 2
    );
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this._game._scene.add(mesh);

    // base
    geo = new THREE.BoxGeometry(
      WORLD_BLOCK_SIZE * WORLD_SIZE,
      1000,
      WORLD_BLOCK_SIZE * WORLD_SIZE
    );
    mat = new THREE.MeshPhongMaterial({ color: 0xd56e00 });
    mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.position.set(
      WORLD_SIZE / 2,
      -1000 / 2 - 1,
      WORLD_SIZE / 2
    );
    this._game._scene.add(mesh);
  }

  _getChunkIndex (x, z) {
    return `${x}|${z}`;
  }

  _rebuildDirtyChunks (buildAll = false) {
    const maxChunkNumber = this.chunksSideNumber;
    for (let x = 0; x < maxChunkNumber; ++x) {
      for (let z = 0; z < maxChunkNumber; ++z) {
        if (buildAll || this.chunks[ this._getChunkIndex(x, z) ].dirty === true) {
          this._rebuildChunk(this.chunks[ this._getChunkIndex(x, z) ]);
        }
      }
    }
  }

  /**
   * @param {WorldChunk} chunk
   * @private
   */
  _rebuildChunk (chunk) {
    // console.log('Rebuilding chunk:', chunk);
    let sides = 0;

    let vertices = [];
    let colors = [];

    // Block structure
    // BLOCK: [R-color][G-color][B-color][0][00][back_left_right_above_front]
    //           8bit    8bit     8it    1bit(unused)  2bit(floodfill)     5bit(faces)

    // Reset faces
    for (let x = chunk.fromX; x < chunk.toX; x++) {
      for (let y = chunk.fromY; y < chunk.toY; y++) {
        for (let z = chunk.fromZ; z < chunk.toZ; z++) {
          let blockIndex = this.getBlockIndex(x, y, z);

          if (x < 0
            || y < 0
            || z < 0
            || x >= WORLD_SIZE
            || y >= WORLD_HEIGHT
            || z >= WORLD_SIZE) {
            continue;
          }

          if (this.blocks[ blockIndex ] !== 0) {
            this.blocks[ blockIndex ] &= ~(1 << 0);
            this.blocks[ blockIndex ] &= ~(1 << 1);
            this.blocks[ blockIndex ] &= ~(1 << 2);
            this.blocks[ blockIndex ] &= ~(1 << 3);
            this.blocks[ blockIndex ] &= ~(1 << 4);
          }
        }
      }
    }

    for (let x = chunk.fromX; x < chunk.toX; x++) {
      for (let y = chunk.fromY; y < chunk.toY; y++) {
        for (let z = chunk.fromZ; z < chunk.toZ; z++) {
          let blockIndex = this.getBlockIndex(x, y, z);

          if (x < 0
            || y < 0
            || z < 0
            || x >= WORLD_SIZE
            || y >= WORLD_HEIGHT
            || z >= WORLD_SIZE) {
            continue;
          }

          if (chunk.type === TYPE_CHUNK_FF) {
            // make sure we only use blocks that we should build as mesh. (floodfill only)
            if ((this.blocks[ blockIndex ] & 0x20) === 0
              && (this.blocks[ blockIndex ] & 0x40) === 0) {
              continue;
            }
          }
          if (this.blocks[ blockIndex ] === 0) {
            continue; // Skip empty blocks
          }
          // Check if hidden
          let {
            left, right, above, below, front, back
          } = this._blockHiddenSides(x, y, z);

          if (back) {
            this.blocks[ blockIndex ] |= 0x10;
          }
          if (left) {
            this.blocks[ blockIndex ] |= 0x8;
          }
          if (right) {
            this.blocks[ blockIndex ] |= 0x4;
          }
          if (above) {
            this.blocks[ blockIndex] |= 0x2;
          }
          if (front) {
            this.blocks[ blockIndex] |= 0x1;
          }

          if (front === 1 && left === 1 &&
            right === 1 && above === 1 &&
            back === 1) {
            // If we are building a standalone mesh, remove invisible
            if (chunk.type === TYPE_CHUNK_OBJECT || chunk.type === TYPE_CHUNK_FF) {
              this.blocks[ blockIndex ] = 0;
            }
            continue; // block is hidden
          }

          // Draw block
          if (!above) {
            // Get above (0010)
            if ((this.blocks[ blockIndex ] & 0x2) === 0) {
              let maxX = 0;
              let maxZ = 0;
              let end = 0;

              for (let x_ = x; x_ < chunk.toX; x_++) {
                // Check not drawn + same color
                if ((this.getBlock({ x: x_, y, z }) & 0x2) === 0
                  && this._isSameColor(this.getBlock({ x: x_, y, z }), this.blocks[ blockIndex ])) {
                  maxX++;
                } else {
                  break;
                }
                let tmpZ = 0;
                for (let z_ = z; z_ < chunk.toZ; z_++) {
                  if ((this.getBlock({ x: x_, y, z: z_ }) & 0x2) === 0
                    && this._isSameColor(this.getBlock({ x: x_, y, z: z_ }), this.blocks[ blockIndex ])) {
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
                  this.setBlock(
                    { x: x_, y, z: z_ },
                    this.getBlock({ x: x_, y, z: z_ }) | 0x2
                  );
                }
              }
              maxX--;
              maxZ--;

              vertices.push([
                x * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxX),
                y * WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxZ)
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxZ)
              ]);

              vertices.push([
                x * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxX),
                y * WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxZ)
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxX),
                y * WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE
              ]);

              sides += 6;
              for (let n = 0; n < 6; n++) {
                colors.push([
                  (this.blocks[ blockIndex ] >> 24) & 0xFF,
                  (this.blocks[ blockIndex ] >> 16) & 0xFF,
                  (this.blocks[ blockIndex ] >> 8) & 0xFF
                ]);
              }
            }
          }
          if (!back) {
            // back  10000
            if ((this.blocks[ blockIndex ] & 0x10) === 0) {
              let maxX = 0;
              let maxY = 0;

              for (let x_ = x; x_ < chunk.toX; x_++) {
                // Check not drawn + same color
                if ((this.getBlock({ x: x_, y, z }) & 0x10) === 0
                  && this._isSameColor(this.getBlock({ x: x_, y, z }), this.blocks[ blockIndex ])) {
                  maxX++;
                } else {
                  break;
                }
                let tmpY = 0;
                for (let y_ = y; y_ < chunk.toY; y_++) {
                  if ((this.getBlock({ x: x_, y: y_, z }) & 0x10) === 0
                    && this._isSameColor(this.getBlock({ x: x_, y: y_, z }), this.blocks[ blockIndex ])) {
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
                  this.setBlock(
                    { x: x_, y: y_, z },
                    this.getBlock({ x: x_, y: y_, z }) | 0x10
                  );
                }
              }
              maxX--;
              maxY--;
              vertices.push([
                x * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxX),
                y * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxX),
                y * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE
              ]);

              vertices.push([
                x * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxX),
                y * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE + (WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE - WORLD_BLOCK_SIZE
              ]);

              sides += 6;
              for (let n = 0; n < 6; n++) {
                colors.push([
                  (this.blocks[ blockIndex ] >> 24) & 0xFF,
                  (this.blocks[ blockIndex ] >> 16) & 0xFF,
                  (this.blocks[ blockIndex ] >> 8) & 0xFF
                ]);
              }
            }
          }
          if (!front) {
            // front 0001
            if ((this.blocks[ blockIndex ] & 0x1) === 0) {
              let maxX = 0;
              let maxY = 0;

              for (let x_ = x; x_ < chunk.toX; x_++) {
                // Check not drawn + same color
                if ((this.getBlock({ x: x_, y, z }) & 0x1) === 0
                  && this._isSameColor(this.getBlock({ x: x_, y, z }), this.blocks[ blockIndex ])) {
                  maxX++;
                } else {
                  break;
                }
                let tmpY = 0;
                for (let y_ = y; y_ < chunk.toY; y_++) {
                  if ((this.getBlock({ x: x_, y: y_, z }) & 0x1) === 0
                    && this._isSameColor(this.getBlock({ x: x_, y: y_, z }), this.blocks[ blockIndex ])) {
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
                  this.setBlock(
                    { x: x_, y: y_, z },
                    this.getBlock({ x: x_, y: y_, z }) | 0x1
                  );
                }
              }
              maxX--;
              maxY--;

              vertices.push([
                x * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxX),
                y * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxX),
                y * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE
              ]);

              vertices.push([
                x * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxX),
                y * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE
              ]);
              sides += 6;
              for (let n = 0; n < 6; n++) {
                colors.push([
                  (this.blocks[ blockIndex ] >> 24) & 0xFF,
                  (this.blocks[ blockIndex ] >> 16) & 0xFF,
                  (this.blocks[ blockIndex ] >> 8) & 0xFF
                ]);
              }
            }
          }
          if (!left) {
            if ((this.blocks[ blockIndex ] & 0x8) === 0) {
              let maxZ = 0;
              let maxY = 0;

              for (let z_ = z; z_ < chunk.toZ; z_++) {
                // Check not drawn + same color
                if ((this.getBlock({ x, y, z: z_ }) & 0x8) === 0
                  && this._isSameColor(this.getBlock({ x, y, z: z_ }), this.blocks[ blockIndex ])) {
                  maxZ++;
                } else {
                  break;
                }
                let tmpY = 0;
                for (let y_ = y; y_ < chunk.toY; y_++) {
                  if ((this.getBlock({ x, y: y_, z: z_ }) & 0x8) === 0
                    && this._isSameColor(this.getBlock({ x, y: y_, z: z_ }), this.blocks[ blockIndex ])) {
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
                  this.setBlock(
                    { x, y: y_, z: z_ },
                    this.getBlock({ x, y: y_, z: z_ }) | 0x8
                  );
                }
              }
              maxZ--;
              maxY--;

              vertices.push([
                x * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxZ)
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxZ)
              ]);

              vertices.push([
                x * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxZ)
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE
              ]);

              sides += 6;
              for (let n = 0; n < 6; n++) {
                colors.push([
                  (this.blocks[ blockIndex ] >> 24) & 0xFF,
                  (this.blocks[ blockIndex ] >> 16) & 0xFF,
                  (this.blocks[ blockIndex ] >> 8) & 0xFF
                ]);
              }
            }
          }
          if (!right) {
            if ((this.blocks[ blockIndex ] & 0x4) === 0) {
              let maxZ = 0;
              let maxY = 0;

              for (let z_ = z; z_ < chunk.toZ; z_++) {
                // Check not drawn + same color
                if ((this.getBlock({ x, y, z: z_ }) & 0x4) === 0
                  && this._isSameColor(this.getBlock({ x, y, z: z_ }), this.blocks[ blockIndex ])) {
                  maxZ++;
                } else {
                  break;
                }
                let tmpY = 0;
                for (let y_ = y; y_ < chunk.toY; y_++) {
                  if ((this.getBlock({ x, y: y_, z: z_ }) & 0x4) === 0
                    && this._isSameColor(this.getBlock({ x, y: y_, z: z_ }), this.blocks[ blockIndex ])) {
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
                  this.setBlock(
                    { x, y: y_, z: z_ },
                    this.getBlock({ x, y: y_, z: z_ }) | 0x4
                  );
                }
              }
              maxZ--;
              maxY--;

              vertices.push([
                x * WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxZ)
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxZ)
              ]);

              vertices.push([
                x * WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxZ)
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE,
                z * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE
              ]);
              vertices.push([
                x * WORLD_BLOCK_SIZE,
                y * WORLD_BLOCK_SIZE+(WORLD_BLOCK_SIZE * maxY),
                z * WORLD_BLOCK_SIZE-WORLD_BLOCK_SIZE
              ]);

              sides += 6;
              for (let n = 0; n < 6; n++) {
                colors.push([
                  (this.blocks[ blockIndex ] >> 24) & 0xFF,
                  (this.blocks[ blockIndex ] >> 16) & 0xFF,
                  (this.blocks[ blockIndex ] >> 8) & 0xFF
                ]);
              }
            }
          }

          if (chunk.type === TYPE_CHUNK_OBJECT || chunk.type === TYPE_CHUNK_FF) {
            this.blocks[ blockIndex ] = 0;
          }
        }
      }
    }
    chunk.triangles = vertices.length / 3;

    // Draw chunk
    let geometry = new THREE.BufferGeometry();
    let v = new THREE.BufferAttribute( new Float32Array(vertices.length * 3), 3 );
    for (let i = 0; i < vertices.length; i++) {
      v.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
    }
    geometry.addAttribute( 'position', v );

    let c = new THREE.BufferAttribute( new Float32Array(colors.length * 3), 3 );
    for (let i = 0; i < colors.length; i++) {
      c.setXYZW(i, colors[i][0] / 255, colors[i][1] / 255, colors[i][2] / 255, 1);
    }
    geometry.addAttribute( 'color', c );

    geometry.computeVertexNormals();
    geometry.computeFaceNormals();

    geometry.computeBoundingBox();

    this._game._scene.remove(chunk.mesh);
    chunk.mesh = new THREE.Mesh(geometry, this._material);

    chunk.mesh.position.set(
      chunk.fromX / WORLD_CHUNK_SIZE - WORLD_BLOCK_SIZE * chunk.fromX / WORLD_CHUNK_SIZE,
      WORLD_BLOCK_SIZE,
      chunk.fromZ / WORLD_CHUNK_SIZE - WORLD_BLOCK_SIZE * chunk.fromZ / WORLD_CHUNK_SIZE
    );

    chunk.mesh.receiveShadow = true;
    chunk.mesh.castShadow = true;
    chunk.dirty = false;

    this._game._scene.add( chunk.mesh );

    chunk.mesh.visible = true;
  }

  _rebuildMaterial (wireframe = false) {
    this._wireframe = wireframe;
    this._material = new THREE.MeshPhongMaterial({
      vertexColors: THREE.VertexColors,
      shininess: 100,
      wireframe: this._wireframe
    });
  }

  _blockHiddenSides (x, y, z) {
    const index = this.getBlockIndex(x, y, z);

    if ((this.blocks[ index ] >> 8) === 0) {
      return true;
    }

    let left = 0, right = 0, above = 0,
      front = 0, back = 0, below = 0;

    if (y > 0) {
      if ((this.blocks[ this.getBlockIndex(x, y - 1, z) ] >> 8) !== 0) {
        below = 1;
      }
    }
    if (z > 0){
      if ((this.blocks[ this.getBlockIndex(x, y, z - 1) ] >> 8) !== 0) {
        back = 1;
      }
    }
    if (x > 0) {
      if ((this.blocks[ this.getBlockIndex(x - 1, y, z) ] >> 8) !== 0) {
        left = 1;
      }
    }
    if (x < WORLD_SIZE - 1) {
      if ((this.blocks[ this.getBlockIndex(x + 1, y, z) ] >> 8) !== 0) {
        right = 1;
      }
    }
    if (y < WORLD_HEIGHT - 1) {
      if ((this.blocks[ this.getBlockIndex(x, y + 1, z) ] >> 8) !== 0) {
        above = 1;
      }
    }
    if (z < WORLD_SIZE - 1){
      if ((this.blocks[ this.getBlockIndex(x, y, z + 1) ] >> 8) !== 0) {
        front = 1;
      }
    }

    return {
      above, below, left, right, front, back
    };
  }

  _isBlockHidden ({ x, y, z }) {
    let {
      above, below, left, right, front, back
    } = this._blockHiddenSides(x, y, z);

    return front === 1 && below === 1 && left === 1
      && right === 1 && above === 1 && back === 1;
  }

  /**
   * @param {WorldChunk} chunk
   * @private
   */
  _debugChunk (chunk) {
    const mat = new THREE.MeshPhongMaterial({ color: 0x00bcd4, wireframe: false, transparent: true, opacity: .2 });
    mat.side = THREE.DoubleSide;
    const geo = new THREE.BoxGeometry(
      WORLD_BLOCK_SIZE * WORLD_CHUNK_SIZE - .01,
      WORLD_BLOCK_SIZE * WORLD_HEIGHT,
      WORLD_BLOCK_SIZE * WORLD_CHUNK_SIZE - .01
    );
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.x = chunk.fromX + WORLD_CHUNK_SIZE * WORLD_BLOCK_SIZE / 2 + .01;
    mesh.position.z = chunk.fromZ + WORLD_CHUNK_SIZE * WORLD_BLOCK_SIZE / 2 + .01;
    mesh.position.y = WORLD_BLOCK_SIZE * WORLD_HEIGHT / 2;

    this._game._scene.add(mesh);

    this._createText(chunk.chunkIndex, {
      position: new THREE.Vector3(mesh.position.x, 1.1, mesh.position.z),
      rotation: new THREE.Vector3(-Math.PI / 2, 0, 0),
      size: 2
    });

    return;

    let vector = new THREE.Vector3(
      chunk.fromX,
      .3,
      chunk.fromZ
    );
    this._createText(`[${vector.x.toFixed(0)}, ${vector.z.toFixed(0)}]`, {
      position: new THREE.Vector3(
        vector.x + 1.5, vector.y, vector.z + 1.5
      ),
      rotation: new THREE.Vector3(-Math.PI / 2, 0, 0),
      size: .4,
      height: .05
    });

    vector = new THREE.Vector3(
      chunk.fromX + WORLD_CHUNK_SIZE,
      .3,
      chunk.fromZ
    );
    this._createText(`[${vector.x.toFixed(0)}, ${vector.z.toFixed(0)}]`, {
      position: new THREE.Vector3(
        vector.x - 1.5, vector.y, vector.z + 1.5
      ),
      rotation: new THREE.Vector3(-Math.PI / 2, 0, 0),
      size: .4,
      height: .05
    });

    vector = new THREE.Vector3(
      chunk.fromX + WORLD_CHUNK_SIZE,
      .3,
      chunk.fromZ + WORLD_CHUNK_SIZE
    );
    this._createText(`[${vector.x.toFixed(0)}, ${vector.z.toFixed(0)}]`, {
      position: new THREE.Vector3(
        vector.x - 1.5, vector.y, vector.z - 1.5
      ),
      rotation: new THREE.Vector3(-Math.PI / 2, 0, 0),
      size: .4,
      height: .05
    });

    vector = new THREE.Vector3(
      chunk.fromX,
      .3,
      chunk.fromZ + WORLD_CHUNK_SIZE
    );
    this._createText(`[${vector.x.toFixed(0)}, ${vector.z.toFixed(0)}]`, {
      position: new THREE.Vector3(
        vector.x + 1.5, vector.y, vector.z - 1.5
      ),
      rotation: new THREE.Vector3(-Math.PI / 2, 0, 0),
      size: .4,
      height: .05
    });
  }

  _createText (text, { size, color = 0xFF0000, position, rotation, height = .1 } = {}) {
    const textGeometry = new THREE.TextGeometry(text, {
      font: gameFont,
      size,
      height,
      curveSegments: 12,

      style: 'normal',
      weight: 'normal',
      bevelEnabled: false
    });
    textGeometry.computeBoundingBox();

    const textMaterial = new THREE.MeshBasicMaterial({
      color
    });

    const mesh = new THREE.Mesh( textGeometry, textMaterial );
    mesh.position.set(
      position.x - (textGeometry.boundingBox.min.x + textGeometry.boundingBox.max.x) / 2,
      position.y - (textGeometry.boundingBox.min.y + textGeometry.boundingBox.max.y) / 2,
      position.z - (textGeometry.boundingBox.min.z + textGeometry.boundingBox.max.z) / 2
    );
    mesh.rotation.set(
      rotation.x,
      rotation.y,
      rotation.z
    );

    this._game._scene.add(mesh);

    return mesh;
  }

  /**
   * @param {number} axis
   * @returns {number}
   */
  _getChunkIndexByAxis (axis) {
    return ( axis - axis % WORLD_CHUNK_SIZE ) / WORLD_CHUNK_SIZE;
  }

  _isSameColor (block1, block2) {
    return ((block1 >> 8) & 0xFFFFFF) === ((block2 >> 8) & 0xFFFFFF)
      && block1 !== 0
      && block2 !== 0;
  }

  /**
   * @return {number} Computed chunks number
   */
  get chunksSideNumber () {
    return Math.ceil(WORLD_SIZE / WORLD_CHUNK_SIZE);
  }

  /**
   * @return {number} Computed chunks number
   */
  get chunksNumber () {
    return this.chunksSideNumber ** 2;
  }
}
