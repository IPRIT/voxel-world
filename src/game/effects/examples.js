import { ParticleSystem } from "./particle";
import { TransitionPlayback } from "./index";
import { Game } from "../game";

/****** 1 */
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

// update
if (this._particleSystem) {
  this._particleSystem.position.set( this.position.x, this.position.y, this.position.z );
  this._particleSystem.update( deltaTime );

  if (this._particleSystem.isStopped) {
    this.remove( this._particleSystem );
    this._particleSystem = null;
  }
}


/****** 2 */
// init
const h = (Math.random() * 360) | 0;
const s = (Math.random() * 100) | 0;
const l = Math.max(20, Math.min(80, Math.random() * 100)) | 0;

const particleSystem = new ParticleSystem({
  timeScale: .5,
  spawnRate: .1,
  maxParticlesNumber: 50,
  local: Math.round( Math.random() ),
  particleOptions: {
    generateContext: () => {
      return {
        x: Math.random() * Math.random() * 2 - Math.random(),
        y: Math.random() * Math.random() * 2 - Math.random(),
        z: Math.random() * Math.random() * 2 - Math.random()
      };
    },
    colorRange: [
      new THREE.Vector3( h / 360, s / 100, (l - 20) / 100 ),
      new THREE.Vector3( h / 360, s / 100, (l + 20) / 100 )
    ],
    isHSLRange: true,
    lifetime: 220,
    velocity: (context) => {
      return new THREE.Vector3( -context.x, -context.y, -context.z )
        .normalize()
        .multiplyScalar( 50 )
    },
    rotationVelocity: (context) => {
      return new THREE.Vector3( context.x, context.y, context.z )
    },
    positionOffset: (context) => {
      return new THREE.Vector3( -context.x, -context.y, -context.z )
        .normalize()
        .multiplyScalar( 2 )
      // .add({ x: 0, y: this.objectHeight / 2, z: 0 })
    },
    acceleration: (context) => {
      return new THREE.Vector3( context.x, context.y, context.z )
        .normalize()
        .multiplyScalar( 10 )
    },
    scale: () => {
      return Math.random() * 2 + .5;
    }
  }
});

particleSystem.start();

const transition = new TransitionPlayback(this, livingObject, {
  timeScale: 1,
  velocity: 80,
  acceleration: .5
});
transition.start();

this._transitions = this._transitions || [];
this._transitions.push( transition );

Game.getInstance().scene.add( particleSystem );
transition._particleSystem = particleSystem;

// update
if (this._transitions) {
  for (let i = 0; i < this._transitions.length; ++i) {
    let transition = this._transitions[ i ];
    transition.update( deltaTime );

    if (transition._particleSystem) {
      let particleSystem = transition._particleSystem;
      particleSystem.position.copy( transition.currentPosition );
      particleSystem.update( deltaTime );

      if (particleSystem.isStopped) {
        Game.getInstance().scene.remove( particleSystem );
        transition._particleSystem = null;
      }
    }

    if (transition.isFinished) {
      if (transition._particleSystem) {
        setTimeout(((index) => {
          Game.getInstance().scene.remove( transition._particleSystem );
          transition._particleSystem.stop();
          this._transitions.splice(index, 1);
          transition.dispose();
        }).bind(null, i), 850);
      }
    }
  }
}

/****** 3 */
// init
const h = (Math.random() * 360) | 0;
const s = (Math.random() * 100) | 0;
const l = Math.max(20, Math.min(80, Math.random() * 100)) | 0;

const particleSystem = new ParticleSystem({
  timeScale: .5,
  spawnRate: .1,
  maxParticlesNumber: 50,
  local: Math.round( Math.random() ),
  particleOptions: {
    generateContext: () => {
      return {
        x: Math.random() * Math.random() * 2 - Math.random(),
        y: Math.random() * Math.random() * 2 - Math.random(),
        z: Math.random() * Math.random() * 2 - Math.random()
      };
    },
    colorRange: [
      new THREE.Vector3( h / 360, s / 100, (l - 20) / 100 ),
      new THREE.Vector3( h / 360, s / 100, (l + 20) / 100 )
    ],
    isHSLRange: true,
    lifetime: 220,
    velocity: (context) => {
      return new THREE.Vector3( -context.x, -context.y, -context.z )
        .normalize()
        .multiplyScalar( 50 )
    },
    rotationVelocity: (context) => {
      return new THREE.Vector3( context.x, context.y, context.z )
    },
    positionOffset: (context) => {
      return new THREE.Vector3( -context.x, -context.y, -context.z )
        .normalize()
        .multiplyScalar( 2 )
      // .add({ x: 0, y: this.objectHeight / 2, z: 0 })
    },
    acceleration: (context) => {
      return new THREE.Vector3( context.x, context.y, context.z )
        .normalize()
        .multiplyScalar( 10 )
    },
    scale: () => {
      return Math.random() * 2 + .5;
    }
  }
});
particleSystem.start();

