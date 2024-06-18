import { abilities } from "../data/ability-data.js";
import { moves } from "../data/move-data.js";
import { logDebug, logMoveSuccessFormula, logMultiHitChances } from "../util/logger.js";
import { Random } from "../util/random.js";
import { Battle } from "./battle.js";
import { calculateAttackDamage, calculateBadlyPoisonedDamage, calculateConfusionHitDamage, roundDamage, takeDamage } from "./damage.js";
import { heal } from "./heal.js";
import { buildMove, getSoundEffect, makesContact, Move } from "./move.js";
import { Player } from "./player.js";
import { allMovesUsed, isAlive, isRaised, modifyStage, Pokemon } from "./pokemon.js";
import { handleStageChange } from "./stage-change.js";
import { getStageChangeMsg, getStageMultiplier, StageStat, stageStatDisplayTexts } from "./stages.js";
import { NonVolatileStatusCondition } from "./status-conditions.js";
import { handleForceSwitch } from "./switch-pokemon.js";
import { transformIntoBladeForm, transform, transformIntoShieldForm } from "./transform.js";
import { EXTREMELY_EFFECTIVE, getEffectivenessMapping, getTypeEffectiveness, NORMALLY_EFFECTIVE, NO_EFFECT, SUPER_EFFECTIVE, Type } from "./type.js";
import { isWeatherSuppressed, Weather } from "./weather.js";

export interface CombatContext {
  readonly moveIndex: number
  readonly originalMove: Move
  move: Move
  readonly attackingPlayer: Player
  readonly attackingPokemon: Pokemon
  readonly defendingPlayer: Player
  readonly defendingPokemonPendingMove: Move | null
  defendingPokemon: Pokemon
  damageDone: number
  noEffect: boolean 
}

export class Combat {

  random: Random = new Random()

  battle: Battle
  previousCombatContext?: CombatContext

  constructor(battle: Battle) {
    this.battle = battle
  }

