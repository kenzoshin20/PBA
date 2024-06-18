import { selectAction } from "../ai/select-action.js";
import { buildPokemon } from "../data/pokemon-data.js";
import { logDebug, logInfo, logNewEvents } from "../util/logger.js";
import { Random } from "../util/random.js";
import { BattleEvent, PlayerActionEvent, SelectPokemonDetails } from "./battle-event.js";
import { BattleRound, BattleRounds } from "./battle-round.js";
import { getActivePokemonForPlayer, Player } from "./player.js";
import { isAlive } from "./pokemon.js";
import { Weather, weatherDescriptions } from "./weather.js";

export type BattleState = 'SELECTING_TEAM' | 'SELECTING_FIRST_POKEMON' | 'SELECTING_ACTIONS' | 
  'SELECTING_REQUIRED_SWITCH' | 'GAME_OVER' | 'GAME_OVER_AND_REMATCH_REQUESTED'

export type BattleType = 'SINGLE_PLAYER' | 'MULTI_PLAYER'
export type BattleSubType = 'ARENA' | 'LEAGUE' | 'PRACTICE' | 'CHALLENGE'

export interface BattleData {
  battleState?: BattleState
  battleId?: string
  battleType: BattleType
  battleSubType: BattleSubType
  leagueLevel?: number
  players: Player[]
  events?: BattleEvent[]
  pendingPlayerAction?: PlayerActionEvent | null | undefined
  requiredToSwitch?: string[]
  rematchRequested?: boolean
  weather: Weather
  remainingWeatherTurns: number
  winnerName?: string
  rewards: number[]
  turnCount: number
}

export class Battle {
  
  battleRounds: BattleRounds = new BattleRounds()
  random: Random = new Random()

  battleState: BattleState
  battleId: string
  battleType: BattleType
  battleSubType: BattleSubType
  leagueLevel?: number
  players: Player[]
  events: BattleEvent[]
  pendingPlayerAction: PlayerActionEvent | null | undefined
  requiredToSwitch: string[]
  rematchRequested?: boolean
  weather: Weather
  remainingWeatherTurns: number
  winnerName?: string
  rewards: number[]
  turnCount: number

  constructor(battleData: BattleData) {
    this.battleType = battleData.battleType || 'MULTI_PLAYER'
    this.battleSubType = battleData.battleSubType || 'CHALLENGE'
    this.leagueLevel = battleData.leagueLevel
    this.battleState = battleData.battleState || 'SELECTING_TEAM'
    this.battleId = battleData.battleId || this.random.generateId()
    this.players = battleData.players || []
    this.events = battleData.events || []
    this.pendingPlayerAction = battleData.pendingPlayerAction
    this.requiredToSwitch = battleData.requiredToSwitch || []
    this.rematchRequested = battleData.rematchRequested
    this.weather = battleData.weather
    this.remainingWeatherTurns = battleData.remainingWeatherTurns
    this.rewards = battleData.rewards
    this.winnerName = battleData.winnerName
    this.turnCount = battleData.turnCount
  }

  getData(): BattleData {
    return {
      battleState: this.battleState,
      battleId: this.battleId,
      battleType: this.battleType,
      battleSubType: this.battleSubType,
      leagueLevel: this.leagueLevel,
      players: this.players,
      events: this.events,
      pendingPlayerAction: this.pendingPlayerAction,
      requiredToSwitch: this.requiredToSwitch,
      rematchRequested: this.rematchRequested,
      weather: this.weather,
      remainingWeatherTurns: this.remainingWeatherTurns,
      rewards: this.rewards,
      winnerName: this.winnerName,
      turnCount: this.turnCount,
    }
  }

  getPlayer(name: string): Player {
    const player = this.players.find(player => player.name === name)
    if (player) {
      return player
    } else {
      throw new Error(`No player named ${name} in battleId ${this.battleId}`)
    }
  }
  
