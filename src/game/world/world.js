import { WorldMap } from "./map/world-map";
import { PlayerMe } from "../living-object/player/me/player-me";
import { PlayerClassType } from "../living-object/player/player-class-type";
import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE } from "../settings";
import { PlayerEnemy } from "../living-object/player/enemy";

export class World {

  /**
   * @type {Game}
   * @private
   */
  _game = null;

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

  /**
   * @param {Game} game
   */
  constructor (game) {
    this._game = game;
  }

  async init () {
    let map = new WorldMap();
    map.init();
    this._game.scene.add( map );
    this._map = map;

    let coords = new THREE.Vector3( 16353.944446908708, 2, 16356.723378763674 );

    for (let i = 0; i < 1; ++i) {
      let enemy = new PlayerEnemy();
      let enemyCoords = coords.clone().add({ x: Math.random() * 1000 - 500, y: 0, z: Math.random() * 1000 - 500 });
      enemy.position.set( enemyCoords.x, enemyCoords.y, enemyCoords.z );
      this._players.push( enemy );

      enemy.init({
        classType: PlayerClassType.MYSTIC
      });
    }

    this._game.scene.add( ...this._players );

    let me = new PlayerMe();
    this._me = me;

    me.position.set(coords.x, coords.y, coords.z);

    me.init({
      classType: PlayerClassType.MYSTIC
    });

    game._transformControl = new THREE.TransformControls( game._activeCamera, game._renderer.domElement );
    game._transformControl.attach( me );
    this._game.scene.add( game._transformControl );
    this._game.scene.add( me );

    setTimeout(_ => {
      this._runDemo();
    }, 1000);
  }

  update (deltaTime) {
    if (this._me) {
      this._me.update( deltaTime );
      this.map.updateAtPosition( this._me.position.clone().divideScalar( WORLD_MAP_BLOCK_SIZE ) );
    }

    if (this._players.length) {
      for (let i = 0; i < this._players.length; ++i) {
        this._players[ i ].update( deltaTime );
      }
    }

    game._transformControl && game._transformControl.update();
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
        player.setTargetLocation( points[ pointIndex ++ % points.length ] );
      }

      if (Math.random() < .05) {
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
