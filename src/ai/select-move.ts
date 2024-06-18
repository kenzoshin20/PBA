import { MoveCategory } from "../model/move-category.js";
import { Move } from "../model/move.js";
import { allMovesUsed, isRaised, Pokemon } from "../model/pokemon.js";
import { getStageMultiplier, StageStat } from "../model/stages.js";
import { NonVolatileStatusCondition } from "../model/status-conditions.js";
import { getTypeEffectiveness } from "../model/type.js";
import { logAI } from "../util/logger.js";
import { Random } from "../util/random.js";
import { ActionSelectorContext } from "./action-selector-context.js";
import { AIOptions, optionsToString, selectAIOption } from "./ai-options.js";

const random = new Random()

export function selectMove(ctx: ActionSelectorContext): number | 'Struggle' {
    if (useStruggle(ctx)) {
        return 'Struggle'
    }

    const situationalOptions = getSituationalMoveOptions(ctx)
    if (situationalOptions.length) {
        logAI('Selecting SITUATIONAL move from ' + optionsToString(situationalOptions))
        const selected: number = selectAIOption(situationalOptions, random)
        logAI('Selected: ' + selected)
        return selected
    }

    const statusOptions = getStatusMoveOptions(ctx)
    if (statusOptions.length && random.roll(.8) && ctx.attackingPokemon.name !== 'Wobbuffet') {
        logAI('Selecting STATUS move from ' + optionsToString(statusOptions))
        const selected: number = selectAIOption(statusOptions, random)
        logAI('Selected: ' + selected)
        return selected
    }

    const options = getDamagingMoveOptions(ctx)
    if (options.length) {
        logAI('Selecting DAMAGING move from ' + optionsToString(options))
        const selected: number = selectAIOption(options, random)
        logAI('Selected: ' + selected)
        return selected
    }

    const secondPassStatusOptions = getSecondPassStatusMoveOptions(ctx)
    if (secondPassStatusOptions.length) {
        logAI('Selecting 2nd pass STATUS move from ' + optionsToString(secondPassStatusOptions))
        const selected: number = selectAIOption(secondPassStatusOptions, random)
        logAI('Selected: ' + selected)
        return selected
    }
    
    const allValidMoveOptions = getAllValidMoveOptions(ctx)
    logAI('Selecting ANY VALID move from ' + optionsToString(allValidMoveOptions))
    const selected: number = selectAIOption(allValidMoveOptions, random)
    logAI('Selected: ' + selected)
    return selected
}

function useStruggle(ctx: ActionSelectorContext): boolean {
    return ctx.attackingPokemon.moves.find(move => move.pp > 0) == undefined
}

function getSituationalMoveOptions(ctx: ActionSelectorContext): AIOptions<number> {
    const options = ctx.attackingPokemon.moves.map((move, i) => {
        if (move.pp <= 0 || move.category !== 'STATUS') {
            return
        }
        if (immuneToAttack(move, ctx.defendingPokemon) && move.category !== 'STATUS') {
            return
        }
        let weight = 0
        if (allMovesUsed(ctx.attackingPokemon) && move.effects?.lastResort) {
            logAI('Adding Last resort to situational moves')
            weight += 10
        }
        if (move.effects?.failIfTargetDoesntHaveStatus && move.effects?.failIfTargetDoesntHaveStatus?.statuses.includes(ctx.defendingPokemon?.nonVolatileStatusCondition as NonVolatileStatusCondition)) {
            logAI('Adding failIfTargetDoesntHaveStatus to situational moves')
            // Dream Eater
            weight += 10
        }
        if (move.effects?.failIfUserDoesntHaveStatus && move.effects.failIfUserDoesntHaveStatus?.statuses.includes(ctx.attackingPokemon.nonVolatileStatusCondition as NonVolatileStatusCondition)) {
            logAI('Adding failIfUserDoesntHaveStatus to situational moves')
            // Snore
            weight += 100
        }
        if (move.effects?.breakScreens && (ctx.defendingPlayer.remainingLightScreenTurns || ctx.defendingPlayer.remainingReflectTurns)) {
            // Brick Break
            weight += 80
        }
        if (weight === 0) {
            return
        }
        if (immuneToAttack(move, ctx.defendingPokemon)) {
            return
        }
        return {
            option: i,
            weight: weight,
            desc: move.name
        }
    })
    const validOptions: AIOptions<number> = []
    options.forEach(option => {
        if (option != null) {
            validOptions.push(option)
        }
    })
    return validOptions
}

