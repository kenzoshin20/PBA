import { isRaised, Pokemon } from "./pokemon.js";

export function isTrapped(pokemon: Pokemon, enemyPokemon: Pokemon) {
  const stoppedByArenaTrap = enemyPokemon.ability?.preventNonRaisedEnemySwitching && !isRaised(pokemon)
  const stoppedByShadowTag = enemyPokemon.ability?.preventNonGhostEnemySwitching && !pokemon.types.includes('GHOST')
  return pokemon.bindingMoveName != null || stoppedByArenaTrap || stoppedByShadowTag
}