import { EffectComposer } from "../../effect/index";
import { SkillStructure } from "./skill-structure";
import { SkillEvents } from "./skill-events";
import { EffectComposerEvents } from "../../effect";

export class Skill extends EffectComposer {

  /**
   * @param {SkillStructure|Array<Object>} structure
   */
  constructor (structure) {
    super( structure );

    if (structure instanceof SkillStructure) {
      this._proxyEvents( structure, SkillEvents );
    }
  }

  /**
   * @param {SkillStructure} structure
   * @param {Object} events
   * @private
   */
  _proxyEvents (structure, events) {
    for (const eventName of Object.values( events )) {
      structure.on( eventName, (...args) => this.emit( eventName, ...args ) );
    }

    this.on( EffectComposerEvents.FINISHED, _ => structure.dispose() );
  }
}