  getOtherPlayer(player: Player): Player {
    return player === this.players[0] ? this.players[1] : this.players[0]
  }

  getComputerPlayer(): Player {
    const player = this.players.find(player => player.type === 'COMPUTER')
    if (player) {
      return player
    } else {
      throw new Error(`No computer player in battleId ${this.battleId}`)
    }
  }

  receivePlayerAction(playerAction: PlayerActionEvent) {
    logInfo(`Received player action from ${playerAction.playerName}: ${playerAction.details.type}`)

    this.validatePlayerAction(playerAction)
  
    if (playerAction.details.type === 'QUIT_BATTLE') {
      this.battleState = 'GAME_OVER'
      return
    }

    if (this.battleType === 'SINGLE_PLAYER' && !this.pendingPlayerAction) {
      if (this.battleState === 'SELECTING_TEAM') {
        this.pendingPlayerAction = {
          type: 'PLAYER_ACTION',
          playerName: this.getComputerPlayer().name,
          details: {
            type: 'NOTHING'
          }
        }
      } else if (playerAction.details.type === 'REQUEST_REMATCH') {
        this.pendingPlayerAction = {
          type: 'PLAYER_ACTION',
          playerName: this.getComputerPlayer().name,
          details: {
            type: 'REQUEST_REMATCH'
          }
        }
      } else {
        this.pendingPlayerAction = selectAction(this)
        logDebug('AI selected action: ' + JSON.stringify(this.pendingPlayerAction))
      }
    }

    if (this.requiredToSwitch.includes(playerAction.playerName) && this.battleState !== 'GAME_OVER') {
      // A player that was required to switch has selected their Pokemon
      if (this.requiredToSwitch.length > 1) {
        if (this.pendingPlayerAction) {
          logDebug(`Doing both players' required switches`)
          const otherPlayerAction = this.pendingPlayerAction
          this.pendingPlayerAction = null
          this.doActions([otherPlayerAction, playerAction])
        } else {
          logDebug(`Waiting on other player to select their Pokemon since they are also required to switch`)
          this.pendingPlayerAction = playerAction
        }
      } else {
        logDebug(`Doing required switch without the other player doing an action`)
        const nothingAction: PlayerActionEvent = {
          type: 'PLAYER_ACTION',
          playerName: 'NOTHING PLAYER',
          details: {
            type: 'NOTHING'
          }
        }
        this.doActions([playerAction, nothingAction])
      }
    } else if (!this.pendingPlayerAction) {
      logDebug(`Waiting on other player to make their move`)
      this.pendingPlayerAction = playerAction
    } else {
      logDebug(`Both players have submitted their actions`)
      const otherPlayerAction = this.pendingPlayerAction
      this.pendingPlayerAction = null
      this.doActions([otherPlayerAction, playerAction])
    }

    while (this.battleState !== 'GAME_OVER' && 
        this.battleType === 'SINGLE_PLAYER' && 
        this.requiredToSwitch.length === 1 && 
        this.getPlayer(this.requiredToSwitch[0]).type === 'COMPUTER') {
      logDebug(`AI doing required switch before sending response`)
      const aiAction = selectAction(this)
      const nothingAction: PlayerActionEvent = {
        type: 'PLAYER_ACTION',
        playerName: 'NOTHING PLAYER',
        details: {
          type: 'NOTHING'
        }
      }
      this.doActions([aiAction, nothingAction])
    }
  
  }

