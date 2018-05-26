/**
 * @returns {{particleSystemOptions: {timeScale: number, spawnRate: number, maxParticlesNumber: number, local: number, particleOptions: {generateContext: (function(): {x: number, y: number, z: number}), colorRange: *[], isHSLRange: boolean, lifetime: number, velocity: (function(*): *), rotationVelocity: (function(*): THREE.Vector3), positionOffset: (function(*): *), acceleration: (function(*): *), scale: (function(): number)}}, transitionOptions: {timeScale: number, velocity: number, acceleration: number}}}
 */
export function optionsFactory () {

  // HSL color ranges
  const h1 = 21;
  const h2 = 43;

  const s1 = 100;
  const s2 = 100;

  const l1 = 20;
  const l2 = 58;

  return {
    particleSystemOptions: {
      timeScale: .5,
      spawnRate: .1,
      maxParticlesNumber: 50,
      local: true,
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
    },
    transitionOptions: {
      timeScale: 1,
      velocity: 80,
      acceleration: .5
    }
  };
}

export const options = optionsFactory();
