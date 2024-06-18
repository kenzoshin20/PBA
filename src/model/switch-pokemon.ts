import { logDebug, logHealthOnSwitch } from "../util/logger.js";
import { Random } from "../util/random.js";
import { SelectPokemonDetails } from "./battle-event.js";
import { Battle } from "./battle.js";
import { calculateSpikesDamagePercent, calculateStealthRockDamagePercent, roundDamage, takeDamage } from "./damage.js";
import { download } from "./download.js";
import { handleFaint } from "./faint.js";
import { heal } from "./heal.js";
import { getActivePokemonForPlayer, Player } from "./player.js";
import { isRaised, modifyStage, Pokemon, resetStats } from "./pokemon.js";
import { handleStageChange } from "./stage-change.js";
import { getStageChangeMsg } from "./stages.js";
import { transform } from "./transform.js";
import { DEFAULT_WEATHER } from "./weather.js";

const random = new Random()

export function handleSelectPokemon(player: Player, details: SelectPokemonDetails, battle: Battle) {
    const oldPokemon = player.team[player.activePokemonIndex]
    const oldPokemonName = oldPokemon.name
    player.activePokemonIndex = details.pokemonIndex
    const pokemon = player.team[player.activePokemonIndex]
    const pokemonName = pokemon.name
    const otherPlayer = battle.getOtherPlayer(player)
    const enemyPokemon = getActivePokemonForPlayer(otherPlayer)
    logDebug(`${player.name} selected ${pokemonName}`)
    if (battle.battleState !== 'SELECTING_FIRST_POKEMON' && oldPokemon.hp > 0) {
        handlePokemonSwitchOut(oldPokemon, player, battle)
        const switchMessage = random.randomPick([
            `${oldPokemonName}, come back!`,
            `${oldPokemonName}, switch out!`
        ])
        battle.events.push({
            type: 'DISPLAY_MESSAGE',
            forPlayerName: player.name,
            message: switchMessage,
            lengthOfPause: 'SHORTER'
        })
        battle.events.push({
            type: 'DISPLAY_MESSAGE',
            forPlayerName: battle.getOtherPlayer(player).name,
            message: `${player.name} withdrew ${oldPokemonName}!`,
            lengthOfPause: 'SHORTER'
        })
        battle.events.push({
            type: 'WITHDRAW',
            playerName: player.name
        })
        if (enemyPokemon.bindingMoveName) {
            battle.events.push({
                type: 'DISPLAY_MESSAGE',
                message: `${enemyPokemon.name} is no longer bound by ${enemyPokemon.bindingMoveName}!`,
                referencedPlayerName: otherPlayer.name
            })
            enemyPokemon.bindingMoveName = null
            enemyPokemon.remainingBindTurns = 0
        }
    }
    const deployMessage = random.randomPick([
        `Go! ${pokemonName}!`,
        `${pokemonName}, I choose you!`
    ])
    battle.events.push({
        type: 'DISPLAY_MESSAGE',
        forPlayerName: player.name,
        message: deployMessage,
        lengthOfPause: 'SHORTER'
    })
    battle.events.push({
        type: 'DISPLAY_MESSAGE',
        forPlayerName: battle.getOtherPlayer(player).name,
        message: `${player.name} sent out ${pokemonName}!`,
        lengthOfPause: 'SHORTER'
    })
    battle.events.push({
        type: 'DEPLOY',
        playerName: player.name,
        pokemonIndex:details.pokemonIndex
    })
    logHealthOnSwitch(getActivePokemonForPlayer(player), player)
    handleEntryHazards(player, battle)
    handleSwitchInAbilities(pokemon, player, enemyPokemon, otherPlayer, battle)
    if (pokemon.hp <= 0) {
      handleFaint(player, pokemon, battle)
    }
}

export function handleForceSwitch(player: Player, newPokemonIndex: number, battle: Battle, message: string) {
    
    // Reset the old Pokemon
    const oldPokemon = player.team[player.activePokemonIndex]
    handlePokemonSwitchOut(oldPokemon, player, battle)

    player.activePokemonIndex = newPokemonIndex
    const pokemon = player.team[player.activePokemonIndex]
    const otherPlayer = battle.getOtherPlayer(player)
    const enemyPokemon = getActivePokemonForPlayer(otherPlayer)
    battle.events.push({
        type: 'WITHDRAW',
        playerName: player.name
    })
    battle.events.push({
        type: 'DISPLAY_MESSAGE',
        referencedPlayerName: player.name,
        message: message
    })
    if (enemyPokemon.bindingMoveName) {
        battle.events.push({
            type: 'DISPLAY_MESSAGE',
            message: `${enemyPokemon.name} is no longer bound by ${enemyPokemon.bindingMoveName}!`,
            referencedPlayerName: otherPlayer.name
        })
        enemyPokemon.bindingMoveName = null
        enemyPokemon.remainingBindTurns = 0
    }
    battle.events.push({
        type: 'DEPLOY',
        playerName: player.name,
        pokemonIndex: newPokemonIndex
    })
    logHealthOnSwitch(getActivePokemonForPlayer(player), player)
    handleEntryHazards(player, battle)
    handleSwitchInAbilities(pokemon, player, enemyPokemon, otherPlayer, battle)
    if (pokemon.hp <= 0) {
      handleFaint(player, pokemon, battle)
    }
}

