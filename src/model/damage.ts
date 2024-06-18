import { logDamageFormula, logDebug, logTakeDamage, logTypeEffectiveness } from "../util/logger.js";
import { Random } from "../util/random.js";
import { BattleEvent } from "./battle-event.js";
import { Battle } from "./battle.js";
import { CombatContext } from "./combat.js";
import { Move } from "./move.js";
import { Player } from "./player.js";
import { isInAPinch, Pokemon } from "./pokemon.js";
import { getStageMultiplier, StageStat } from "./stages.js";
import { EXTREMELY_EFFECTIVE, getTypeEffectiveness, NORMALLY_EFFECTIVE, NOT_VERY_EFFECTIVE, NO_EFFECT, SUPER_EFFECTIVE, Type } from "./type.js";
import { isWeatherSuppressed, Weather } from "./weather.js";

export function calculateAttackDamage(ctx: CombatContext, random: Random, weather: Weather, previousCombatContext?: CombatContext): {
  damage: number,
  isCriticalHit: boolean,
  preventedCriticalHit?: boolean,
  effectiveness: number,
  message?: string
} {

  if (ctx.move.effects?.constantDamage) {
    return {
      damage: ctx.move.effects.constantDamage.damage,
      isCriticalHit: false,
      effectiveness: NORMALLY_EFFECTIVE
    }
  }

  if (ctx.move.effects?.oneHitKnockout) {
    if (ctx.defendingPokemon.level > ctx.attackingPokemon.level) {
      return {
        damage: 0,
        effectiveness: NORMALLY_EFFECTIVE,
        isCriticalHit: false,
        message: `It failed!`
      }
    } else if (ctx.defendingPokemon.ability?.preventOHKO) {
      return {
        damage: 0,
        isCriticalHit: false,
        effectiveness: NO_EFFECT
      }
    } else {
      return {
        damage: ctx.defendingPokemon.hp,
        isCriticalHit: false,
        effectiveness: NORMALLY_EFFECTIVE
      }
    }
  }

  if (ctx.move.effects?.halfRemainingHP) {
    return {
      damage: ctx.defendingPokemon.hp / 2,
      isCriticalHit: false,
      effectiveness: NORMALLY_EFFECTIVE
    }
  }

  if (ctx.move.effects?.doubleDamageTaken) {
    if (previousCombatContext && previousCombatContext.damageDone > 0 && 
      previousCombatContext.move.category === ctx.move.effects.doubleDamageTaken.categoryRestriction) {
      return {
        damage: previousCombatContext.damageDone * 2,
        effectiveness: NORMALLY_EFFECTIVE,
        isCriticalHit: false
      }
    } else {
      return {
        damage: 0,
        effectiveness: NORMALLY_EFFECTIVE,
        isCriticalHit: false,
        message: `It failed!`
      }
    }
  }

  const weatherSuppressed = isWeatherSuppressed(ctx.attackingPokemon, ctx.defendingPokemon)

  let power = ctx.move.power || 0

  if (ctx.move.effects?.powerBasedOnTargetSize) {
    power = ctx.move.effects?.powerBasedOnTargetSize.powers[ctx.defendingPokemon.size]
  }

  // Eruption
  if (ctx.move.effects?.powerMultipliedByHpPercent) {
    power = power * (ctx.attackingPokemon.hp / ctx.attackingPokemon.startingHP)
  }

  // Flail/Reversal
  if (ctx.move.effects?.powerHigherWhenHpLower) {
    const hpPercent = ctx.attackingPokemon.hp / ctx.attackingPokemon.startingHP
    if (hpPercent < .05) {
      power = 200
    } else if (hpPercent < .10) {
      power = 150
    } else if (hpPercent < .20) {
      power = 100
    } else if (hpPercent < .35) {
      power = 80
    } else if (hpPercent < .68) {
      power = 40
    } else {
      power = 20
    }
  }

  if (ctx.move.effects?.powerHigherWhenSpeedLower) {
    power = 35 * (ctx.defendingPokemon.speed / ctx.attackingPokemon.speed)
  }

  if (ctx.move.effects?.powerDoublesWhenTargeHpIsLow && ctx.defendingPokemon.hp < (ctx.defendingPokemon.startingHP / 2)) {
    power = power * 2
  }

  if (ctx.defendingPokemon.nonVolatileStatusCondition && 
    ctx.move.effects?.doublePowerIfTargetHasStatus && 
    (ctx.move.effects?.doublePowerIfTargetHasStatus.statuses === 'ANY' || ctx.move.effects?.doublePowerIfTargetHasStatus.statuses.includes(ctx.defendingPokemon.nonVolatileStatusCondition))) {
    power = power * 2
  }

  if (ctx.move.effects?.doublePowerIfDamagedFirst && previousCombatContext && previousCombatContext.damageDone > 0) {
    power = power * 2
  }

  if (power <= 60 && ctx.attackingPokemon.ability?.boostLowPowerMoves) {
    power *= 1.5
  }

  if (ctx.attackingPokemon.ability?.boostPunches && ctx.move.name.toLowerCase().includes("punch")) {
    power *= 1.2
  }

  if (ctx.attackingPokemon.attackTypeBuff === ctx.move.type) {
    power *= 1.5
  }

  if (ctx.attackingPokemon.ability?.pinchBoostForType?.type === ctx.move.type && isInAPinch(ctx.attackingPokemon)) {
    power *= 1.5
  }

  if (ctx.attackingPokemon.ability?.sheerForce) {
    power *= 1.3
  }
  
  let critChance = 1/24
  if (ctx.move.effects?.increaseCritical && !ctx.attackingPokemon.ability?.sheerForce) {
    critChance = ctx.move.effects?.increaseCritical.percent
  }

  let isCriticalHit = random.roll(critChance)
  let preventedCriticalHit = false
  if (isCriticalHit && ctx.defendingPokemon.ability?.preventRecievingCrit) {
    isCriticalHit = false
    preventedCriticalHit = true
  }
  const criticalMultiplier = isCriticalHit ? 1.75 : 1

  const isPhysicalAttack = ctx.move.category === 'PHYSICAL'
  let attack = isPhysicalAttack ? ctx.attackingPokemon.attack : ctx.attackingPokemon.specialAttack
  if (ctx.attackingPokemon.ability?.doubleAttack) {
    attack = attack * 2
  }
  if (ctx.move.effects?.useTargetAttack && isPhysicalAttack) {
    attack = ctx.defendingPokemon.attack
    logDebug(`Using target's attack stats: ${attack}`)
  }
  if (isPhysicalAttack && ctx.attackingPokemon.ability?.boostAttackWhenHavingStatus && ctx.attackingPokemon.nonVolatileStatusCondition != null) {
    logDebug('Boosted attack because attacker has status')
    attack *= 1.5
  }
  if (!isCriticalHit) {
    const attackStageState: StageStat = isPhysicalAttack ? 'attack' : 'specialAttack'
    attack = attack * getStageMultiplier(attackStageState, isPhysicalAttack ? ctx.attackingPokemon.stages.attack : ctx.attackingPokemon.stages.specialAttack)
  }
  let defense = isPhysicalAttack ? ctx.defendingPokemon.defense : ctx.defendingPokemon.specialDefense
  if (ctx.move.effects?.useDefenseForDamageCalc) {
    defense = ctx.defendingPokemon.defense
  }
  if (!weatherSuppressed && !isPhysicalAttack && weather === 'SANDSTORM' && ctx.defendingPokemon.types.includes('ROCK')) {
    defense *= 1.5
  }
  if (ctx.defendingPokemon.ability?.boostDefenseWhenHavingStatus && ctx.defendingPokemon.nonVolatileStatusCondition != null) {
    defense *= 1.5
  }
  if (!isCriticalHit) {
    const defenseStageState: StageStat = isPhysicalAttack ? 'defense' : 'specialDefense'
    defense = defense * getStageMultiplier(defenseStageState, isPhysicalAttack ? ctx.defendingPokemon.stages.defense : ctx.defendingPokemon.stages.specialDefense)
  }
  let attackDefenseMultiplier = attack / defense

  let typeEffectivenessMultiplier
  if (ctx.move.name === 'Struggle') {
    typeEffectivenessMultiplier = 1
  } else {
    typeEffectivenessMultiplier = getTypeEffectiveness(ctx.move.type, ctx.defendingPokemon.types)
    logTypeEffectiveness(ctx.move.type, ctx.defendingPokemon.types, typeEffectivenessMultiplier)
  }

  const randomMultiplier = random.randomFloatInRange(.85, 1)

  let burnMultiplier = 1
  if (!isCriticalHit) {
    burnMultiplier = ctx.attackingPokemon.nonVolatileStatusCondition === 'BURNED' && ctx.move.category === 'PHYSICAL' ? .5 : 1
  }

  const stabMultiplier = ctx.attackingPokemon.types.includes(ctx.move.type) ? 1.5 : 1

  let damage = power * attackDefenseMultiplier * typeEffectivenessMultiplier * criticalMultiplier * randomMultiplier * burnMultiplier * stabMultiplier
  logDamageFormula(damage, power, attackDefenseMultiplier, typeEffectivenessMultiplier, criticalMultiplier, randomMultiplier, burnMultiplier, stabMultiplier)

  if (!isCriticalHit) {
    if (isPhysicalAttack && ctx.defendingPlayer.remainingReflectTurns > 0) {
      logDebug(`Damage before Reflect: ${damage}`)
      damage /= 2
      logDebug(`Damage after Reflect: ${damage}`)
    }
    if (!isPhysicalAttack && ctx.defendingPlayer.remainingLightScreenTurns > 0) {
      logDebug(`Damage before Light Screen: ${damage}`)
      damage /= 2
      logDebug(`Damage after Light Screen: ${damage}`)
    }
  }

  if (ctx.defendingPokemon.ability?.reduceDamageWhenHpIsFull && ctx.defendingPokemon.hp === ctx.defendingPokemon.startingHP) {
    damage /= 2
  }

  const thickFatTypes: Type[] = ['FIRE', 'ICE']
  if (ctx.defendingPokemon.ability?.thickFat && thickFatTypes.includes(ctx.move.type)) {
    damage /= 2
  }

  damage = modifyDamageBasedOnWeather(ctx.attackingPokemon, damage, ctx.move, weather, weatherSuppressed)

  return { damage, isCriticalHit, preventedCriticalHit, effectiveness: typeEffectivenessMultiplier }
}

