import { WorldMap } from "./map/world-map";
import { PlayerMe } from "../living-object/player/me/player-me";
import { PlayerClassType } from "../living-object/player/player-class-type";
import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE } from "../settings";
import { PlayerEnemy } from "../living-object/player/enemy";
import { Game } from "../game";
import { SelectionOverlay } from "../living-object/utils";
import { ParticlesPool } from "../effects/particle/particles-pool";

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
   * @type {Array<Player>}
   * @private
   */
  _players = [];

  async init () {
    const game = Game.getInstance();
    let map = new WorldMap();
    map.init();
    this._map = map;
    game.scene.add( map );

    let coords = new THREE.Vector3( WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE, 10, WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE );

    for (let i = 0; i < 100; ++i) {
      let enemy = new PlayerEnemy();
      let enemyCoords = coords.clone().add({ x: Math.random() * 1000 - 500, y: 100, z: Math.random() * 1000 - 500 });
      enemy.position.set( enemyCoords.x, enemyCoords.y, enemyCoords.z );
      this._players.push( enemy );

      enemy.init({
        classType: PlayerClassType.MYSTIC
      });
      enemy.setPlayerData({
        playerId: enemy.id,
        playerName: 'Enemy player ' + enemy.id
      });
      enemy.createLabel( enemy.playerName );

      game.scene.add( enemy );
    }

    let me = new PlayerMe();
    this._me = me;

    me.position.set(coords.x, coords.y, coords.z);

    me.init({
      classType: PlayerClassType.MYSTIC
    });
    me.setPlayerData({
      playerId: me.id,
      playerName: 'Lorem ipsum\ndolor sit amet' // 'Лисёнок'
    });
    me.createLabel( me.playerName );

    game._transformControl = new THREE.TransformControls( game._activeCamera, game._renderer.domElement );
    game._transformControl.attach( me );
    game.scene.add( game._transformControl );
    game.scene.add( me );

    setTimeout(_ => {
      // this._runDemo();
    }, 4000);

    SelectionOverlay.getOverlay(); // just init selection overlay once
    const particlesPool = ParticlesPool.getPool(); // init once
    particlesPool.createPool();

    console.log(particlesPool);
  }

  update (deltaTime) {
    if (this._me) {
      this._me.update( deltaTime );
      this._map.updateAtPosition(
        this._me.position.clone().divideScalar( WORLD_MAP_BLOCK_SIZE )
      );
    }

    if (this._players.length) {
      for (let i = 0; i < this._players.length; ++i) {
        this._players[ i ].update( deltaTime );
      }
    }

    let selectionSprite = SelectionOverlay.getOverlay();
    if (selectionSprite.isAttached) {
      selectionSprite.update( deltaTime );
    }

    game._transformControl && game._transformControl.update();
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
    let objects = [].concat( this._players );
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
    return (this._players || []).filter(_ => !!_.mesh).map(player => {
      return player.mesh;
    });
  }

  /**
   * @private
   */
  _runDemo () {
    this._players.forEach(player => {
      this._runDemoForPlayer( player );
    });

    this._players.forEach(player => {
      setInterval(_ => {
        player.setTargetObject( this._me );
      }, Math.random() * 2000 + 500);
    });
  }

  /**
   * @param {Player} player
   * @private
   */
  _runDemoForPlayer (player) {
    let pointIndex = 0;
    let points = [ ];

    for (let i = 0; i < 100; ++i) {
      let point = new THREE.Vector3( 16353.944446908708, 2, 16356.723378763674 );
      point.add({ x: Math.random() * 400 - 200, y: 0, z: Math.random() * 400 - 200 });
      points.push( point );
    }

    player.__interval = setInterval(_ => {
      if (!player.isComing) {
        // player.setTargetLocation( points[ pointIndex ++ % points.length ] );
      }

      if (Math.random() < .15) {
        player.jump();
      }
    }, 1000);
  }

  /**
   * @param {Player} player
   * @private
   */
  _runDemoForPlayer2 (player) {
    player.setTargetObject( this._me );
    player.setTargetObject( this._me );
  }
}
