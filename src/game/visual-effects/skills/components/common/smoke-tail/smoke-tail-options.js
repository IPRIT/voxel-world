export function optionsFactory () {

  // HSL color ranges
  const h1 = 181;
  const h2 = 185;

  const s1 = 65;
  const s2 = 93;

  const l1 = 90;
  const l2 = 98;

  return {
    duration: 0,
    timeScale: 1,
    attachToTarget: false,
    particleSystemOptions: {
      attachParticlesToLocal: false,
      timeScale: .3,
      spawnRate: .1,
      maxParticlesNumber: 40,
      particleOptions: {
        generateContext: () => {
          return {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            z: Math.random() * 2 - 1
          };
        },
        colorRange: [
          new THREE.Vector3( h1 / 360, s1 / 100, l1 / 100 ),
          new THREE.Vector3( h2 / 360, s2 / 100, l2 / 100 )
        ],
        isHSLRange: true,
        lifetime: 120,
        velocity: (context) => {
          return new THREE.Vector3( 0, 35 + 50 * context.y, 0 );
        },
        rotationVelocity: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z );
        },
        positionOffset: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z )
            .multiplyScalar( 2 );
        },
        acceleration: (context) => {
          return new THREE.Vector3( 0, 4 * Math.abs( context.y ) + 10, 0 );
        },
        scale: () => {
          return Math.random() * 1.5 + 1;
        },
        opacity: 1,
        opacityVelocity: -.05
      }
    },
    transitionOptions: {
      timeScale: 1,
      velocity: 120,
      acceleration: .5
    }
  };
}

export const options = optionsFactory();