function modifyDamageBasedOnWeather(attacker: Pokemon, startingDamage: number, move: Move, weather: Weather, weatherSuppressed: boolean): number {
  let damage = startingDamage
  if (weatherSuppressed) {
    return damage
  }
  if (weather === 'HARSH_SUNLIGHT') {
    if (move.type === 'FIRE') {
      damage *= 1.5
    }
    if (move.type === 'WATER') {
      damage /= 2
    }
  }
  if (weather === 'RAIN') {
    if (move.type === 'WATER') {
      damage *= 1.5
    }
    if (move.type === 'FIRE') {
      damage /= 2
    }
  }
  const sandForcetypes = ['GROUND', 'ROCK', 'STEEL']
  if (weather === 'SANDSTORM' && attacker.ability?.sandForce && sandForcetypes.includes(move.type)) {
    damage *= 1.3
  }
  return damage
}

export function calculateConfusionHitDamage(pokemon: Pokemon, random: Random) {
  const power = 40
  const attack = pokemon.attack * getStageMultiplier('attack', pokemon.stages.attack)
  const defense = pokemon.defense * getStageMultiplier('defense', pokemon.stages.defense)
  let attackDefenseMultiplier = attack / defense
  const randomMultiplier = random.randomFloatInRange(.85, 1)
  return power * attackDefenseMultiplier * randomMultiplier
}