export function getStatusMoveOptions(ctx: ActionSelectorContext): AIOptions<number> {

    logAI("defendingPokemon.activeTurnCount " + ctx.defendingPokemon.activeTurnCount)
    logAI("attackingPokemon.activeTurnCount " + ctx.attackingPokemon.activeTurnCount)

    const options = ctx.attackingPokemon.moves.map((move, i) => {
        if (move.pp <= 0 || move.category !== 'STATUS') {
            return
        }

        let weight = 0

        const effects = move.effects
        const attackingPokemon = ctx.attackingPokemon
        const attackingPlayer = ctx.attackingPlayer
        const defendingPokemon = ctx.defendingPokemon
        const defendingPlayer = ctx.defendingPlayer

        if (defendingPlayer.hasStealthRock && effects?.forceTargetSwitch) {
            weight += 500
        }
        if (defendingPlayer.spikeLayerCount > 1 && effects?.forceTargetSwitch) {
            weight += 500
        }
        if (defendingPlayer.spikeLayerCount > 2 && effects?.forceTargetSwitch) {
            weight += 1_000
        } 

        if (effects?.healUser && random.roll(.9)) {
            if (defendingPokemon.nonVolatileStatusCondition === 'BADLY POISONED' && attackingPokemon.hp < (attackingPokemon.startingHP * .6)) {
                weight += 10
            }
            if (attackingPokemon.hp < (attackingPokemon.startingHP * .4)) {
                if (attackingPokemon.stages.defense > 0 || attackingPokemon.stages.specialDefense > 0) {
                    weight += 1_000
                } else {
                    weight += 10
                }
            }
        }

        if (move.effects?.protectUser || move.effects?.kingsShield) {
            if (attackingPokemon.consecutiveProtectCount == 1 && random.roll(.8)) {
                return
            }
            if (attackingPokemon.consecutiveProtectCount > 1) {
                return
            }
            if (defendingPokemon.nonVolatileStatusCondition === 'BADLY POISONED') {
                weight += 500
            }
            if (defendingPokemon.nonVolatileStatusCondition && defendingPokemon.nonVolatileStatusCondition === 'POISONED') {
                weight += 50
            }
            if (defendingPokemon.hasLeechSeed) {
                weight += 50
            }
            if (defendingPokemon.confused) {
                weight += 50
            }
        }

        const isFirstEncounter = defendingPokemon.activeTurnCount <= 1 || attackingPokemon.activeTurnCount <= 1
        if (isFirstEncounter) {

            if (effects?.modifyStages) {
                const mod = effects.modifyStages.modifiers[0]
                if (mod.userOrTarget === 'TARGET') {
                    if (defendingPokemon.stages[mod.stageStat] > -1) {
                        weight += 10
                    }
                } else {
                    if (attackingPokemon.stages[mod.stageStat] < 2) {
                        weight += 20
                    }
                }
            }

            if (
                (effects?.applyNonVolatileStatusConditions && !defendingPokemon.nonVolatileStatusCondition && !immuneToStatus(effects?.applyNonVolatileStatusConditions.conditions, defendingPokemon)) ||
                (effects?.applyConfusion && defendingPokemon.remainingConfusedTurns <= 0) ||
                (effects?.setLeechSeed && !defendingPokemon.types.includes('GRASS')) ||
                effects?.randomMove ||
                effects?.maximizeAttack
            ) {
                // Status moves that generally are good on first encounter no matter battle state
                weight += 10
            }

        }

        const isEarlyGame = ctx.battle.turnCount < 5
        if (isEarlyGame) {
            if (!ctx.defendingPlayer.hasStealthRock && effects?.setStealthRock) {
                weight += 150
            }
            if (!ctx.defendingPlayer.hasStickyWeb && effects?.setStickyWeb) {
                weight += 100
            }
            if (ctx.defendingPlayer.spikeLayerCount < 3 && effects?.setSpikes) {
                weight += 100
            }
            if (ctx.defendingPlayer.toxicSpikeLayerCount < 2 && effects?.setToxicSpikes) {
                weight += 100
            }
            if (effects?.applyWeather && ctx.battle.weather === 'CLEAR_SKIES') {
                weight += 50
            }
        }

        const isEarlyOrMidGame = ctx.battle.turnCount < 10
        if (isEarlyOrMidGame) {
            if (ctx.attackingPlayer.remainingLightScreenTurns < 1 && effects?.lightScreen && getDedicatedCategory(ctx.defendingPokemon) === 'SPECIAL') {
                weight += 50
            }
            if (ctx.attackingPlayer.remainingReflectTurns < 1 && effects?.reflect && getDedicatedCategory(ctx.defendingPokemon) === 'PHYSICAL') {
                weight += 50
            }
        }

        if (move.name === 'Memento' && attackingPokemon.hp > (attackingPokemon.startingHP * .3)) {
            logAI('Skipping Memento because user has plenty of HP')
            return
        }
        if (move.name === 'Shell Smash' && attackingPokemon.stages.attack > 1) {
            logAI('Skipping Shell Smash because attack is already buffed')
            return
        }

        if (ctx.defendingPokemon.previousMoveIndex == null) {
            if (move.effects?.copyTargetLastMove || move.effects?.targetLastMoveLosesPP || move.effects?.replaceUserTypesBasedOnTargetLastMove) {
                return
            }
        }
        

        if (weight > 0) {
            return {
                option: i,
                weight: weight,
                desc: move.name
              }
        }
    })

    const validOptions: AIOptions<number> = []
    options.forEach(option => {
        if (option != null) {
            validOptions.push(option)
        }
    })
    return validOptions
}

