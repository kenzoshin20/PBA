import { Battle } from "../model/battle.js";
import { PlayerActionEvent } from "../model/battle-event.js";
import { Random } from "../util/random.js";
import { ActionSelectorContext } from "./action-selector-context.js";
import { AIOptions, optionsToString, selectAIOption } from "./ai-options.js";
import { getPokemonEffectiveness, getTypeEffectiveness } from "../model/type.js";
import { getCountersToEnemy, isCounter, selectRequiredSwitch } from "./select-switch.js";
import { logDebug } from "../util/logger.js";
import { Pokemon } from "../model/pokemon.js";
import { getActivePokemonForPlayer } from "../model/player.js";
import { isTrapped } from "../model/trap.js";
import { selectMove } from "./select-move.js";

type Action = 'FIGHT' | 'SWITCH'

export function selectAction(battle: Battle): PlayerActionEvent {
  const random = new Random()
  const cpuPlayer = battle.getComputerPlayer()
  const cpuName = cpuPlayer.name
  const userPlayer = battle.getOtherPlayer(cpuPlayer)
  const ctx: ActionSelectorContext = {
    attackingPlayer: cpuPlayer,
    attackingPokemon: cpuPlayer.team[cpuPlayer.activePokemonIndex],
    defendingPlayer: userPlayer,
    defendingPokemon: userPlayer.team[userPlayer.activePokemonIndex],
    battle: battle
  }
  if (battle.battleState === 'SELECTING_FIRST_POKEMON') {
    let index = random.randomIntegerInRange(0, cpuPlayer.team.length - 1)
    if (cpuPlayer.leadPokemonIndex != null) {
      index = cpuPlayer.leadPokemonIndex
    }
    return {
      type: 'PLAYER_ACTION',
      playerName: cpuName,
      details: {
        type: 'SELECT_POKEMON',
        pokemonIndex: index
      }
    }
  } else if (battle.requiredToSwitch.includes(cpuName)) {
    const pokemonIndex = selectRequiredSwitch(ctx)
    return {
      type: 'PLAYER_ACTION',
      playerName: cpuName,
      details: {
        type: 'SELECT_POKEMON',
        pokemonIndex: pokemonIndex
      }
    }
  } else {
    const isFirstEncounter = ctx.defendingPokemon.activeTurnCount <= 1 || ctx.attackingPokemon.activeTurnCount <= 1
    const currentPokemonIsCounter = isCounter(ctx.defendingPokemon, getActivePokemonForPlayer(ctx.attackingPlayer))
    const countersToEnemy: number[] = getCountersToEnemy(ctx.defendingPokemon, ctx.attackingPlayer.team, ctx.attackingPlayer.activePokemonIndex, true)
    if (!currentPokemonIsCounter && countersToEnemy.length && isFirstEncounter && !isTrapped(ctx.attackingPokemon, ctx.defendingPokemon) && random.roll(.85)) {
      return {
        type: 'PLAYER_ACTION',
        playerName: cpuName,
        details: {
          type: 'SELECT_POKEMON',
          pokemonIndex: random.randomPick(countersToEnemy)
        }
      }
    } else {
      const moveIndex = selectMove(ctx)
      if (moveIndex === 'Struggle') {
        return {
          type: 'PLAYER_ACTION',
          playerName: cpuName,
          details: {
            type: 'SELECT_MOVE',
            moveIndex: 0,
            struggle: true
          }
        }
      } else {
        return {
          type: 'PLAYER_ACTION',
          playerName: cpuName,
          details: {
            type: 'SELECT_MOVE',
            moveIndex: moveIndex
          }
        }
      }
    }
  }
}

export function getActionOptions(ctx: ActionSelectorContext): AIOptions<Action> {
  if (ctx.defendingPokemon.ability?.preventNonRaisedEnemySwitching || ctx.defendingPokemon.ability?.preventNonGhostEnemySwitching) {
    // Must Fight since ability prevents switching
    return [
      { option: 'FIGHT', desc: 'FIGHT', weight: 100 },
      { option: 'SWITCH', desc: 'SWITCH', weight: 0 }
    ]
  }
  let effectiveness = getPokemonEffectiveness(ctx.attackingPokemon, ctx.defendingPokemon)
  if (effectiveness >= 1.5) {
    // Attacker has type advantage
    return [
      { option: 'FIGHT', desc: 'FIGHT', weight: 100 },
      { option: 'SWITCH', desc: 'SWITCH', weight: 0 }
    ]
  } else if (effectiveness < 1) {
    // Attacker has type disadvantage 
    return [
      { option: 'FIGHT', desc: 'FIGHT', weight: 100 },
      { option: 'SWITCH', desc: 'SWITCH', weight: 0 }
    ]
  } else {
    return [
      { option: 'FIGHT', desc: 'FIGHT', weight: 100 },
      { option: 'SWITCH', desc: 'SWITCH', weight: 0 }
    ]
  }
}

