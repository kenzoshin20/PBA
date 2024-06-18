import { BattleEvent } from "./battle-event.js"
import { roundDamage } from "./damage.js"
import { Player } from "./player.js"
import { Pokemon } from "./pokemon.js"


export function heal(pokemon: Pokemon, player: Player, amount: number, battleEvents: BattleEvent[]) {
  const healAmount = roundDamage(amount)
  const oldHP = pokemon.hp
  const newHP = oldHP + healAmount > pokemon.startingHP ? pokemon.startingHP : oldHP + healAmount
  pokemon.hp = newHP
  if (newHP !== oldHP) {
    battleEvents.push({
      type: 'HEALTH_CHANGE',
      newHP: newHP,
      oldHP: oldHP,
      totalHP: pokemon.startingHP,
      playerName: player.name
    })
  }
}