export function getSecondPassStatusMoveOptions(ctx: ActionSelectorContext): AIOptions<number> {

    const options = ctx.attackingPokemon.moves.map((move, i) => {
        if (move.pp <= 0 || move.category !== 'STATUS') {
            return
        }

        let weight = 0

        const effects = move.effects
        const attackingPokemon = ctx.attackingPokemon
        const attackingPlayer = ctx.attackingPlayer
        const defendingPokemon = ctx.defendingPokemon
        const defendingPlayer = ctx.defendingPlayer

        if (effects?.applyConfusion) {
            weight += 10
        }
        if (effects?.applyNonVolatileStatusConditions) {
            weight += 10
        }
        if (effects?.healUser && ctx.attackingPokemon.hp < ctx.attackingPokemon.startingHP && random.roll(.7)) {
            weight += 10
        }
        if (effects?.modifyStages) {
            weight += 10
        }
        if (effects?.randomMove) {
            weight += 10
        }

        if (weight > 0) {
            return {
                option: i,
                weight: weight,
                desc: move.name
              }
        }
    })

    const validOptions: AIOptions<number> = []
    options.forEach(option => {
        if (option != null) {
            validOptions.push(option)
        }
    })
    return validOptions
}

export function getDamagingMoveOptions(ctx: ActionSelectorContext): AIOptions<number> {
  let highestPower = 0
  let highestPowerMoveIndex = 0

  const options = ctx.attackingPokemon.moves.map((move, i) => {

    if (move.pp <= 0 || move.category === 'STATUS') {
      return
    }

    if (immuneToAttack(move, ctx.defendingPokemon)) {
        return
    }

    if (move.effects?.failIfTargetDoesntHaveStatus && !move.effects?.failIfTargetDoesntHaveStatus?.statuses.includes(ctx.defendingPokemon.nonVolatileStatusCondition as NonVolatileStatusCondition)) {
        return
    }

    let weight = 0

    const effectiveness = getTypeEffectiveness(move.type, ctx.defendingPokemon.types)

    const powerWeight = getPowerWeight(ctx, move)

    let knockOutWeight = 0
    if (move.power != null && ctx.defendingPokemon.hp <= powerWeight) {
        knockOutWeight = 500

        if (move.priority > 0) {
            knockOutWeight += 1_000
        }
    }

    weight = weight + powerWeight + knockOutWeight

    if (powerWeight > highestPower && !move.effects?.lastResort) {
        highestPower = powerWeight
        highestPowerMoveIndex = i
    }

    if (move.effects?.halfRemainingHP && ctx.defendingPokemon.hp > (ctx.defendingPokemon.startingHP * .95)) {
      weight += 1_000
    }

    if (move.effects?.lastResort) {
      if (!allMovesUsed(ctx.attackingPokemon)) {
        weight = 0
      } else {
        weight += 2_000
      }
    }

    if (
        move.effects?.doubleDamageTaken && 
        getPrimaryCategory(ctx.defendingPokemon) === move.effects.doubleDamageTaken.categoryRestriction
    ) {
        logAI('doubleDamageTaken boost')
        logAI(move.name + ', ' + move.effects.doubleDamageTaken.categoryRestriction)
        weight += 10
        if (ctx.attackingPokemon.name === 'Wobbuffet') {
            weight += 100_000
        }
    }

    if (effectiveness === 0) {
      return
    }

    if (move.effects?.selfDestruct) {
        if (ctx.attackingPlayer.team.filter(p => p.hp > 0).length <= 1) {
            logAI('Skipping selfDestruct move because this is the last pokemon left')
            return
        }
        if (ctx.attackingPokemon.hp > (.5 * ctx.attackingPokemon.startingHP)) {
            logAI('De-prioritizing selfDestruct because hp is greater than .5')
            weight = 1
        }
    }

    logAI(`Returning ${move.name} with weight: ${weight}`)
    return {
      option: i,
      weight: weight,
      desc: move.name
    }
  })

  // Give extra boost to move with highest power
  const highestPowerMove = options[highestPowerMoveIndex]
  if (highestPowerMove != null && ctx.attackingPokemon.name !== 'Wobbuffet') {
    logAI('highestPowerMove boost to ' + highestPowerMove.desc)
    highestPowerMove.weight += 1_000
  }

  const validOptions: AIOptions<number> = []
  options.forEach(option => {
    if (option != null) {
      validOptions.push(option)
    }
  })
  return validOptions
}

