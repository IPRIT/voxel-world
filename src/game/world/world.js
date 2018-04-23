import { WorldMap } from "./map/world-map";
import { PlayerMe } from "../player/me/player-me";
import { PlayerClassType } from "../player/player-class-types";
import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE } from "./map";

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

    let me = new PlayerMe();
    this._me = me;

    me.init({
      classType: PlayerClassType.MYSTIC
    }).then(_ => {
      console.log('Me:', me);
      me.position.set(WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE + 2, 2.4, WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE);
      this._game.scene.add( me );

      let loader = new THREE.ObjectLoader();
      loader.load( 'resources/models/skinned/animation-model.json', scene => {
        let object = scene.children[0];
        console.log(object);

        let material = scene.children[0].material;
        let geometry = scene.children[0].geometry;

        console.log(material, geometry);

        let skinnedMesh = new THREE.SkinnedMesh( geometry, material );
        skinnedMesh.scale.set( 1, 1, 1 );
        skinnedMesh.position.setY(7);
        this._me.add( skinnedMesh );

        this._mixer = new THREE.AnimationMixer( skinnedMesh );
        console.log('Animations:', skinnedMesh.geometry.animations);

        let k = 1;
        this._mixerAction = this._mixer.clipAction( skinnedMesh.geometry.animations[ k ] );
        this._mixerAction.play();

        setInterval(_ => {
          this._mixerAction.stop();
          this._mixerAction = this._mixer.clipAction( skinnedMesh.geometry.animations[ k++ % 2 ] );
          this._mixerAction.play();
        }, 3000)
      });
    });
  }

  update (clock) {
    if (this._me) {
      this._me.update();
      // this._me.position.x += -.2;
      this._me.position.z -= .2;
      this.map.updateAtPosition( this._me.position.clone().divideScalar( WORLD_MAP_BLOCK_SIZE ) );
      // this._me.rotation.y += .01;

      if ( this._mixer ) {
        this._mixer.update( clock.getDelta() );
      }
    }
  }

  /**
   * @returns {WorldMap}
   */
  get map () {
    return this._map;
  }
}
