import { Battle } from "./battle.js"
import { getActivePokemonForPlayer, Player } from "./player.js"
import { Pokemon } from "./pokemon.js"
import { handleGameOver } from "./game-over.js"

export function handleFaint(player: Player, pokemon: Pokemon, battle: Battle) {
    if (battle.requiredToSwitch.includes(player.name) || battle.winnerName != null) {
        return
    }
    battle.events.push({
      type: 'DISPLAY_MESSAGE',
      message: `${pokemon.name} fainted!`,
      referencedPlayerName: player.name
    })
    battle.events.push({
      type: 'FAINT',
      playerName: player.name
    })
    battle.requiredToSwitch.push(player.name)

    pokemon.bindingMoveName = null
    pokemon.remainingBindTurns = 0
    const otherPlayer = battle.getOtherPlayer(player)
    const otherPokemon = getActivePokemonForPlayer(otherPlayer)
    if (otherPokemon.bindingMoveName) {
      otherPokemon.bindingMoveName = null
      otherPokemon.remainingBindTurns = 0
      battle.events.push({
        type: 'BIND_CHANGE',
        newBindingMoveName: null,
        playerName: otherPlayer.name
      })
    }

    if (playerHasLost(player)) {
      handleGameOver(otherPlayer, player, battle)
    }
  }

  function playerHasLost(player: Player): boolean {
    return player.team.find(mon => mon.hp > 0) === undefined
  }