export function getAllValidMoveOptions(ctx: ActionSelectorContext): AIOptions<number> {
    const options = ctx.attackingPokemon.moves.map((move, i) => {
        if (move.pp > 0) {
            return {
                option: i,
                weight: 1,
                desc: move.name
            }
        }
    })
    const validOptions: AIOptions<number> = []
    options.forEach(option => {
        if (option != null) {
            validOptions.push(option)
        }
    })
    return validOptions
}

function immuneToStatus(
    conditions: {
        type: NonVolatileStatusCondition
        chance: number
    }[], 
    defendingPokemon: Pokemon
) {
    for (const condition of conditions) {
        const type = condition.type
        if (['POISON', 'BADLY POISONED'].includes(type)) {
            if (defendingPokemon.types.includes('POISON') || defendingPokemon.types.includes('STEEL')) {
                return true
            }
        }
        if (type === 'PARALYZED') {
            if (defendingPokemon.types.includes('ELECTRIC') || defendingPokemon.types.includes('GROUND')) {
                return true
            }
        }
        if (type === 'BURNED') {
            if (defendingPokemon.types.includes('FIRE')) {
                return true
            }
        }
        if (defendingPokemon.ability?.preventStatus?.statuses.includes(type) || defendingPokemon.ability?.preventStatus?.statuses === 'ANY') {
            return true
        }
     }
}

