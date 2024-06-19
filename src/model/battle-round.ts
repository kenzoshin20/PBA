import { Random } from "../util/random.js";
import { Battle } from "./battle.js";
import { PlayerActionEvent, SelectMoveDetails } from "./battle-event.js";
import { Combat } from "./combat.js";
import { getActivePokemonForPlayer, Player } from "./player.js";
import { logDebug, logInfo } from "../util/logger.js";
import { isAlive, modifyStage, Pokemon } from "./pokemon.js";
import { getStageMultiplier, StageStat } from "./stages.js";
import { roundDamage, takeDamage } from "./damage.js";
import { transform } from "./transform.js";
import { buildPokemon } from "../data/pokemon-data.js";
import { createMultiPlayerBattle, createRematch } from "./create-battle.js";
import { heal } from "./heal.js";
import { handleStageChange } from "./stage-change.js";
import { handleSelectPokemon } from "./switch-pokemon.js";
import { DEFAULT_WEATHER, isWeatherSuppressed, weatherDescriptions } from "./weather.js";
import { download } from "./download.js";
import { leagueTrainers } from "./league.js";
import { buildMove } from "./move.js";
import { moves } from "../data/move-data.js";
import { handleFaint } from "./faint.js";
import { arenaTrainers } from "./arena.js";

export class BattleRounds {
  new(battle: Battle, playerActions: PlayerActionEvent[]) {
    return new BattleRound(battle, playerActions)
  }
}

export class BattleRound {
  random: Random = new Random()

  battle: Battle
  playerActions: PlayerActionEvent[]
  combat: Combat

  constructor(battle: Battle, playerActions: PlayerActionEvent[]) {
    this.battle = battle
    this.playerActions = playerActions
    this.combat = new Combat(battle)
  }

  start() {
    logInfo(`Starting battle round`)
    this.battle.requiredToSwitch = []
    const sortedActions = this.sortActions(this.playerActions)
    if (sortedActions[0].details.type === 'REQUEST_REMATCH' && sortedActions[1].details.type === 'REQUEST_REMATCH') {
      // Both players requested a rematch
      this.battle.rematchRequested = true
      return
    }
    for (const [index, action] of sortedActions.entries()) {
      if (action.details.type === 'NOTHING') {
        continue
      }
      let actingPlayer = this.battle.getPlayer(action.playerName)
      if (action.details.type === 'SELECT_TEAM') {
        this.handleSelectTeam(action)
      } else if (action.details.type === 'SELECT_POKEMON') {
        handleSelectPokemon(actingPlayer, action.details, this.battle)
      } else if (action.details.type === 'SELECT_MOVE') {
        const nextAction: PlayerActionEvent | undefined = sortedActions[index + 1]
        let nextMove = null
        if (nextAction?.details?.type === 'SELECT_MOVE') {
          const moveIndex = nextAction.details.moveIndex
          nextMove = getActivePokemonForPlayer(this.battle.getOtherPlayer(actingPlayer)).moves[moveIndex]
        }
        this.combat.useMove(actingPlayer, action.details.moveIndex, nextMove, action.details.struggle)
      } else {
        throw new Error('Unexpected action details type: ' + action.details.type)
      }
      
      if (action.details.type !== 'SELECT_POKEMON' && action.details.type !== 'SELECT_TEAM') {
        const actingPokemon = actingPlayer.team[actingPlayer.activePokemonIndex]
        const otherPlayer = this.battle.getOtherPlayer(actingPlayer)
        const otherPlayerPokemon = otherPlayer.team[otherPlayer.activePokemonIndex]
        if (actingPokemon.hp <= 0) {
          // Attacking pokemon has fainted
          handleFaint(actingPlayer, actingPokemon, this.battle)
        }
        if (otherPlayerPokemon.hp <= 0) {
          // Defending pokemon has fainted
          handleFaint(otherPlayer, otherPlayerPokemon, this.battle)
        }
        if (this.hasEitherPokemonFainted()) {
          // If either Pokemon has fainted, end the round
          break
        }
      }
      
    }

    if (this.battle.battleState !== 'GAME_OVER' && 
        this.battle.battleState !== 'SELECTING_TEAM' && 
        this.battle.battleState !== 'SELECTING_FIRST_POKEMON' && 
        this.battle.battleState !== 'SELECTING_REQUIRED_SWITCH') {
      this.battle.turnCount++
      this.handleEndOfRoundEffects()

      for (const player of this.battle.players) {
        const activePokemon = getActivePokemonForPlayer(player)
        if (activePokemon.hp <= 0) {
          handleFaint(player, activePokemon, this.battle)
        }
      }
    }

    if (this.battle.battleState === 'SELECTING_FIRST_POKEMON') {
      const player1  = this.battle.players[0]
      const pokemon1 = player1.team[player1.activePokemonIndex]
      const player2 = this.battle.players[1]
      const pokemon2 = player2.team[player2.activePokemonIndex]
      this.handleFirstSightAbilities(pokemon1, player1, pokemon2, player2)
      this.handleFirstSightAbilities(pokemon2, player2, pokemon1, player1)
    }

    if (this.battle.battleState !== 'GAME_OVER') {
      if (this.hasEitherPokemonFainted()) {
        this.battle.battleState = 'SELECTING_REQUIRED_SWITCH'
      } else if (this.battle.battleState === 'SELECTING_TEAM') {
        this.battle.battleState = 'SELECTING_FIRST_POKEMON'
      } else {
        this.battle.battleState = 'SELECTING_ACTIONS'
      }
    }
  }

