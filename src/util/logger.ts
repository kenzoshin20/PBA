import { Player } from "../model/player"
import { Pokemon } from "../model/pokemon"
import { Type } from "../model/type"

let config = {
  enabled: true,
  info: true,
  debug: false,
  ai: true,
  dao: false,
  newEvents: false,
  moveSuccessFormula: false,
  multiHitChances: false,
  typeEffectiveness: false,
  damageFormula: false,
  takeDamage: false
}

export function configureLogger(values: any) {
  config = {...config, ...values}
  return config
}

export function logMoveSuccessFormula(accuracy: number, evasion: number, chance: number) {
  if (config.enabled && config.moveSuccessFormula) {
    console.log(`Move chance of success: ${accuracy} / ${evasion} = ${chance}`)
  }
}

export function logMultiHitChances(options: number[], chances: number[]) {
  if (config.enabled && config.multiHitChances) {
    const optionsString = options.join(',')
    const chancesString = chances.join(',')
    console.log(`Multi-hit options: ${optionsString} and chances: ${chancesString}`)
  }
}

export function logDamageFormula(damage: number, power: number, attackDefenseMultiplier: number, typeEffectivenessMultiplier: number, criticalMultiplier: number,
  randomMultiplier: number, burnMultiplier: number, stabMultiplier: number) {
  if (config.enabled && config.damageFormula) {
    console.log(`Damage formula: ${power} * ${attackDefenseMultiplier} * ${typeEffectivenessMultiplier} * ${criticalMultiplier} * ${randomMultiplier} * ${burnMultiplier} * ${stabMultiplier} = ${damage}`)
  }
}

export function logTypeEffectiveness(moveType: Type, defenderTypes: Type[], typeEffectivenessMultiplier: number) {
  if (config.enabled && config.typeEffectiveness) {
    console.log(`Move=${moveType}, Defender=${defenderTypes.join()}, Effectiveness=${typeEffectivenessMultiplier}`);
  }
  
}
export function logHealthOnSwitch(pokemon: Pokemon, player: Player) {
  if (config.enabled && config.takeDamage) {
    const percent = Math.floor((pokemon.hp / pokemon.startingHP) * 100)
    console.log(`${player.name} deployed ${pokemon.name}. ${pokemon.hp} HP remaining (${percent}%)`)
  }
}

export function logTakeDamage(playerName: string, pokemonName: string, damage: number, newHP: number, totalHP: number) {
  if (config.enabled && config.takeDamage) {
    const percent = Math.floor((damage / totalHP) * 100)
    console.log(`${playerName}'s ${pokemonName} took ${damage} damage (${percent}%). ${newHP} HP remaining`)
  }
}

export function logDAO(...message: any) {
  if (config.enabled && config.info) {
    console.log(...message)
  }
}

export function logNewEvents(...message: any) {
  if (config.enabled && config.newEvents) {
    console.log(...message)
  }
}

export function logInfo(...message: any) {
  if (config.enabled && config.info) {
    console.log(...message)
  }
}

export function logDebug(...message: any) {
  if (config.enabled && config.debug) {
    console.log(...message)
  }
}

export function logError(message: any) {
  if (config.enabled) {
    console.log(message)
  }
}

export function logAI(...message: any) {
  if (config.enabled && config.ai) {
    console.log('AI: ', ...message)
  }
}