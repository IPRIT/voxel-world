import { ParticleSystem } from "./particle";

/*
Fountain
 */
// updating
if (this._particleSystem) {
  this._particleSystem.position.set( this.position.x, this.position.y, this.position.z );
  this._particleSystem.update( deltaTime );

  if (this._particleSystem.isStopped) {
    this.remove( this._particleSystem );
    this._particleSystem = null;
  }
}

// init
const particleSystem = new ParticleSystem({
  timeScale: .5,
  spawnRate: .3,
  maxParticlesNumber: 80,
  particleOptions: {
    generateContext: () => {
      return {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 2 - 1
      };
    },
    colorRange: [
      new THREE.Vector3( 206 / 360, 93 / 100, 33 / 100 ),
      new THREE.Vector3( 206 / 360, 93 / 100, 66 / 100 )
    ],
    isHSLRange: true,
    lifetime: 150,
    velocity: (context) => {
      return new THREE.Vector3( context.x, 0, context.z )
        .normalize()
        .multiplyScalar( 100 )
        .setY( 30 )
    },
    rotationVelocity: (context) => {
      return new THREE.Vector3( context.x, context.y, context.z )
    },
    positionOffset: (context) => {
      return new THREE.Vector3( -context.x, 0, -context.z )
        .normalize()
        .multiplyScalar( 10 )
    },
    acceleration: (context) => {
      return new THREE.Vector3( -context.x, 10, -context.z )
        .normalize()
        .multiplyScalar( 200 )
        .setY( 20 )
    },
    scale: () => {
      return Math.random() + .3;
    }
  }
});

particleSystem.start();

livingObject.add( particleSystem );
livingObject._particleSystem = particleSystem;