  sortActions(playerActions: PlayerActionEvent[]): PlayerActionEvent[] {
    if (playerActions[0].details.type === 'NOTHING') {
      return [playerActions[1], playerActions[0]]
    } else if (playerActions[1].details.type === 'NOTHING') {
      return [playerActions[0], playerActions[1]]
    }

    if (this.battle.battleState === 'SELECTING_TEAM' || this.battle.battleState === 'GAME_OVER') {
      // If this is SELECTING_TEAM or GAME_OVER then the order doesn't matter
      return playerActions
    }

    let sortedActions = []
    if (playerActions[0].details.type === 'SELECT_POKEMON' && playerActions[1].details.type === 'SELECT_POKEMON') {
      // Both actions are selecting pokemon so sort by the new pokemon speed
      const player1 = this.battle.getPlayer(playerActions[0].playerName)
      const newPokemon1 = player1.team[playerActions[0].details.pokemonIndex]
      const player2 = this.battle.getPlayer(playerActions[1].playerName)
      const newPokemon2 = player2.team[playerActions[1].details.pokemonIndex]
      if (newPokemon1.speed > newPokemon2.speed) {
        sortedActions = [playerActions[0], playerActions[1]]
      } else if (newPokemon2.speed > newPokemon1.speed) {
        sortedActions = [playerActions[1], playerActions[0]]
      } else {
        // Speed tie means random order
        sortedActions = this.random.shuffle([playerActions[0], playerActions[1]])
      }
    } else if (playerActions[0].details.type === 'SELECT_POKEMON') {
      sortedActions = [playerActions[0], playerActions[1]]
    } else if (playerActions[1].details.type === 'SELECT_POKEMON') {
      sortedActions = [playerActions[1], playerActions[0]]
    } else {
      // Both are actions are moves
      return this.sortMoveActions(playerActions)
    }
    logDebug(`Sorted actions, order is ${sortedActions[0].playerName} then ${sortedActions[1].playerName}`)
    return sortedActions
  }