function handlePokemonSwitchOut(pokemon: Pokemon, player: Player, battle: Battle) {
    resetStats(pokemon)
    pokemon.activeTurnCount = 0
    pokemon.confused = false
    pokemon.remainingConfusedTurns = 0
    pokemon.movesUsed[0] = false
    pokemon.movesUsed[1] = false
    pokemon.movesUsed[2] = false
    pokemon.movesUsed[3] = false
    pokemon.hasLeechSeed = false
    pokemon.attackTypeBuff = null
    pokemon.isBladeForm = false
    pokemon.isSlackingOff = false
    pokemon.consecutiveProtectCount = 0
    if (pokemon.ability?.healOnSwitch) {
        heal(pokemon, player, pokemon.startingHP / 3, battle.events)
    }
    if (pokemon.ability?.removeStatusOnSwitch) {
        pokemon.nonVolatileStatusCondition = undefined
        battle.events.push({
            type: 'STATUS_CHANGE',
            newStatus: null,
            playerName: player.name
        })
    }
}

function handleEntryHazards(player: Player, battle: Battle) {
    const enteringPokemon = getActivePokemonForPlayer(player)

    if (player.hasStickyWeb && !isRaised(enteringPokemon)) {
      battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${enteringPokemon.name} was caught in a sticky web!`,
        referencedPlayerName: player.name
      })
      modifyStage(enteringPokemon, 'speed', -1)
      const actualChange = modifyStage(enteringPokemon, 'speed', -1)
      const message = getStageChangeMsg(enteringPokemon, 'speed', -1, actualChange)
      battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: message,
        referencedPlayerName: player.name
      })
    }

    if (player.hasStealthRock) {
      battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `The pointed stones dug into ${enteringPokemon.name}!`,
        forPlayerName: player.name
      })
      battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `The pointed stones dug into the enemy ${enteringPokemon.name}!`,
        forPlayerName: battle.getOtherPlayer(player).name
      })
      const damagePercent = calculateStealthRockDamagePercent(enteringPokemon)
      const damage = roundDamage(enteringPokemon.startingHP * damagePercent)
      takeDamage(player, enteringPokemon, damage, battle.events)
    }

    if (player.spikeLayerCount > 0 && !isRaised(enteringPokemon)) {
      battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${enteringPokemon.name} was hurt by the spikes!`,
        referencedPlayerName: player.name
      })
      const damagePercent = calculateSpikesDamagePercent(player.spikeLayerCount)
      const damage = roundDamage(enteringPokemon.startingHP * damagePercent)
      takeDamage(player, enteringPokemon, damage, battle.events)
    }

    if (player.toxicSpikeLayerCount > 0 && !isRaised(enteringPokemon) && !enteringPokemon.types.includes('POISON') && !enteringPokemon.nonVolatileStatusCondition) {
      if (player.toxicSpikeLayerCount === 1) {
        battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${enteringPokemon.name} was poisoned by the spikes!`,
          referencedPlayerName: player.name
        })
        enteringPokemon.nonVolatileStatusCondition = 'POISONED'
        battle.events.push({
          type: 'STATUS_CHANGE',
          newStatus: 'POISONED',
          playerName: player.name
        })
      } else {
        battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `${enteringPokemon.name} was badly poisoned by the spikes!`,
          referencedPlayerName: player.name
        })
        enteringPokemon.nonVolatileStatusCondition = 'BADLY POISONED'
        battle.events.push({
          type: 'STATUS_CHANGE',
          newStatus: 'BADLY POISONED',
          playerName: player.name
        })
      }
    }

  }

function handleSwitchInAbilities(pokemonSwitchingIn: Pokemon, player: Player, enemyPokemon: Pokemon, otherPlayer: Player, battle: Battle) {
    if (pokemonSwitchingIn.ability?.transformIntoTarget && !enemyPokemon.ability?.transformIntoTarget && battle.battleState !== 'SELECTING_FIRST_POKEMON') {
        transform(pokemonSwitchingIn, player, enemyPokemon, battle.events)
    }
    if (pokemonSwitchingIn.ability?.lowerEnemyStatOnSwitchIn && battle.battleState !== 'SELECTING_FIRST_POKEMON') {
        const stat = pokemonSwitchingIn.ability.lowerEnemyStatOnSwitchIn.stat
        battle.events.push({
            type: 'DISPLAY_MESSAGE',
            message: `${pokemonSwitchingIn.name} intimidated ${enemyPokemon.name}!`
        })
        handleStageChange(enemyPokemon, otherPlayer, stat, -1, battle.events)
    }
    if (pokemonSwitchingIn.ability?.raiseAttackOrSpecialAttackOnSwitchIn && battle.battleState !== 'SELECTING_FIRST_POKEMON') {
      download(pokemonSwitchingIn, player, enemyPokemon, otherPlayer, battle.events)
    }
    if (pokemonSwitchingIn.ability?.enemyUsesExtraPP) {
        battle.events.push({
            type: 'DISPLAY_MESSAGE',
            message: `${pokemonSwitchingIn.name} is exerting its pressure!`,
            referencedPlayerName: player.name
        })
    }
    if (pokemonSwitchingIn.ability?.applyWeatherOnSwitchIn && battle.weather != pokemonSwitchingIn.ability?.applyWeatherOnSwitchIn) {
      battle.applyWeather(pokemonSwitchingIn.ability.applyWeatherOnSwitchIn)
    }
    if (pokemonSwitchingIn.ability?.suppressWeather && battle.weather !== DEFAULT_WEATHER) {
      battle.events.push({
        type: 'DISPLAY_MESSAGE',
        referencedPlayerName: player.name,
        message: `${pokemonSwitchingIn.name} is suppressing the effects of the weather!`
      })
    }
}