function getPowerWeight(ctx: ActionSelectorContext, move: Move): number {
    let power = move.power
  
    if (!power) {
      // For moves that have special effects to derive power
      power = 40
    }

    if (move.effects?.powerMultipliedByHpPercent && ctx.attackingPokemon.hp < ctx.attackingPokemon.startingHP) {
        power = 30
    }

    if (move.effects?.powerBasedOnTargetSize) {
        power = move.effects.powerBasedOnTargetSize.powers[ctx.defendingPokemon.size]
    }

    if (move.accuracy) {
        const accuracyMultiplier = move.accuracy < .9 ? move.accuracy : 1
        power = power * accuracyMultiplier
    }
  
    const isPhysicalAttack = move.category === 'PHYSICAL'
    let attack = isPhysicalAttack ? ctx.attackingPokemon.attack : ctx.attackingPokemon.specialAttack
    if (move.effects?.useTargetAttack && isPhysicalAttack) {
        attack = ctx.defendingPokemon.attack
    }
    const attackStageState: StageStat = isPhysicalAttack ? 'attack' : 'specialAttack'
    attack = attack * getStageMultiplier(attackStageState, isPhysicalAttack ? ctx.attackingPokemon.stages.attack : ctx.attackingPokemon.stages.specialAttack)
    let defense = isPhysicalAttack ? ctx.defendingPokemon.defense : ctx.defendingPokemon.specialDefense
    const defenseStageState: StageStat = isPhysicalAttack ? 'defense' : 'specialDefense'
    defense = defense * getStageMultiplier(defenseStageState, isPhysicalAttack ? ctx.defendingPokemon.stages.defense : ctx.defendingPokemon.stages.specialDefense)
    let attackDefenseMultiplier = attack / defense
  
    const typeEffectivenessMultiplier = getTypeEffectiveness(move.type, ctx.defendingPokemon.types)
  
    const stabMultiplier = ctx.attackingPokemon.types.includes(move.type) ? 1.25 : 1
  
    return Math.floor(power * attackDefenseMultiplier * typeEffectivenessMultiplier * stabMultiplier)
  }

  function immuneToAttack(move: Move, defendingPokemon: Pokemon): boolean {
    if (isRaised(defendingPokemon) && move.type === 'GROUND') {
        return true
    } 
    if (defendingPokemon.ability?.wonderGuard && !['FIRE', 'FLYING', 'ROCK', 'GHOST', 'DARK'].includes(move.type)) {
        return true
    }
    return false
  }

  function getPrimaryCategory(pokemon: Pokemon): MoveCategory {
    const counts: Record<MoveCategory, number> = {
        'PHYSICAL': 0,
        'SPECIAL': 0,
        'STATUS': 0
    }
    pokemon.moves.map(move => {
        counts[move.category] = counts[move.category] + 1
    })
    let highest = 0
    let highestCat: MoveCategory = 'PHYSICAL'
    for (const [cat, count] of Object.entries(counts)) {
        if (cat !== 'STATUS' && count >= highest) {
            highest = count
            highestCat = cat as MoveCategory
        }
    }
    logAI('getPrimaryCategory returning ' + highestCat)
    return highestCat
  }

  // Only returns non-null if the pokemon is only special or only physical
  function getDedicatedCategory(pokemon: Pokemon): MoveCategory | null {
    const counts: Record<MoveCategory, number> = {
        'PHYSICAL': 0,
        'SPECIAL': 0,
        'STATUS': 0
    }
    pokemon.moves.map(move => {
        counts[move.category] = counts[move.category] + 1
    })
    let cat: MoveCategory | null = null
    if (counts['PHYSICAL'] > 0 && counts['SPECIAL'] === 0) {
        cat = 'PHYSICAL'
    } else if (counts['SPECIAL'] > 0 && counts['PHYSICAL'] === 0) {
        cat = 'SPECIAL'
    }
    logAI('getDedicatedCategory returning ' + cat)
    return cat
  }