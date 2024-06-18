import { BattleEvent } from "./battle-event"
import { Player } from "./player"
import { Pokemon } from "./pokemon.js"
import { handleStageChange } from "./stage-change.js"
import { StageStat } from "./stages.js"

export function download(pokemon: Pokemon, player: Player, otherPokemon: Pokemon, otherPlayer: Player, battleEvents: BattleEvent[]) {
    battleEvents.push({
        type: 'DISPLAY_MESSAGE',
        message: `${pokemon.name} downloaded data!`
    })
    let enemyDefense = otherPokemon.defense
    let enemySpecialDefense = otherPokemon.specialDefense
    let stat: StageStat = enemyDefense < enemySpecialDefense ? 'attack' : 'specialAttack'
    handleStageChange(pokemon, player, stat, 1, battleEvents)
}