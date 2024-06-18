import { Pokemon } from "../model/pokemon.js";
import { getPokemonEffectiveness, getTypeEffectiveness } from "../model/type.js";
import { logDebug } from "../util/logger.js";
import { Random } from "../util/random.js";
import { ActionSelectorContext } from "./action-selector-context.js";
import { AIOptions, optionsToString, selectAIOption } from "./ai-options.js";

export function selectRequiredSwitch(ctx: ActionSelectorContext): number {
  const options = getSwitchOptions(ctx)
  if (options.length === 0) {
    throw new Error('Zero switch options')
  }
  logDebug('Selecting switch from ' + optionsToString(options))
  const selected = selectAIOption(options, new Random())
  logDebug('Selected: ' + selected)
  return selected
}

export function getSwitchOptions(ctx: ActionSelectorContext): AIOptions<number> {
  const options = ctx.attackingPlayer.team.map((pokemon, i) => {
    if (pokemon.hp <= 0) {
      return null
    }
    if (i === ctx.attackingPlayer.activePokemonIndex) {
      return {
        option: i,
        weight: 0,
        desc: pokemon.name
      }
    } else if (getPokemonEffectiveness(pokemon, ctx.defendingPokemon) > 1) {
      return {
        option: i,
        weight: 50,
        desc: pokemon.name
      }
    } else if (getPokemonEffectiveness(pokemon, ctx.defendingPokemon) < 1) {
      return {
        option: i,
        weight: 1,
        desc: pokemon.name
      }
    } else {
      return {
        option: i,
        weight: 10,
        desc: pokemon.name
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

export function getCountersToEnemy(enemy: Pokemon, team: Pokemon[], current: number, checkHP: boolean = false): number[] {
  const counters = []
  for (let i = 0; i < team.length; i++) {
    const teamMember = team[i]
    if (teamMember.hp > 0 && isCounter(enemy, teamMember) && i !== current) {
      if (!checkHP || teamMember.hp > (teamMember.startingHP * .8)) {
        counters.push(i)
      }
    }
  }
  return counters
}

export function isCounter(enemy: Pokemon, teamMember: Pokemon): boolean {
  const hasPokemonTypeAdvantage = getPokemonEffectiveness(teamMember, enemy) > 1
  let hasSuperEffectiveMove = false
  for (const move of teamMember.moves) {
    if (getTypeEffectiveness(move.type, enemy.types) > 1) {
      hasSuperEffectiveMove = true
      break
    }
  }
  return hasPokemonTypeAdvantage && hasSuperEffectiveMove
} 