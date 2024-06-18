import { MoveDefinition, MovePriority } from "./move-definition.js";
import { getMoveDescription } from "./move-description.js";

export type Move = MoveDefinition & {
  priority: MovePriority
  pp: number
  accuracy: number
}

export function buildMove(moveDefinition: MoveDefinition) {
  return Object.assign({
    pp: moveDefinition.startingPP,
    priority: moveDefinition.priority ? moveDefinition.priority : 0,
    description: getMoveDescription(moveDefinition),
    accuracy: moveDefinition.accuracy ? moveDefinition.accuracy : 1
  }, moveDefinition)
}

export function getAccuracyDisplayValue(move: Move) {
  return Math.floor(move.accuracy * 100)
}

export function getSoundEffect(move?: MoveDefinition): string | null {
  if (!move) {
    return null
  } else if (move.soundEffect) {
    return move.soundEffect
  } else if (move.category !== 'STATUS') {
    return getDamagingMoveSoundEffect(move)
  } else {
    return null
  }
} 

function getDamagingMoveSoundEffect(move: MoveDefinition) {
  if (move.type === 'FIRE') {
    return 'attack_fire.mp3'
  } else if (move.type === 'BUG') {
    return 'attack_bug.mp3'
  } else if (move.type === 'ELECTRIC') {
    return 'attack_electric.mp3'
  } else if (move.type === 'GROUND') {
    return 'attack_ground.mp3'
  } else if (move.type === 'ROCK') {
    return 'attack_rock.mp3'
  } else if (move.type === 'WATER') {
    return 'attack_water.mp3'
  } else if (move.type === 'PSYCHIC' && move.category === 'SPECIAL') {
    return 'attack_psychic_special.mp3'
  } else if (move.type === 'ICE') {
    return 'attack_ice.mp3'
  } else if (move.type === 'GHOST') {
    return 'attack_ghost.mp3'
  } else if (move.type === 'GRASS') {
    return 'attack_grass_long.mp3'
  } else {
    return 'attack_generic.mp3'
  }
}

export function makesContact(move: Move) {
  if (move.category === 'PHYSICAL' && move.makesContact !== false) {
    return true
  } else {
    return false
  }
}