  sortMoveActions(playerActions: PlayerActionEvent[]): PlayerActionEvent[] {

    const action1 = playerActions[0]
    const player1 = this.battle.getPlayer(action1.playerName)
    const pokemon1 = player1.team[player1.activePokemonIndex]
    const details1 = action1.details as SelectMoveDetails
    const move1 = pokemon1.moves[details1.moveIndex]
    let move1Priority = move1.priority
    if (pokemon1.ability?.increasePriorityOfStatusMoves && move1.category === 'STATUS') {
      move1Priority++
    }

    const action2 = playerActions[1]
    const player2 = this.battle.getPlayer(action2.playerName)
    const pokemon2 = player2.team[player2.activePokemonIndex]
    const details2 = action2.details as SelectMoveDetails
    const move2 = pokemon2.moves[details2.moveIndex]
    let move2Priority = move2.priority
    if (pokemon2.ability?.increasePriorityOfStatusMoves && move2.category === 'STATUS') {
      move2Priority++
    }

    if (move1Priority > move2Priority) {
      return [action1, action2]
    } else if (move2Priority > move1Priority) {
      return [action2, action1]
    } else {
      const weatherSuppressed = isWeatherSuppressed(pokemon1, pokemon2)
      let speed1 = this.getSpeed(pokemon1, weatherSuppressed)
      let speed2 = this.getSpeed(pokemon2, weatherSuppressed)
      if (speed1 > speed2) {
        return [action1, action2]
      } else if (speed2 > speed1) {
        return [action2, action1]
      } else {
        return this.random.coinFlip() ? [action1, action2] : [action2, action1]
      }
    }

  }

  getSpeed(pokemon: Pokemon, weatherSuppressed: boolean) {
    let speed = pokemon.speed * getStageMultiplier('speed', pokemon.stages.speed)
    if (pokemon.nonVolatileStatusCondition === 'PARALYZED') {
      speed = speed * .5
    }
    if (!weatherSuppressed && pokemon.ability?.doubleSpeedDuringWeather === this.battle.weather) {
      speed = speed * 2
    }
    return speed
  }

  handleSelectTeam(playerAction: PlayerActionEvent) {
    if (playerAction.details.type === 'SELECT_TEAM') {
      logDebug(`${playerAction.playerName} selected a team`)
      const team = playerAction.details.pokemonNames.map(pokemonName => buildPokemon(pokemonName))
      const player = this.battle.getPlayer(playerAction.playerName)
      player.team = team
      this.battle.events.push({
        type: 'TEAM_SELECTED',
        playerName: player.name,
        team: team,
        pokemonNames: playerAction.details.pokemonNames
      })
  
      if (this.battle.battleSubType === 'PRACTICE' && playerAction.details.enemyPokemonNames) {
        logDebug(`${playerAction.playerName} selected the enemy team`)
        const enemyTeam = playerAction.details.enemyPokemonNames.map(pokemonName => buildPokemon(pokemonName))
        const enemyPlayer = this.battle.getOtherPlayer(player)
        enemyPlayer.team = enemyTeam
        this.battle.events.push({
          type: 'TEAM_SELECTED',
          playerName: enemyPlayer.name,
          team: enemyTeam,
          pokemonNames: playerAction.details.enemyPokemonNames
        })
      } else if (this.battle.battleSubType === 'LEAGUE' && this.battle.leagueLevel != null) {
        logDebug(`Building league trainer team`)
        const leagueTrainer = leagueTrainers[this.battle.leagueLevel]
        const enemyTeam = leagueTrainer.team
        const enemyPlayer = this.battle.getOtherPlayer(player)
        enemyPlayer.team = enemyTeam
        if (leagueTrainer.leads?.length) {
          enemyPlayer.leadPokemonIndex = this.random.randomPick(leagueTrainer.leads)
        }
        this.battle.events.push({
          type: 'TEAM_SELECTED',
          playerName: enemyPlayer.name,
          team: enemyTeam,
          pokemonNames: enemyTeam.map(p => p.name)
        })
      } else if (this.battle.battleSubType === 'ARENA') {
        const enemyPlayer = this.battle.getOtherPlayer(player)
        const arenaTrainer = arenaTrainers.find(t => t.name === enemyPlayer.name)
        if (!arenaTrainer) {
          throw new Error('No arena trainer with name: ' + enemyPlayer.name)
        }
        const enemyTeam = arenaTrainer.team
        enemyPlayer.team = enemyTeam
        if (arenaTrainer.leads?.length) {
          enemyPlayer.leadPokemonIndex = this.random.randomPick(arenaTrainer.leads)
        }
        this.battle.events.push({
          type: 'TEAM_SELECTED',
          playerName: enemyPlayer.name,
          team: enemyTeam,
          pokemonNames: enemyTeam.map(p => p.name)
        })
      }

    } else {
      throw new Error('Passed playerAction that is not SELECT_TEAM to selectTeam method')
    }
  }

