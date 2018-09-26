import { revertObject } from "../utils";

export const LivingObjectType = {
  UNKNOWN: 0,
  PLAYER: 1,
  ANIMAL: 2,
  OFFENSIVE: 3,
  NPC: 4
};

export const LivingObjectTypeReverted = revertObject( LivingObjectType );