  validatePlayerAction(playerAction: PlayerActionEvent) {
    if (this.pendingPlayerAction && this.pendingPlayerAction.playerName === playerAction.playerName) {
      throw new Error(`${playerAction.playerName} already submitted their action` )
    }
    if (!this.players.find(player => player.name === playerAction.playerName)) {
      throw new Error('Invalid playerName: ' + playerAction.playerName)
    }
    if (this.battleState === 'GAME_OVER' && playerAction.details.type !== 'REQUEST_REMATCH') {
      throw new Error('Battle has already ended')
    }
    if (playerAction.details.type === 'REQUEST_REMATCH' && this.battleState !== 'GAME_OVER') {
      throw new Error('Battle has not ended yet')
    }
    if (this.battleState === 'SELECTING_TEAM') {
      if (playerAction.details.type === 'SELECT_TEAM') {
        if (!playerAction.details.pokemonNames?.length) {
          throw new Error('Player must select Pokemon names')
        }
        if (this.battleSubType === 'PRACTICE' && !playerAction.details.enemyPokemonNames?.length) {
          throw new Error('Player must select enemy Pokemon names')
        }
      } else if (playerAction.details.type !== 'QUIT_BATTLE') {
        throw new Error('Player must select team')
      }
    } else if (playerAction.details.type === 'SELECT_TEAM') {
      throw new Error('Team has already been selected')
    }
    if ((this.battleState === 'SELECTING_FIRST_POKEMON' || (this.battleState === 'SELECTING_REQUIRED_SWITCH' && this.requiredToSwitch.includes(playerAction.playerName))) && 
        playerAction.details.type !== 'SELECT_POKEMON' && 
        playerAction.details.type !== 'QUIT_BATTLE') {
      throw new Error('Player must select Pokemon')
    }
    const player = this.getPlayer(playerAction.playerName)
    const activePokemon = getActivePokemonForPlayer(player)
    if (activePokemon?.hp <= 0 && playerAction.details.type === 'SELECT_MOVE') {
      throw new Error('Pokemon has fainted and cannot use moves')
    }
    if (this.battleState !== 'SELECTING_FIRST_POKEMON' && playerAction.details.type === 'SELECT_POKEMON' && 
      player.activePokemonIndex === playerAction.details.pokemonIndex) {
      throw new Error('Pokemon is already active')
    }
    if (playerAction.details.type === 'SELECT_POKEMON') {
      if (player.team[playerAction.details.pokemonIndex].hp <= 0) {
        throw new Error('Cannot select fainted Pokemon')
      }
      if (activePokemon.bindingMoveName != null) {
        throw new Error('Pokemon is bound and cannot switch')
      }
    }
  }

  doActions(playerActions: PlayerActionEvent[]) {
    const previousEventsSize = this.events.length
    const battleRound = this.battleRounds.new(this, playerActions)
    battleRound.start()
    const newEvents = this.events.slice(previousEventsSize, this.events.length)
    logNewEvents('Finished doing actions. New events:')
    logNewEvents(newEvents)
  }

  applyWeather(newWeather: Weather) {
    this.events.push({
      type: 'DISPLAY_MESSAGE',
      message: `The weather changed to ${weatherDescriptions[newWeather]}!`
    })
    this.events.push({
      type: 'WEATHER_CHANGE',
      newWeather: newWeather
    })
    this.weather = newWeather
    this.remainingWeatherTurns = 5

    if (this.battleState !== 'SELECTING_FIRST_POKEMON') {
      for (const player of this.players) {
        const pokemon = getActivePokemonForPlayer(player)
        if (pokemon.ability?.suppressWeather) {
          this.events.push({
            type: 'DISPLAY_MESSAGE',
            referencedPlayerName: player.name,
            message: `${pokemon.name} is suppressing the effects of the weather!`
          })
          break
        }
      }
    }

  }

  pushHazardsChangeEvent(player: Player) {
    this.events.push({
      type: 'HAZARDS_CHANGE',
      playerName: player.name,
      spikeLayerCount: player.spikeLayerCount,
      toxicSpikeLayerCount: player.toxicSpikeLayerCount,
      hasStealthRock: player.hasStealthRock,
      hasStickyWeb: player.hasStickyWeb,
      hasLightScreen: player.remainingLightScreenTurns > 0,
      hasReflect: player.remainingReflectTurns > 0
    })
  }

}