  useMove(attackingPlayer: Player, moveIndex: number, defendingPokemonPendingMove: Move | null, struggle: boolean = false) {
    
    const attackingPokemon = attackingPlayer.team[attackingPlayer.activePokemonIndex]
    const defendingPlayer = this.battle.getOtherPlayer(attackingPlayer)
    const defendingPokemon = defendingPlayer.team[defendingPlayer.activePokemonIndex]
    const originalMove = attackingPokemon.moves[moveIndex]

    let move = originalMove
    if (struggle) {
      move = buildMove(moves['Struggle'])
    }
    if (!move.effects?.protectUser && !move.effects?.kingsShield) {
      logDebug(`Resetting consecutiveProtectCount`)
      attackingPokemon.consecutiveProtectCount = 0
    }
    if (move.effects?.copyTargetLastMove) {
      if (defendingPokemon.previousMoveIndex != null) {
        const targetLastMove = defendingPokemon.moves[defendingPokemon.previousMoveIndex]
        if (targetLastMove.effects?.copyTargetLastMove) {
          logDebug(`${move.name} failed because target last move is also a targetLastMove effect`)
        } else {
          // Copycat worked
          this.battle.events.push({
            type: 'DISPLAY_MESSAGE',
            message: `${attackingPokemon.name} used ${move.name}!`,
            referencedPlayerName: attackingPlayer.name
          })
          this.playSoundEffect(move)
          move = targetLastMove
        }
      } else {
        logDebug(`${move.name} failed because target hasn't used any moves yet`)
      }
    }
    if (move.effects?.randomMove) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${attackingPokemon.name} used ${move.name}!`,
        referencedPlayerName: attackingPlayer.name
      })
      this.playSoundEffect(move)
      const randomMoveName = this.random.randomPick(move.effects.randomMove.moveNames)
      const randomMoveDef = moves[randomMoveName]
      move = buildMove(randomMoveDef)
    }

    const ctx: CombatContext = {
      moveIndex,
      originalMove,
      move,
      attackingPlayer,
      attackingPokemon,
      defendingPlayer,
      defendingPokemon,
      damageDone: 0,
      noEffect: false,
      defendingPokemonPendingMove
    }

    this._useMove(ctx)
    
    // This happens whether the attack was successful or not 
    this.handleAfterAttackEffects(ctx)

    this.previousCombatContext = ctx
  }

  _useMove(ctx: CombatContext) {

    logDebug(`${ctx.attackingPokemon.name} will use ${ctx.move.name}`)

    if (ctx.attackingPokemon.ability?.pixilate && ctx.move.type === 'NORMAL' && ctx.move.category !== 'STATUS' && ctx.move.power != null) {
      const pixilatedMove = {
        ...ctx.move,
        type: 'FAIRY' as Type,
        power: ctx.move.power * 1.2
      }
      ctx.move = pixilatedMove
    }

    if (ctx.attackingPokemon.confused) {
      if (ctx.attackingPokemon.remainingConfusedTurns <= 0) {
        ctx.attackingPokemon.confused = false
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${ctx.attackingPokemon.name} is no longer confused!`,
          referencedPlayerName: ctx.attackingPlayer.name
        })
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${ctx.attackingPokemon.name} is confused!`,
          referencedPlayerName: ctx.attackingPlayer.name
        })
      }
    }

    if (ctx.attackingPokemon.nonVolatileStatusCondition === 'FROZEN') {
      if (this.random.roll(.2)) {
        // Attacker thawed
        ctx.attackingPokemon.nonVolatileStatusCondition = undefined
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${ctx.attackingPokemon.name} thawed out!`,
          referencedPlayerName: ctx.attackingPlayer.name
        })
        this.battle.events.push({
          type: 'STATUS_CHANGE',
          newStatus: null,
          playerName: ctx.attackingPlayer.name
        })
      }
    } else if (ctx.attackingPokemon.nonVolatileStatusCondition === 'ASLEEP' && 
      ctx.attackingPokemon.remainingSleepTurns <= 0) {
        // Attacker wakes up
        ctx.attackingPokemon.nonVolatileStatusCondition = undefined
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${ctx.attackingPokemon.name} woke up!`,
          referencedPlayerName: ctx.attackingPlayer.name
        })
        this.battle.events.push({
          type: 'STATUS_CHANGE',
          newStatus: null,
          playerName: ctx.attackingPlayer.name
        })
    }

    if (ctx.attackingPokemon.bindingMoveName != null && ctx.attackingPokemon.remainingBindTurns <= 0) {
      // Bind duration runs out
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} is no longer bound by ${ctx.attackingPokemon.bindingMoveName}!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
      ctx.attackingPokemon.bindingMoveName = null
      this.battle.events.push({
        type: 'BIND_CHANGE',
        newBindingMoveName: null,
        playerName: ctx.attackingPlayer.name
      })
    } 

    if (ctx.attackingPokemon.nonVolatileStatusCondition === 'PARALYZED' && this.random.roll(.25)) {
      // Attacker is fully paralyzed
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} is fully paralyzed and can't move!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
    } else if (ctx.attackingPokemon.nonVolatileStatusCondition === 'FROZEN') {
      // Attacker didn't thaw and is still frozen
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} is frozen and can't move!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
    } else if (ctx.attackingPokemon.nonVolatileStatusCondition === 'ASLEEP' && !ctx.move.effects?.failIfUserDoesntHaveStatus?.statuses.includes('ASLEEP')) {
      // Attacker is asleep
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} is fast asleep!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
    } else if (ctx.attackingPokemon.flinched) {
      // Attacker flinched
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} flinched and couldn't move!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
    } else if (ctx.attackingPokemon.confused && this.random.roll(1/3)) {
      // Attacker hurt itself in its confusion
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It hurt itself in its confusion!`
      })
      const confusionHitDamage = calculateConfusionHitDamage(ctx.attackingPokemon, this.random)
      takeDamage(ctx.attackingPlayer, ctx.attackingPokemon, confusionHitDamage, this.battle.events)
    } else if (ctx.attackingPokemon.isSlackingOff) {
      // Truant ability
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} is slacking off...`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
      ctx.attackingPokemon.isSlackingOff = false
    } else {
      this.__useMove(ctx)
    }

  }

  __useMove(ctx: CombatContext) {
    // Use the move

    if (ctx.attackingPokemon.ability?.stanceChange && !ctx.attackingPokemon.isBladeForm && ctx.move.category !== 'STATUS') {
      transformIntoBladeForm(ctx.attackingPokemon, ctx.attackingPlayer, this.battle.events)
    }

    if (ctx.move.effects?.kingsShield && ctx.attackingPokemon.isBladeForm) {
      transformIntoShieldForm(ctx.attackingPokemon, ctx.attackingPlayer, this.battle.events)
    }

    this.battle.events.push({
      type: 'DISPLAY_MESSAGE',
      message: `${ctx.attackingPokemon.name} used ${ctx.move.name}!`,
      referencedPlayerName: ctx.attackingPlayer.name,
      lengthOfPause: 'SHORTER'
    })

    const ppLoss = ctx.defendingPokemon.ability?.enemyUsesExtraPP ? 2 : 1
    ctx.originalMove.pp -= ppLoss
    if (ctx.originalMove.pp < 0) {
      ctx.originalMove.pp = 0
    }
    this.battle.events.push({
      type: 'PP_CHANGE',
      playerName: ctx.attackingPlayer.name,
      newPP: ctx.originalMove.pp,
      moveIndex: ctx.moveIndex,
      pokemonIndex: ctx.attackingPlayer.activePokemonIndex
    })

    // Mark the move as "used" for Last Resort
    ctx.attackingPokemon.movesUsed[ctx.moveIndex] = true

    ctx.attackingPokemon.previousMoveIndex = ctx.moveIndex

    this.handlePreAccuracyEffects(ctx)

    if (ctx.defendingPokemon.protected) {
      logDebug(`${ctx.move.name} was stopped by protect`)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.defendingPokemon.name} protected itself!`,
        referencedPlayerName: ctx.defendingPlayer.name
      })
    } else if (ctx.defendingPokemon.protectedByKingsShield && ctx.move.category !== 'STATUS') {
      logDebug(`${ctx.move.name} was stopped by King's Shield`)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.defendingPokemon.name} protected itself!`,
        referencedPlayerName: ctx.defendingPlayer.name
      })
      if (makesContact(ctx.move)) {
        handleStageChange(ctx.attackingPokemon, ctx.attackingPlayer, 'attack', -2, this.battle.events)
      }
    } else if (ctx.move.effects?.lastResort && !allMovesUsed(ctx.attackingPokemon)) {
      logDebug(`${ctx.move.name} failed because all other moves have not been used`)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It failed!`
      })
    } else if (ctx.move.effects?.failIfTargetDoesntHaveStatus && (!ctx.defendingPokemon.nonVolatileStatusCondition || !ctx.move.effects?.failIfTargetDoesntHaveStatus.statuses.includes(ctx.defendingPokemon.nonVolatileStatusCondition))) {
      logDebug(`${ctx.move.name} failed because target doesn't have status: ${ctx.move.effects?.failIfTargetDoesntHaveStatus.statuses}`)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It failed!`
      })
    } else if (ctx.move.effects?.failIfUserDoesntHaveStatus && (!ctx.attackingPokemon.nonVolatileStatusCondition || !ctx.move.effects?.failIfUserDoesntHaveStatus.statuses.includes(ctx.attackingPokemon.nonVolatileStatusCondition))) { 
      logDebug(`${ctx.move.name} failed because user doesn't have status: ${ctx.move.effects?.failIfUserDoesntHaveStatus.statuses}`)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It failed!`
      })
    } else if (ctx.move.effects?.suckerPunch && (!ctx.defendingPokemonPendingMove || ctx.defendingPokemonPendingMove?.category === 'STATUS')) {
      logDebug(`${ctx.move.name} failed because target isn't preparing an attack`)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It failed!`
      })
    } else {
      if (this.doesMoveMiss(ctx.attackingPokemon, ctx.move, ctx.defendingPokemon, this.battle.weather)) {
        logDebug(`${ctx.move.name} missed`)
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It missed!`
        })
      } else {
        // Move did not miss

        this.handlePreDamageEffects(ctx)

        if (ctx.move.category !== 'STATUS') {
          // Damaging move
          if (ctx.move.effects?.multipleHits) {
            this.handleMultipleHits(ctx)
          } else {
            this.hitWithDamagingMove(ctx)
          }
          if (ctx.defendingPokemon.nonVolatileStatusCondition === 'FROZEN' && ctx.move.type === 'FIRE') {
            // Defender thaws out due to being hit with a non-STATUS fire move
            ctx.defendingPokemon.nonVolatileStatusCondition = undefined
            this.battle.events.push({
              type: 'DISPLAY_MESSAGE',
              message: `${ctx.defendingPokemon.name} was thawed out by the heat!`,
              referencedPlayerName: ctx.defendingPlayer.name
            })
            this.battle.events.push({
              type: 'STATUS_CHANGE',
              newStatus: null,
              playerName: ctx.attackingPlayer.name
            })
          }
        } else {
          // Status move sound effect
          this.playSoundEffect(ctx.move)
        }

        // Logic for damaging or non-damaging moves

        if (ctx.move.effects?.protectUser || ctx.move.effects?.kingsShield) {
          let protectSuccessChance
          if (ctx.attackingPokemon.consecutiveProtectCount <= 0) {
            protectSuccessChance = 1
          } else if (ctx.attackingPokemon.consecutiveProtectCount == 1) {
            protectSuccessChance = 1/2
          } else if (ctx.attackingPokemon.consecutiveProtectCount == 2) {
            protectSuccessChance = 1/4
          } else {
            protectSuccessChance = 1/8
          }
          logDebug('Using protect with success chance: ' + protectSuccessChance)
          if (this.random.roll(protectSuccessChance)) {
            if (ctx.move.effects?.protectUser) {
              ctx.attackingPokemon.protected = true
            } else {
              ctx.attackingPokemon.protectedByKingsShield = true
            }
          } else {
            this.battle.events.push({
              type: 'DISPLAY_MESSAGE',
              message: `It failed!`
            })
          }
          ctx.attackingPokemon.consecutiveProtectCount++
          logDebug(`consecutiveProtectCount=${ctx.attackingPokemon.consecutiveProtectCount}`)
        }

        if (!ctx.noEffect) {
          this.handlePostDamageEffects(ctx)
        }

      }
      
    }
  }

  doesMoveMiss(attackingPokemon: Pokemon, move: Move, defendingPokemon: Pokemon, weather: Weather): boolean {
    if (move.effects?.ignoreAccuracyAndEvasion) {
      return false
    }
    const weatherSuppressed = isWeatherSuppressed(attackingPokemon, defendingPokemon)
    let accuracy = move.accuracy * getStageMultiplier('accuracy', attackingPokemon.stages.accuracy)
    if (attackingPokemon.ability?.increaseUserAccuracy) {
      accuracy *= 1 + attackingPokemon.ability.increaseUserAccuracy.percent
      logDebug('Ability increased accuracy')
    }
    if (!weatherSuppressed && move.stormRelated) {
      if (weather === 'HARSH_SUNLIGHT') {
        accuracy = .5
      } else if (weather === 'RAIN') {
        // Bypass accuracy check
        return false
      }
    }
    if (!weatherSuppressed && weather === 'HAIL' && move.name.toLowerCase() === 'blizzard') {
      // Bypass accuracy check
      return false
    }
    let evasion = getStageMultiplier('evasion', defendingPokemon.stages.evasion)
    if (defendingPokemon.ability?.raiseEvasionDuringWeather === this.battle.weather) {
      evasion *= 1.2
    }
    const chanceOfSuccess = accuracy / evasion
    logMoveSuccessFormula(accuracy, evasion, chanceOfSuccess)
    const success = this.random.roll(chanceOfSuccess)
    return !success
  }

  handleMultipleHits(ctx: CombatContext): boolean {
    logDebug(`Handling multiple hits`)
    let hitOptions: number[] = []
    let hitChances: number[] = []
    let optionCount = 1
    ctx.move.effects!.multipleHits!.additionalHits.forEach(additonalHit => {
      optionCount++
      hitOptions.push(optionCount)
      hitChances.push(additonalHit.chance)
    })
    logMultiHitChances(hitOptions, hitChances)
    let hitCount
    if (ctx.attackingPokemon.ability?.multiHitMax) {
      hitCount = 1 + ctx.move.effects!.multipleHits!.additionalHits.length
    } else {
      hitCount = this.random.weightedRandomPick(hitOptions, hitChances)
    }
    let fainted = false
    let actualHitCount = 0
    for (let i = 0; i < hitCount; i++) {
      fainted = this.hitWithDamagingMove(ctx)
      actualHitCount++
      if (fainted) {
        break
      }
    }
    this.battle.events.push({
      type: 'DISPLAY_MESSAGE',
      message: `It hit ${actualHitCount} times!`
    })
    return fainted
  }

  hitWithDamagingMove(ctx: CombatContext): boolean {
    logDebug(`Hitting with damaging move`)
    let preventedOHKO = false
    let gotAttackTypeBuff = false
    let gotAttackTypeHeal = false
    let {
      damage, 
      isCriticalHit, 
      preventedCriticalHit, 
      effectiveness, 
      message
    } = calculateAttackDamage(ctx, this.random, this.battle.weather, this.previousCombatContext)
    if (message) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: message
      })
    }
    ctx.damageDone = damage
    if (ctx.move.effects?.noEffectOnType && ctx.defendingPokemon.types.includes(ctx.move.effects.noEffectOnType.type)) {
      effectiveness = NO_EFFECT
    }
    if (ctx.defendingPokemon.ability?.buffFromAttackType?.type === ctx.move.type) {
      effectiveness = NO_EFFECT
      if (ctx.defendingPokemon.attackTypeBuff == null) {
        ctx.defendingPokemon.attackTypeBuff = ctx.move.type
        gotAttackTypeBuff = true
      }
    }
    if (ctx.defendingPokemon.ability?.healFromAttackType?.type === ctx.move.type) {
      effectiveness = NO_EFFECT
      gotAttackTypeHeal = true
    }
    if (ctx.move.type === 'GROUND' && isRaised(ctx.defendingPokemon)) {
      effectiveness = NO_EFFECT
    }
    if (ctx.move.soundBased && ctx.defendingPokemon.ability?.soundProof) {
      effectiveness = NO_EFFECT
    }
    if (ctx.defendingPokemon.ability?.wonderGuard && effectiveness < 2) {
      effectiveness = NO_EFFECT
    }
    if (effectiveness >= SUPER_EFFECTIVE && ctx.defendingPokemon.ability?.reduceDamageFromReceivingSuperEffective) {
      damage *= .75
      logDebug('Reduced super effective damage by 25% because of ability')
    } 
    ctx.noEffect = effectiveness === NO_EFFECT
    let fainted = false
    if (effectiveness !== NO_EFFECT && damage > 0) {
      this.playSoundEffect(ctx.move)
      if (ctx.defendingPokemon.ability?.preventOHKO && 
          ctx.defendingPokemon.hp === ctx.defendingPokemon.startingHP && 
          damage >= ctx.defendingPokemon.hp) {
        // Needs to be 2 instead of 1 to account for round function
        damage = ctx.defendingPokemon.hp - 2 
        preventedOHKO = true
      }
      fainted = takeDamage(ctx.defendingPlayer, ctx.defendingPokemon, damage, this.battle.events, true)
    }
    if (gotAttackTypeBuff) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.defendingPokemon.name} got a boost for ${ctx.move.type.toUpperCase()} attacks instead of taking damage!`,
        referencedPlayerName: ctx.defendingPlayer.name
      })
    } else if (gotAttackTypeHeal) {
      heal(ctx.defendingPokemon, ctx.defendingPlayer, ctx.defendingPokemon.startingHP / 4, this.battle.events)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.defendingPokemon.name} was healed instead of taking damage!`,
        referencedPlayerName: ctx.defendingPlayer.name
      })
    } else if (effectiveness === NO_EFFECT) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It had no effect...`
      })
    } else if (effectiveness < 1) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It's not very effective...`
      })
    } else if (effectiveness > 1 && effectiveness <= SUPER_EFFECTIVE) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It's super effective!`
      })
    } else if (effectiveness > SUPER_EFFECTIVE) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It's extremely effective!`
      })
    }
    if (isCriticalHit && effectiveness !== NO_EFFECT) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It's a critical hit!`
      })
    }
    if (preventedCriticalHit && !fainted) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.defendingPokemon.name} avoided a critical hit!`,
        referencedPlayerName: ctx.defendingPlayer.name
      })
    }
    if (preventedOHKO) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.defendingPokemon.name} hung on!`,
        referencedPlayerName: ctx.defendingPlayer.name
      })
    }

    if (makesContact(ctx.move)) {
      this.handleContactEffects(ctx)
    }

    return fainted
  }

  handleContactEffects(ctx: CombatContext) {
    if (ctx.defendingPokemon.ability?.receivingContactInflictsStatus && ctx.attackingPokemon.nonVolatileStatusCondition == null &&
        this.random.roll(.3)) {
      this.applyNonVolatileStatusCondition(ctx.attackingPokemon, ctx.attackingPlayer, ctx.defendingPokemon.ability.receivingContactInflictsStatus.status,
        ctx.defendingPokemon, ctx.defendingPlayer, this.battle.weather)
    }
    if (ctx.defendingPokemon.ability?.receivingContactDoesDamage) {
      const damage = ctx.attackingPokemon.startingHP * ctx.defendingPokemon.ability.receivingContactDoesDamage.percent
      takeDamage(ctx.attackingPlayer, ctx.attackingPokemon, damage, this.battle.events)
    }
    if (ctx.defendingPokemon.ability?.receivingContactGivesAbility && !ctx.attackingPokemon.ability?.receivingContactGivesAbility) {
      ctx.attackingPokemon.ability = abilities['Mummy']
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name}'s ability changed to Mummy!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
    }
    if (ctx.attackingPokemon.ability?.attackingWithContactInflictsStatus && ctx.defendingPokemon.nonVolatileStatusCondition == null &&
        this.random.roll(.3)) {
      this.applyNonVolatileStatusCondition(ctx.defendingPokemon, ctx.defendingPlayer, ctx.attackingPokemon.ability.attackingWithContactInflictsStatus.status,
        ctx.attackingPokemon, ctx.attackingPlayer, this.battle.weather)
    }
  }

  handlePreAccuracyEffects(ctx: CombatContext) {
    if (ctx.move.effects?.selfDestruct) {
      this.battle.events.push({
        type: 'SOUND_EFFECT',
        fileName: 'attack_pre_explosion.mp3',
        soundType: 'MOVE'
      })
      takeDamage(ctx.attackingPlayer, ctx.attackingPokemon, ctx.attackingPokemon.hp, this.battle.events, true)
    }
    if (ctx.attackingPokemon.ability?.truant) {
      ctx.attackingPokemon.isSlackingOff = true
    }
  }

  handlePreDamageEffects(ctx: CombatContext) {
    if (ctx.move.effects?.breakScreens && (ctx.defendingPlayer.remainingLightScreenTurns > 0 || ctx.defendingPlayer.remainingReflectTurns > 0 )) {
      ctx.defendingPlayer.remainingLightScreenTurns = 0
      ctx.defendingPlayer.remainingReflectTurns = 0
      this.battle.pushHazardsChangeEvent(ctx.defendingPlayer)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It shattered the barrier!`
      })
    }
  }
  
  handlePostDamageEffects(ctx: CombatContext) {

    // Copycat fails at this point because it should have selected a different move
    if (ctx.move.effects?.copyTargetLastMove) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `It failed!`
      })
    }

    // Rapid Spin
    if (ctx.move.effects?.removeUserBindAndEntryHazards) {
      this.handleRemoveUserBindAndEntryHazards(ctx)
    }

    // These effects don't happen if the target faints
    if (isAlive(ctx.defendingPokemon)) {

      if (ctx.move.effects?.applyNonVolatileStatusConditions && !ctx.attackingPokemon.ability?.sheerForce) {
        let appliedStatusCondition = false
        ctx.move.effects.applyNonVolatileStatusConditions.conditions.forEach(condition => {
          if (!ctx.defendingPokemon.nonVolatileStatusCondition) {
            if (this.random.roll(this.getChance(ctx.attackingPokemon, condition.chance))) {
              appliedStatusCondition = this.applyNonVolatileStatusCondition(ctx.defendingPokemon, ctx.defendingPlayer, condition.type, 
                ctx.attackingPokemon, ctx.attackingPlayer, this.battle.weather)
            }
          }
        })
  
        if (ctx.move.category === 'STATUS' && !appliedStatusCondition) {
          // Handle situation where a status move that applies a status condition doesn't work because
          // the defender already has a status condition
          // e.g. using Willow-O-Wisp on a burned pokemon
          this.battle.events.push({
            type: 'DISPLAY_MESSAGE',
            message: `It failed!`
          })
        }
      }
  
      if (ctx.move.effects?.applyConfusion && !ctx.defendingPokemon.confused && this.random.roll(this.getChance(ctx.attackingPokemon, ctx.move.effects.applyConfusion.chance))) {
        ctx.defendingPokemon.confused = true
        const numberOfConfusedTurns = this.random.randomPick([2, 3, 4, 5])
        ctx.defendingPokemon.remainingConfusedTurns = numberOfConfusedTurns
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${ctx.defendingPokemon.name} became confused!`,
          referencedPlayerName: ctx.defendingPlayer.name
        })
      }
  
      if (ctx.move.effects?.applyBind && ctx.defendingPokemon.bindingMoveName == null) {
        const numberOfBindTurns = this.random.randomPick([4, 5])
        ctx.defendingPokemon.remainingBindTurns = numberOfBindTurns
        ctx.defendingPokemon.bindingMoveName = ctx.move.name
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${ctx.defendingPokemon.name} became bound by ${ctx.move.name}!`,
          referencedPlayerName: ctx.defendingPlayer.name
        })
        this.battle.events.push({
          type: 'BIND_CHANGE',
          newBindingMoveName: ctx.move.name,
          playerName: ctx.defendingPlayer.name
        })
      }

      if (ctx.move.effects?.flinchTarget && !ctx.attackingPokemon.ability?.sheerForce) {
        if (this.random.roll(this.getChance(ctx.attackingPokemon, ctx.move.effects.flinchTarget.chance))) {
          if (ctx.defendingPokemon.ability?.preventFlinching) {
            this.battle.events.push({
              type: 'DISPLAY_MESSAGE',
              message: `${ctx.defendingPokemon.name}'s ${ctx.defendingPokemon.ability.name} prevented flinching!`,
              referencedPlayerName: ctx.defendingPlayer.name
            })
          } else {
            ctx.defendingPokemon.flinched = true
          }
        }
      }

      if (ctx.move.effects?.replaceTargetTypes) {
        const newType = ctx.move.effects?.replaceTargetTypes.type
        ctx.defendingPokemon.types = [newType]
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${ctx.defendingPokemon.name} is now ${newType} type!`,
          referencedPlayerName: ctx.defendingPlayer.name
        })
      }
      
    }

    if (ctx.move.effects?.modifyStages) {
      ctx.move.effects?.modifyStages.modifiers.forEach(modifier => {
        if (modifier.userOrTarget === 'TARGET' && ctx.attackingPokemon.ability?.sheerForce) {
          // Skip if attacker has Sheer Force
          return
        }
        if (modifier.userOrTarget === 'TARGET' && !isAlive(ctx.defendingPokemon)) {
          return
        }
        if (this.random.roll(this.getChance(ctx.attackingPokemon, modifier.chance))) {
          let pokemonToModify
          let playerToModify
          if (modifier.userOrTarget === 'USER') {
            pokemonToModify = ctx.attackingPokemon
            playerToModify = ctx.attackingPlayer
          } else {
            pokemonToModify = ctx.defendingPokemon
            playerToModify = ctx.defendingPlayer
          }
          handleStageChange(pokemonToModify, playerToModify, modifier.stageStat, modifier.stages, this.battle.events)
        }
      })
    }

    if (ctx.move.effects?.recoil && ctx.damageDone > 0 && !ctx.attackingPokemon.ability?.preventRecoil) {
      const recoilDamageBeforeRounding = ctx.damageDone * ctx.move.effects?.recoil.percent
      const recoilDamage = roundDamage(recoilDamageBeforeRounding)
      takeDamage(ctx.attackingPlayer, ctx.attackingPokemon, recoilDamage, this.battle.events)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} was damaged by recoil!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
    }

    // Struggle and Belly Drum, not Explosion
    if (ctx.move.effects?.recoilBasedOnUserHP) {
      const recoilDamageBeforeRounding = ctx.attackingPokemon.startingHP * ctx.move.effects?.recoilBasedOnUserHP.percent
      const recoilDamage = roundDamage(recoilDamageBeforeRounding)
      takeDamage(ctx.attackingPlayer, ctx.attackingPokemon, recoilDamage, this.battle.events, false, false)
      if (ctx.move.effects?.recoilBasedOnUserHP.showRecoilText) {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${ctx.attackingPokemon.name} was damaged by recoil!`,
          referencedPlayerName: ctx.attackingPlayer.name
        })
      }
    }

    if (ctx.move.effects?.maximizeAttack) {
      modifyStage(ctx.attackingPokemon, 'attack', 6)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        referencedPlayerName: ctx.attackingPlayer.name,
        message: `${ctx.attackingPokemon.name} cut its own HP and maximized its Attack!`
      })
    }

    if (ctx.move.effects?.drain && ctx.damageDone > 0 && ctx.attackingPokemon.hp < ctx.attackingPokemon.startingHP) {
      heal(ctx.attackingPokemon, ctx.attackingPlayer, ctx.damageDone * ctx.move.effects.drain.percent, this.battle.events)
      // this.battle.events.push({
      //   type: 'DISPLAY_MESSAGE',
      //   message: `${ctx.defendingPokemon.name} had its energy drained!`,
      //   referencedPlayerName: ctx.defendingPlayer.name
      // })
    }

    if (ctx.move.effects?.healUser) {
      let healPercent = ctx.move.effects.healUser.percent
      let healMessage = `${ctx.attackingPokemon.name} regained health!`
      if (ctx.move.effects.healUser.modifiedByWeather) {
        if (this.battle.weather === 'HARSH_SUNLIGHT') {
          healPercent = 2/3
          healMessage = `${ctx.attackingPokemon.name} regained extra health from the sunlight!`
        } else if (this.battle.weather !== 'CLEAR_SKIES') {
          healPercent = 1/8
        }
      }
      heal(ctx.attackingPokemon, ctx.attackingPlayer, ctx.attackingPokemon.startingHP * healPercent, this.battle.events)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: healMessage,
        referencedPlayerName: ctx.attackingPlayer.name
      })
    }

    if (ctx.move.effects?.setStickyWeb) {
      if (!ctx.defendingPlayer.hasStickyWeb) {
        ctx.defendingPlayer.hasStickyWeb = true
        this.battle.pushHazardsChangeEvent(ctx.defendingPlayer)
        // Attacker message
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `A sticky web as been laid out beneath the opposing team's feet!`,
          forPlayerName: ctx.attackingPlayer.name
        })
        // Defender message
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `A sticky web as been laid out beneath your team's feet!`,
          forPlayerName: ctx.defendingPlayer.name
        })
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It failed!`
        })
      }
    }

    if (ctx.move.effects?.setStealthRock) {
      if (!ctx.defendingPlayer.hasStealthRock) {
        ctx.defendingPlayer.hasStealthRock = true
        this.battle.pushHazardsChangeEvent(ctx.defendingPlayer)
        // Attacker message
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `Pointed stones float in the air around the opposing team!`,
          forPlayerName: ctx.attackingPlayer.name
        })
        // Defender message
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `Pointed stones float in the air around your team!`,
          forPlayerName: ctx.defendingPlayer.name
        })
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It failed!`
        })
      }
    }

    if (ctx.move.effects?.setSpikes) {
      if (ctx.defendingPlayer.spikeLayerCount < 3) {
        ctx.defendingPlayer.spikeLayerCount++
        this.battle.pushHazardsChangeEvent(ctx.defendingPlayer)
        // Attacker message
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `Spikes were scattered all around the feet of the opposing team!`,
          forPlayerName: ctx.attackingPlayer.name
        })
        // Defender message
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `Spikes were scattered all around the feet of your team!`,
          forPlayerName: ctx.defendingPlayer.name
        })
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It failed!`
        })
      }
    }

    if (ctx.move.effects?.setToxicSpikes) {
      if (ctx.defendingPlayer.toxicSpikeLayerCount < 2) {
        ctx.defendingPlayer.toxicSpikeLayerCount++
        this.battle.pushHazardsChangeEvent(ctx.defendingPlayer)
        // Attacker message
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `Poison spikes were scattered all around the feet of the opposing team!`,
          forPlayerName: ctx.attackingPlayer.name
        })
        // Defender message
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `Poison spikes were scattered all around the feet of your team!`,
          forPlayerName: ctx.defendingPlayer.name
        })
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It failed!`
        })
      }
    }

    // Burn Up, etc
    if (ctx.move.effects?.removeUserType) {
      const typeToRemove = ctx.move.effects.removeUserType.type
      if (ctx.attackingPokemon.types.includes(typeToRemove)) {
        ctx.attackingPokemon.types = ctx.attackingPokemon.types
          .filter(t => t !== typeToRemove)
        if (ctx.attackingPokemon.types.length === 0) {
          ctx.attackingPokemon.types = ['NORMAL']
        }
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${ctx.attackingPokemon.name} is no longer ${typeToRemove} type!`,
          referencedPlayerName: ctx.attackingPlayer.name
        })
      }
    }

    if (ctx.move.effects?.replaceUserTypesBasedOnTargetLastMove) {
      if (ctx.defendingPokemon.previousMoveIndex !== null) {
        const targetLastMove = ctx.defendingPokemon.moves[ctx.defendingPokemon.previousMoveIndex]
        const effectivenessMapping = getEffectivenessMapping(targetLastMove.type)
        const randomResistantType = effectivenessMapping.hasNoEffectOn.length ? 
          this.random.randomPick(effectivenessMapping.hasNoEffectOn) : 
          this.random.randomPick(effectivenessMapping.weaknesses)
        ctx.attackingPokemon.types = [randomResistantType]
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${ctx.attackingPokemon.name} became ${randomResistantType} type!`,
          referencedPlayerName: ctx.attackingPlayer.name
        })
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It failed!`
        })
      }
    }

    if (ctx.move.effects?.swapStats) {
      const stats = ctx.move.effects.swapStats.stats
      stats.forEach((stat: StageStat) => {
        if (stat !== 'accuracy') {
          // Stage stats should match the props on Pokemon (except accuracy)
          const targetPokemon = ctx.defendingPokemon as any
          const targetStat = targetPokemon[stat]
          const targetStatStage = ctx.defendingPokemon.stages[stat]
          const userPokemon = ctx.attackingPokemon as any
          const userStat = userPokemon[stat]
          const userStatStage = ctx.attackingPokemon.stages[stat]
          if (targetStat && userStat) {
            targetPokemon[stat] = userStat
            targetPokemon.stages[stat] = userStatStage
            userPokemon[stat] = targetStat
            userPokemon.stages[stat] = targetStatStage
          }
        }
      })
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: stats.length === 1 ? 
        `${ctx.attackingPokemon.name} switched ${stageStatDisplayTexts[stats[0]]} with ${ctx.defendingPokemon.name}!` : 
        `${ctx.attackingPokemon.name} switched ${stageStatDisplayTexts[stats[0]]} and ${stageStatDisplayTexts[stats[1]]} with ${ctx.defendingPokemon.name}!`
      })
    }

    if (ctx.move.effects?.transformIntoTarget) {
      transform(ctx.attackingPokemon, ctx.attackingPlayer, ctx.defendingPokemon, this.battle.events)
    }

    if (ctx.move.effects?.reflect) {
      if (ctx.attackingPlayer.remainingReflectTurns < 1) {
        ctx.attackingPlayer.remainingReflectTurns = 5
        this.battle.pushHazardsChangeEvent(ctx.attackingPlayer)
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          forPlayerName: ctx.attackingPlayer.name,
          message: `Reflect raised your team's Defense!`
        })
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          forPlayerName: ctx.defendingPlayer.name,
          message: `Reflect raised the enemy team's Defense!`
        })
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It failed!`
        })
      }
    }

    if (ctx.move.effects?.lightScreen) {
      if (ctx.attackingPlayer.remainingLightScreenTurns < 1) {
        ctx.attackingPlayer.remainingLightScreenTurns = 5
        this.battle.pushHazardsChangeEvent(ctx.attackingPlayer)
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          forPlayerName: ctx.attackingPlayer.name,
          message: `Light Screen raised your team's Special Defense!`
        })
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          forPlayerName: ctx.defendingPlayer.name,
          message: `Light Screen raised the enemy team's Special Defense!`
        })
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It failed!`
        })
      }
    }

    if (ctx.move.effects?.setLeechSeed) {
      if (!ctx.defendingPokemon.types.includes('GRASS') && !ctx.defendingPokemon.hasLeechSeed) {
        ctx.defendingPokemon.hasLeechSeed = true
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          referencedPlayerName: ctx.defendingPlayer.name,
          message: `${ctx.defendingPokemon.name} was seeded!`
        })
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It failed!`
        })
      }
    }

    if (ctx.move.effects?.roost) {
      ctx.attackingPokemon.roosted = true
      ctx.attackingPokemon.preRoostTypes = ctx.attackingPokemon.types
      ctx.attackingPokemon.types = ctx.attackingPokemon.types.filter(t => t !== 'FLYING')
      if (ctx.attackingPokemon.types.length === 0) {
        ctx.attackingPokemon.types = ['NORMAL']
      }
    }

    if (ctx.move.effects?.targetLastMoveLosesPP) {
      if (ctx.defendingPokemon.previousMoveIndex !== null) {
        const targetLastMove = ctx.defendingPokemon.moves[ctx.defendingPokemon.previousMoveIndex]
        const ppLossAmount = 5
        const newPP = targetLastMove.pp >= ppLossAmount ? targetLastMove.pp - ppLossAmount : 0
        targetLastMove.pp = newPP
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${ctx.defendingPokemon.name}'s ${targetLastMove.name} lost ${ppLossAmount} PP!`,
          referencedPlayerName: ctx.defendingPlayer.name,
        })
        this.battle.events.push({
          type: 'PP_CHANGE',
          moveIndex:ctx.defendingPokemon.previousMoveIndex,
          newPP: newPP,
          playerName: ctx.defendingPlayer.name,
          pokemonIndex: ctx.defendingPlayer.activePokemonIndex,
        })
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It failed!`
        })
      }
    }



    if (ctx.move.effects?.forceTargetSwitch) {
      const defendingPlayerActiveIndex = ctx.defendingPlayer.activePokemonIndex
      const validSwitchOptions: number[] = []
      for (const [index, teamMember] of ctx.defendingPlayer.team.entries()) {
        if (index !== defendingPlayerActiveIndex && teamMember.hp > 0) {
          validSwitchOptions.push(index)
        }
      }
      if (validSwitchOptions.length > 0 && ctx.defendingPokemon.hp > 0) {
        let message = ''
        if (ctx.move.name === 'Roar') {
          message = `${ctx.defendingPokemon.name} ran away scared!`
        } else if (ctx.move.name === 'Whirlwind') {
          message = `${ctx.defendingPokemon.name} was blown away!`
        } else {
          message = `${ctx.defendingPokemon.name} was thrown out of the battle!`
        }
        const newPokemonIndex = this.random.randomPick(validSwitchOptions)
        const newPokemon = ctx.defendingPlayer.team[newPokemonIndex]
        handleForceSwitch(ctx.defendingPlayer, newPokemonIndex, this.battle, message)
        ctx.defendingPokemon = newPokemon
      } else if (ctx.move.category === 'STATUS') {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It failed!`
        })
      }
    }

    if (ctx.move.effects?.rest) {
      if (ctx.attackingPokemon.hp < ctx.attackingPokemon.startingHP ) {
        ctx.attackingPokemon.nonVolatileStatusCondition = 'ASLEEP'
        const numberOfSleepTurns = ctx.attackingPokemon.ability?.wakeUpEarly ? 2 : 3
        ctx.attackingPokemon.remainingSleepTurns = numberOfSleepTurns
        this.battle.events.push({
          type: 'STATUS_CHANGE',
          newStatus: 'ASLEEP',
          playerName: ctx.attackingPlayer.name
        })
        heal(ctx.attackingPokemon, ctx.attackingPlayer, ctx.attackingPokemon.startingHP, this.battle.events)
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          referencedPlayerName: ctx.attackingPlayer.name,
          message: `${ctx.attackingPokemon.name} went to sleep!`
        })
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `It failed!`
        })
      }
    }

    if (ctx.defendingPokemon.ability?.weakArmor && ctx.move.category === 'PHYSICAL') {
      modifyStage(ctx.defendingPokemon, 'defense', -1)
      modifyStage(ctx.defendingPokemon, 'speed', 2)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.defendingPokemon.name}'s defense fell!`,
        referencedPlayerName: ctx.defendingPlayer.name
      })
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.defendingPokemon.name}'s speed rose sharply!`,
        referencedPlayerName: ctx.defendingPlayer.name
      })
    }

    if (ctx.move.effects?.applyWeather) {
      if (this.battle.weather !== ctx.move.effects.applyWeather) {
        this.battle.applyWeather(ctx.move.effects.applyWeather)
      } else {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: 'It failed!'
        })
      }
    }

    if (ctx.move.effects?.doNothing) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: 'Nothing happened!'
      })
    }

  }

  handleRemoveUserBindAndEntryHazards(ctx: CombatContext) {
    // Remove bind
    if (ctx.attackingPokemon.bindingMoveName) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} is no longer bound by ${ctx.attackingPokemon.bindingMoveName}!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
      ctx.attackingPokemon.bindingMoveName = null
      ctx.attackingPokemon.remainingBindTurns = 0
      this.battle.events.push({
        type: 'BIND_CHANGE',
        newBindingMoveName: null,
        playerName: ctx.attackingPlayer.name
      })
    }

    // Remove sticky web
    if (ctx.attackingPlayer.hasStickyWeb) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `The sticky web was removed!`
      })
      ctx.attackingPlayer.hasStickyWeb = false
    }

    if (ctx.attackingPlayer.hasStealthRock) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `The pointed stones were removed!`
      })
      ctx.attackingPlayer.hasStealthRock = false
    }

    if (ctx.attackingPlayer.spikeLayerCount > 0) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `The spikes were removed!`
      })
      ctx.attackingPlayer.spikeLayerCount = 0
    }

    if (ctx.attackingPlayer.toxicSpikeLayerCount > 0) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `The poisonous spikes were removed!`
      })
      ctx.attackingPlayer.toxicSpikeLayerCount = 0
    }

    if (ctx.attackingPokemon.hasLeechSeed) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `Leech Seed was removed!`
      })
      ctx.attackingPokemon.hasLeechSeed = false
    }

    this.battle.pushHazardsChangeEvent(ctx.attackingPlayer)

  }

  handleAfterAttackEffects(ctx: CombatContext) {
    if (ctx.attackingPokemon.nonVolatileStatusCondition === 'BURNED') {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} was hurt by its burn!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
      let damage = ctx.attackingPokemon.startingHP / 16
      takeDamage(ctx.attackingPlayer, ctx.attackingPokemon, damage, this.battle.events)
    }
    if (ctx.attackingPokemon.nonVolatileStatusCondition === 'POISONED') {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} was hurt by poison!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
      let damage = ctx.attackingPokemon.startingHP / 8
      takeDamage(ctx.attackingPlayer, ctx.attackingPokemon, damage, this.battle.events)
    }
    if (ctx.attackingPokemon.nonVolatileStatusCondition === 'BADLY POISONED') {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} was hurt by poison!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
      let damage = calculateBadlyPoisonedDamage(ctx.attackingPokemon)
      takeDamage(ctx.attackingPlayer, ctx.attackingPokemon, damage, this.battle.events)
    }
    if (ctx.attackingPokemon.remainingBindTurns > 0 && isAlive(ctx.defendingPokemon)) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${ctx.attackingPokemon.name} was hurt by ${ctx.attackingPokemon.bindingMoveName}!`,
        referencedPlayerName: ctx.attackingPlayer.name
      })
      let damage = ctx.attackingPokemon.startingHP / 8
      takeDamage(ctx.attackingPlayer, ctx.attackingPokemon, damage, this.battle.events)
    }
  }

  applyNonVolatileStatusCondition(target: Pokemon, targetPlayer: Player, type: NonVolatileStatusCondition, 
      otherPokemon: Pokemon, otherPlayer: Player, weather: Weather, synchronize: boolean = false): boolean {
    let appliedStatusCondition = false
    if (!isAlive(target)) {
      return appliedStatusCondition
    }
    const weatherSuppressed = isWeatherSuppressed(target, otherPokemon)
    if (!synchronize && type === 'BURNED' && target.types.includes('FIRE')) {
      logDebug('Not applying BURNED because target is FIRE type')
    } else if (!synchronize && type === 'PARALYZED' && (target.types.includes('ELECTRIC') || target.types.includes('GROUND'))) {
      logDebug('Not applying PARALYZED because target is ELECTRIC type')
    } else if (!synchronize && (type === 'POISONED' || type === 'BADLY POISONED') && (target.types.includes('POISON') || target.types.includes('STEEL'))) {
      logDebug('Not applying POISONED because target is POISON or STEEL type')
    } else if (type === 'FROZEN' && target.types.includes('ICE')) {
      logDebug('Not applying FROZEN because target is ICE type')
    } else if (!weatherSuppressed && type === 'FROZEN' && weather === 'HARSH_SUNLIGHT') {
      logDebug('Not applying FROZEN because weather is HARSH_SUNLIGHT')
    } else if (!synchronize && target.ability?.preventStatus?.statuses.includes(type) || target.ability?.preventStatus?.statuses === 'ANY') {
      logDebug('Not applying status because target has ability that prevents it')
    } else {
      target.nonVolatileStatusCondition = type
      if (type === 'ASLEEP') {
        let numberOfSleepTurns = this.random.randomPick([2, 3, 4])
        if (target.ability?.wakeUpEarly) {
          numberOfSleepTurns = Math.floor(numberOfSleepTurns / 2)
        }
        target.remainingSleepTurns = numberOfSleepTurns
      } else if (type === 'BADLY POISONED') {
        target.badlyPoisonedTurns = 1
      }
      appliedStatusCondition = true
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${target.name} became ${type.toLowerCase()}!`,
        referencedPlayerName: targetPlayer.name
      })
      this.battle.events.push({
        type: 'STATUS_CHANGE',
        newStatus: type,
        playerName: targetPlayer.name
      })
      if (!synchronize && target.ability?.syncStatus && otherPokemon.nonVolatileStatusCondition == null && 
        (type === 'POISONED' || type === 'BADLY POISONED' || type === 'BURNED' || type === 'PARALYZED')) {
        this.applyNonVolatileStatusCondition(otherPokemon, otherPlayer, type, target, targetPlayer, this.battle.weather, true)
      }
    }
    return appliedStatusCondition
  }

  playSoundEffect(move: Move) {
    const soundEffect = getSoundEffect(move)
    if (soundEffect) {
      this.battle.events.push({
        type: 'SOUND_EFFECT',
        fileName: soundEffect,
        soundType: 'MOVE'
      })
    }
  }

  getChance(pokemon: Pokemon, chance: number): number {
    if (pokemon.ability?.doubleChanceOfSecondaryEffects) {
      return chance * 2
    } else {
      return chance
    }
  }

}

