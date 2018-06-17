export function optionsFactory () {

  // HSL color ranges
  const h1 = 0;
  const h2 = 0;

  const s1 = 0;
  const s2 = 0;

  const l1 = 100;
  const l2 = 100;

  return {
    duration: 750,
    timeScale: 1,
    attachToTarget: false,
    particleSystemOptions: {
      timeScale: 1,
      spawnRate: .6,
      maxParticlesNumber: 30,
      attachParticlesToLocal: false,
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
        lifetime: 1000,
        velocity: (context) => {
          return new THREE.Vector3( context.x, 0, context.z )
            .normalize()
            .multiplyScalar( 100 );
        },
        rotationVelocity: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z )
            .multiplyScalar( .2 );
        },
        positionOffset: (context) => {
          return new THREE.Vector3( context.x, .5, context.z )
            .multiplyScalar( 1 );
        },
        acceleration: (context) => {
          return new THREE.Vector3( context.x, 0, context.z )
            .normalize()
            .multiplyScalar( -1.5 );
        },
        scale: () => {
          return Math.random() * 1.5 + .5;
        },
        opacityVelocity: -.01
      }
    }
  };
}

export const options = optionsFactory();
