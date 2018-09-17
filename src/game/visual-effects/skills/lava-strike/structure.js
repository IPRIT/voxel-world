import { SmokeTailEffect } from "../components/common/smoke-tail/index";
import { ExplosionEffect } from "../components/common/explosion/index";
import { FireBallEffect } from "../components/lava-strike/fireball/index";
import { SkillStructure } from "../skill";

export class LavaStrikeStructure extends SkillStructure {

  constructor () {
    const structure = [{
      effect: FireBallEffect,
      children: [{
        effect: ExplosionEffect,
        effectOptions: {
          particleSystemOptions: {
            maxParticlesNumber: 20,
            particleOptions: {
              colorRange: [
                new THREE.Vector3( 5 / 360, 100 / 100, 3 / 100 ),
                new THREE.Vector3( 15 / 360, 100 / 100, 51 / 100 )
              ]
            }
          }
        }
      }]
    }, {
      effect: SmokeTailEffect,
      delayTimeout: 20
    }];

    super( structure );
  }
}