export function calculateSpikesDamagePercent(spikeLayerCount: number) {
  if (spikeLayerCount <= 1) {
    return 1/8
  } else if (spikeLayerCount == 2) {
    return 1/6
  } else {
    return 1/4
  }
}

export function calculateStealthRockDamagePercent(pokemon: Pokemon): number {
  const eff = getTypeEffectiveness('ROCK', pokemon.types)
  if (eff >= EXTREMELY_EFFECTIVE) {
    return 1/2
  } else if (eff >= SUPER_EFFECTIVE) {
    return 1/4
  } else if (eff >= NORMALLY_EFFECTIVE) {
    return 1/8
  } else if (eff >= NOT_VERY_EFFECTIVE) {
    return 1/16
  } else {
    return 1/32
  }
}

export function calculateBadlyPoisonedDamage(pokemon: Pokemon) {
  const mulitplier = pokemon.badlyPoisonedTurns > 15 ? 15 : pokemon.badlyPoisonedTurns
  return mulitplier * (1/16) * pokemon.startingHP
}

// Returns true if pokemon faints
export function takeDamage(damagedPlayer: Player, damagedPokemon: Pokemon, damage: number, 
  battleEvents: BattleEvent[], directAttack: boolean = false, playSound: boolean = true): boolean {
  if (!directAttack && damagedPokemon.ability?.preventIndirectDamage) {
    battleEvents.push({
      type: 'DISPLAY_MESSAGE',
      message: `${damagedPokemon.name} was protected by ${damagedPokemon.ability.name}!`,
      referencedPlayerName: damagedPlayer.name,
    })
    return false
  }
  damage = roundDamage(damage)
  let oldHP = damagedPokemon.hp
  let newHP = damagedPokemon.hp - damage
  logTakeDamage(damagedPlayer.name, damagedPokemon.name, damage, newHP, damagedPokemon.startingHP)
  const wasInAPinchBefore = isInAPinch(damagedPokemon)
  damagedPokemon.hp = newHP
  battleEvents.push({
    type: 'HEALTH_CHANGE',
    playerName: damagedPlayer.name,
    newHP: newHP,
    oldHP: oldHP,
    totalHP: damagedPokemon.startingHP,
    directAttack: directAttack,
    playSound: playSound
  })
  if (damagedPokemon.ability?.pinchBoostForType && isInAPinch(damagedPokemon) && !wasInAPinchBefore) {
    battleEvents.push({
      type: 'DISPLAY_MESSAGE',
      message: `${damagedPokemon.name} is in a pinch!`,
      referencedPlayerName: damagedPlayer.name
    })
    battleEvents.push({
      type: 'DISPLAY_MESSAGE',
      message: `Its ${damagedPokemon.ability.pinchBoostForType.type.toUpperCase()} attacks are powered up!`
    })
  }
  if (damagedPokemon.hp <= 0) {
    return true
  } else {
    return false
  }
}


/*
  * Rounds up to nearest integer but minimum of 1
  */
export function roundDamage(damage: number) {
  return Math.floor(damage) + 1
}