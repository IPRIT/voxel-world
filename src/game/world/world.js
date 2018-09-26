import { WorldMap } from "./map/world-map";
import { PlayerMe } from "../living-object/player/me/player-me";
import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE } from "../settings";
import { Game } from "../game";
import { SelectionOverlay } from "../living-object/utils";
import { Players } from "./players";
import { toBlockPosition } from "../utils";
import { CharactersMap } from "../dictionary";
import { DeerAnimal } from "../living-object/animal/deer";
import { PlayerEnemy } from "../living-object/player/enemy";

export class World {
  /**
   * @type {WorldMap}
   * @private
   */
  _map = null;

  /**
   * @type {PlayerMe}
   * @private
   */
  _me = null;

  /**
   * @type {Players}
   * @private
   */
  _players = Players.getPlayers();

  /**
   * @returns {Promise<*>}
   */
  async init () {
    const game = Game.getInstance();
    const map = new WorldMap();
    game.scene.add( map.init() );

    this._map = map;

    let coords = new THREE.Vector3( WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE, 10, WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE );

    /*for (let i = 0; i < 5; ++i) {
      let enemy = new PlayerEnemy();
      let enemyCoords = coords.clone().add({ x: Math.random() * 1000 - 500, y: 1000, z: Math.random() * 1000 - 500 });
      enemy.position.set( enemyCoords.x, enemyCoords.y, enemyCoords.z );

      this._players.addPlayer( enemy );

      enemy.init({
        objectInfo: {
          id: enemy.id,
          maxHealth: 2000 + Math.floor( Math.random() * 1000 ),
          health: 2000,
          maxEnergy: 1500 + Math.floor( Math.random() * 1000 ),
          energy: 1500
        }
      });

      setTimeout(_ => {
        enemy.setTargetLocation( new THREE.Vector3( enemy.position.x, enemy.position.y, enemy.position.z + 10 ) );
      }, 5000);

      enemy.attachToGameScene();
    }*/

    for (let i = 0; i < 5; ++i) {
      let enemy = new PlayerEnemy();
      let enemyCoords = coords.clone().add({ x: Math.random() * 1000 - 500, y: 1000, z: Math.random() * 1000 - 500 });
      enemy.position.set( enemyCoords.x, enemyCoords.y, enemyCoords.z );

      this._players.addPlayer( enemy );

      enemy.init({
        characterType: CharactersMap.MYSTIC,
        objectInfo: {
          id: enemy.id,
          name: 'Enemy ' + enemy.id,
          maxHealth: 2000 + Math.floor( Math.random() * 1000 ),
          health: 2000,
          maxEnergy: 1500 + Math.floor( Math.random() * 1000 ),
          energy: 1500
        }
      });

      enemy.attachToGameScene();
    }

    let me = new PlayerMe();
    me.position.set( coords.x, coords.y + 500, coords.z );
    me.init({
      characterType: CharactersMap.MYSTIC,
      objectInfo: {
        id: me.id,
        name: 'Оленина', // 'Lorem ipsum\ndolor sit amet',
        maxHealth: 20000,
        health: 12245,
        maxEnergy: 17000,
        energy: 13003
      }
    });
    this._players.setMe( me );

    me.attachToGameScene();

    /*const cylGeometry = new THREE.CylinderGeometry( 1600, 1600, 1000, 100, 2, true );
    const material = new THREE.MeshNormalMaterial();
    material.transparent = true;
    material.opacity = .5;
    material.side = THREE.DoubleSide;
    material.depthWrite = false;
    const cylinder = new THREE.Mesh( cylGeometry, material );
    cylinder.position.copy( me.position );

    game.scene.add( cylinder );*/
  }

  update (deltaTime) {
    const game = Game.getInstance();
    const players = this._players;
    const map = this._map;
    const me = players.me;

    const currentPosition = me && me.blockPosition
      || game.activeCamera && toBlockPosition( game.activeCamera.position );
    if (currentPosition) {
      map.updateAtPosition( currentPosition );
    }

    this._map.updateShowingAnimations( deltaTime );

    if (players) {
      players.update( deltaTime );
    }

    let selectionSprite = SelectionOverlay.getOverlay();
    if (selectionSprite.isAttached) {
      selectionSprite.update( deltaTime );
    }
  }

  /**
   * @param {LivingObject} targetLivingObject
   * @param {LivingObject} currentLivingObject
   * @returns {LivingObject}
   */
  getNextLivingObject (targetLivingObject, currentLivingObject) {
    let sortedObjects = this.getNearestLivingObjects( targetLivingObject );
    if (!sortedObjects.length) {
      return null;
    }

    let objectIndex = sortedObjects.findIndex(({ object }) => {
      return object.id === currentLivingObject.id;
    });

    return sortedObjects[ (objectIndex + 1) % sortedObjects.length ].object;
  }

  /**
   * @param {LivingObject} target
   * @returns {{ object: LivingObject, distance: number }}
   */
  getNearestLivingObjects (target) {
    let objects = [].concat( this._players.otherPlayers );
    return objects.map(object => {
      const distance = object.position.distanceTo( target.position );
      return { object, distance };
    }).sort((distanceA, distanceB) => {
      return distanceA.distance - distanceB.distance;
    });
  }

  /**
   * @returns {WorldMap}
   */
  get map () {
    return this._map;
  }

  /**
   * @returns {PlayerMe}
   */
  get me () {
    return this._me;
  }

  /**
   * @returns {THREE.Mesh[]}
   */
  get playersMeshes () {
    return this._players.otherPlayers
      .map(player => player.captureArea || player.mesh)
      .filter(area => !!area);
  }
}