  hasEitherPokemonFainted() {
    return this.battle.players[0].team[this.battle.players[0].activePokemonIndex].hp <= 0 || 
      this.battle.players[1].team[this.battle.players[1].activePokemonIndex].hp <= 0
  }

  handleFirstSightAbilities(pokemon: Pokemon, player: Player, otherPokemon: Pokemon, otherPlayer: Player) {
    if (pokemon.ability?.lowerEnemyStatOnSwitchIn) {
      const stat = pokemon.ability.lowerEnemyStatOnSwitchIn.stat
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${pokemon.name} intimidated ${otherPokemon.name}!`
      })
      handleStageChange(otherPokemon, otherPlayer, stat, -1, this.battle.events)
    }
    if (pokemon.ability?.raiseAttackOrSpecialAttackOnSwitchIn) {
      download(pokemon, player, otherPokemon, otherPlayer, this.battle.events)
    }
    if (pokemon.ability?.transformIntoTarget && !otherPokemon.ability?.transformIntoTarget) {
      transform(pokemon, player, otherPokemon, this.battle.events)
    }
    if (pokemon.ability?.suppressWeather && this.battle.weather !== DEFAULT_WEATHER) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        referencedPlayerName: player.name,
        message: `${pokemon.name} is suppressing the effects of the weather!`
      })
    }
  }

  handleEndOfRoundEffects() {
    const player1  = this.battle.players[0]
    const pokemon1 = player1.team[player1.activePokemonIndex]

    const player2 = this.battle.players[1]
    const pokemon2 = player2.team[player2.activePokemonIndex]

    this.handleEndOfRoundForPlayer(player1, player2)
    this.handleEndOfRoundForPokemon(pokemon1, player1, pokemon2, player2)

    this.handleEndOfRoundForPlayer(player2, player1)
    this.handleEndOfRoundForPokemon(pokemon2, player2, pokemon1, player1)

    const weatherSuppressed = isWeatherSuppressed(pokemon1, pokemon2)
    if (pokemon1.speed > pokemon2.speed) {
      this.handleWeatherDamage(pokemon1, player1, weatherSuppressed)
      this.handleWeatherDamage(pokemon2, player2, weatherSuppressed)
    } else {
      this.handleWeatherDamage(pokemon2, player2, weatherSuppressed)
      this.handleWeatherDamage(pokemon1, player1, weatherSuppressed)
    }

    if (this.battle.remainingWeatherTurns > 0) {
      this.battle.remainingWeatherTurns--
      if (this.battle.remainingWeatherTurns === 0) {
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          message: `The weather returned to normal!`
        })
        this.battle.weather = DEFAULT_WEATHER
        this.battle.events.push({
          type: 'WEATHER_CHANGE',
          newWeather: DEFAULT_WEATHER
        })
      }
    }
  }

  handleEndOfRoundForPokemon(pokemon: Pokemon, player: Player, otherPokemon: Pokemon, otherPlayer: Player) {
    if (!isAlive(pokemon)) {
      return
    }
    pokemon.activeTurnCount++
    pokemon.flinched = false
    pokemon.protected = false
    pokemon.protectedByKingsShield = false
    if (pokemon.ability?.chanceToRemoveUserStatusAtEndOfTurn && pokemon.nonVolatileStatusCondition && this.random.roll(1/3)) {
      pokemon.nonVolatileStatusCondition = undefined
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${pokemon.name} shed its skin!`,
        referencedPlayerName: player.name
      })
      this.battle.events.push({
        type: 'STATUS_CHANGE',
        newStatus: null,
        playerName: player.name
      })
    }
    if (pokemon.nonVolatileStatusCondition === 'ASLEEP' && otherPokemon.ability?.damageSleepingEnemy) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${pokemon.name} is having a nightmare!`,
        referencedPlayerName: player.name
      })
      const damage = pokemon.startingHP / 8
      takeDamage(player, pokemon, damage, this.battle.events)
    }
    if (pokemon.remainingSleepTurns > 0) {
      pokemon.remainingSleepTurns--
    }
    if (pokemon.remainingConfusedTurns > 0) {
      pokemon.remainingConfusedTurns--
    }
    if (pokemon.nonVolatileStatusCondition === 'BADLY POISONED') {
      pokemon.badlyPoisonedTurns++
    }
    if (pokemon.remainingBindTurns > 0) {
      pokemon.remainingBindTurns--
    }
    if (pokemon.hasLeechSeed && isAlive(otherPokemon) && isAlive(pokemon)) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        referencedPlayerName: player.name,
        message: `${pokemon.name} health was sapped by Leech Seed!`
      })
      const damageAmount = pokemon.startingHP / 8
      takeDamage(player, pokemon, damageAmount, this.battle.events)
      const healAmount = roundDamage(damageAmount)
      const oldHP = otherPokemon.hp
      const newHP = oldHP + healAmount > otherPokemon.startingHP ? otherPokemon.startingHP : oldHP + healAmount
      otherPokemon.hp = newHP
      this.battle.events.push({
        type: 'HEALTH_CHANGE',
        newHP: newHP,
        oldHP: oldHP,
        totalHP: otherPokemon.startingHP,
        playerName: otherPlayer.name
      })
    }
    if (pokemon.roosted && pokemon.preRoostTypes?.length) {
      pokemon.types = pokemon.preRoostTypes
    }
    pokemon.roosted = false
    
    if (pokemon.ability?.speedBoost && pokemon.stages.speed < 6) {
      modifyStage(pokemon, 'speed', 1)
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${pokemon.name}'s speed was boosted!`,
        referencedPlayerName: player.name
      })
    }
  }

  handleEndOfRoundForPlayer(player: Player, otherPlayer: Player) {
    if (player.remainingReflectTurns > 0) {
      player.remainingReflectTurns--
      if (player.remainingReflectTurns === 0) {
        this.battle.pushHazardsChangeEvent(player)
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          forPlayerName: player.name,
          message: `Your team's Reflect faded!`
        })
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          forPlayerName: otherPlayer.name,
          message: `The enemy team's Reflect faded!`
        })
      }
    }
    
    if (player.remainingLightScreenTurns > 0) {
      player.remainingLightScreenTurns--
      if (player.remainingLightScreenTurns === 0) {
        this.battle.pushHazardsChangeEvent(player)
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          forPlayerName: player.name,
          message: `Your team's Light Screen faded!`
        })
        this.battle.events.push({
          type: 'DISPLAY_MESSAGE',
          forPlayerName: otherPlayer.name,
          message: `The enemy team's Light Screen faded!`
        })
      }
    }
  }

  handleWeatherDamage(pokemon: Pokemon, player: Player, weatherSuppressed: boolean) {
    if (weatherSuppressed || !isAlive(pokemon)) {
      return
    }
    if (this.battle.weather === 'SANDSTORM' && 
        !pokemon.types.includes('ROCK') && 
        !pokemon.types.includes('STEEL') && 
        !pokemon.types.includes('GROUND') &&
        pokemon.ability?.healDuringWeather !== this.battle.weather) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${pokemon.name} was damaged by the sandstorm!`,
        referencedPlayerName: player.name,
        lengthOfPause: 'SHORTER'
      })
      const damage = pokemon.startingHP / 16
      takeDamage(player, pokemon, damage, this.battle.events)
    }
    if (this.battle.weather === 'HAIL' && 
        !pokemon.types.includes('ICE') &&
        pokemon.ability?.healDuringWeather !== this.battle.weather) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${pokemon.name} was damaged by the hail!`,
        referencedPlayerName: player.name,
        lengthOfPause: 'SHORTER'
      })
      const damage = pokemon.startingHP / 16
      takeDamage(player, pokemon, damage, this.battle.events)
    }
    if (pokemon.ability?.healDuringWeather === this.battle.weather) {
      this.battle.events.push({
        type: 'DISPLAY_MESSAGE',
        message: `${pokemon.name} was healed by the ${weatherDescriptions[this.battle.weather]}!`,
        referencedPlayerName: player.name,
        lengthOfPause: 'SHORTER'
      })
      const healAmount = pokemon.startingHP / 16
      heal(pokemon, player, healAmount, this.battle.events)
    }
  }

}