/**
 * @returns {{particleSystemOptions: {timeScale: number, spawnRate: number, maxParticlesNumber: number, particleOptions: {generateContext: (function(): {x: number, y: number, z: number}), colorRange: *[], isHSLRange: boolean, lifetime: number, velocity: (function(*): *), rotationVelocity: (function(*): THREE.Vector3), positionOffset: (function(*): *), acceleration: (function(*): *), scale: (function(): number)}}}}
 */
export function optionsFactory () {

  // HSL color ranges
  const h1 = 181;
  const h2 = 185;

  const s1 = 65;
  const s2 = 93;

  const l1 = 47;
  const l2 = 98;

  return {
    duration: 0,
    timeScale: 1,
    attachToTarget: false,
    particleSystemOptions: {
      timeScale: .6,
      spawnRate: .15,
      maxParticlesNumber: 70,
      attachParticlesToLocal: true,
      rotationVelocity: new THREE.Vector3(0, .2, 0),
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
        lifetime: 150,
        velocity: (context) => {
          return new THREE.Vector3( context.x, 0, context.z )
            .normalize()
            .setY( context.y * 100 )
        },
        rotationVelocity: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z )
        },
        positionOffset: (context) => {
          return new THREE.Vector3( -context.x, - context.y / 2, -context.z )
            .multiplyScalar( 5 )
        },
        acceleration: (context) => {
          return new THREE.Vector3( 0, context.y, 0 );
        },
        scale: () => {
          return Math.random() * 2 + .5;
        }
      }
    },
    transitionOptions: {
      timeScale: 1,
      velocity: 80,
      acceleration: .5
    }
  };
}

export const options = optionsFactory();