const transition = new TransitionPlayback(this, livingObject, {
  timeScale: 1,
  velocity: 80,
  acceleration: .5
});
transition.start();

this._transitions = this._transitions || [];
this._transitions.push( transition );

Game.getInstance().scene.add( particleSystem );
transition._particleSystem = particleSystem;

// update
if (this._transitions) {
  for (let i = 0; i < this._transitions.length; ++i) {
    let transition = this._transitions[ i ];
    transition.update( deltaTime );

    if (transition._particleSystem) {
      /**
       * @type {ParticleSystem}
       */
      let particleSystem = transition._particleSystem;
      particleSystem.position.copy(transition.currentPosition);
      particleSystem.update( deltaTime );

      if (transition.isFinished) {
        particleSystem.stop();

        if (particleSystem.isFinished) {
          particleSystem.release();
          Game.getInstance().scene.remove( particleSystem );
          this._transitions.splice( i, 1 );
          transition.dispose();
        }
      }
    }
  }
}

/***** 4 */
// init
const h = (Math.random() * 360) | 0;
const s = (Math.random() * 100) | 0;
const l = Math.max(20, Math.min(80, Math.random() * 100)) | 0;

const particleSystem = new ParticleSystem({
  timeScale: .5,
  spawnRate: .1,
  maxParticlesNumber: 50,
  local: Math.round( Math.random() ),
  particleOptions: {
    generateContext: () => {
      return {
        x: Math.random() * Math.random() * 2 - Math.random(),
        y: Math.random() * Math.random() * 2 - Math.random(),
        z: Math.random() * Math.random() * 2 - Math.random()
      };
    },
    colorRange: [
      new THREE.Vector3( h / 360, s / 100, (l - 20) / 100 ),
      new THREE.Vector3( h / 360, s / 100, (l + 20) / 100 )
    ],
    isHSLRange: true,
    lifetime: 220,
    velocity: (context) => {
      return new THREE.Vector3( -context.x, -context.y, -context.z )
        .normalize()
        .multiplyScalar( 50 )
    },
    rotationVelocity: (context) => {
      return new THREE.Vector3( context.x, context.y, context.z )
    },
    positionOffset: (context) => {
      return new THREE.Vector3( -context.x, -context.y, -context.z )
        .normalize()
        .multiplyScalar( 2 )
    },
    acceleration: (context) => {
      return new THREE.Vector3( context.x, context.y, context.z )
        .normalize()
        .multiplyScalar( 10 )
    },
    scale: () => {
      return Math.random() * 2 + .5;
    }
  }
});
particleSystem.start();

const transition = new TransitionPlayback(this, livingObject, {
  timeScale: 1,
  velocity: 80,
  acceleration: .5
});
transition.start();

transition.onFinished(_ => {
  particleSystem.stop();
});

this._transitions = this._transitions || [];
this._transitions.push( transition );

Game.getInstance().scene.add( particleSystem );
transition._particleSystem = particleSystem;

// update
if (this._transitions) {
  for (let i = 0; i < this._transitions.length; ++i) {
    let transition = this._transitions[ i ];
    transition.update( deltaTime );

    if (transition._particleSystem) {
      /**
       * @type {ParticleSystem}
       */
      let particleSystem = transition._particleSystem;
      particleSystem.position.copy(transition.currentPosition);
      particleSystem.update( deltaTime );

      if (transition.isFinished && particleSystem.isFinished) {
        particleSystem.release();
        Game.getInstance().scene.remove( particleSystem );
        this._transitions.splice( i, 1 );
        transition.dispose();
      }
    }
  }
}
