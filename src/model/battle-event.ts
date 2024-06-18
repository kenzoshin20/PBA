import { MoveAudioFile } from "../client/audio"
import { ClientState } from "../client/client-state"
import { MoveName } from "../data/move-data"
import { BattleState } from "./battle"
import { Move } from "./move"
import { MoveDefinition } from "./move-definition"
import { Player } from "./player"
import { Pokemon } from "./pokemon"
import { PokemonSpecies } from "./pokemon-species"
import { NonVolatileStatusCondition } from "./status-conditions"
import { Weather } from "./weather"

export type BattleEvent = PlayerActionEvent | PPChangeEvent | ClientStateChangeEvent |
  HealthChangeEvent | DeployEvent | DisplayMessageEvent | FaintEvent | HealthBarAnimationEvent |
  TakeDamageAnimationEvent | BattleStateChangeEvent | DeployAnimationEvent | WithdrawEvent |
  PPChangeEvent | FaintAnimationEvent | StatusChangeEvent | BindChangeEvent | TransformEvent |
  TeamSelectedEvent | RematchCreatedEvent | ShowPokemonCardEvent | ShowMoveCardEvent | HealAnimationEvent |
  SoundEffectEvent | TransformStanceChangeEvent | WeatherChangeEvent | UnlockPokemonEvent |
  RevealUnlockedPokemonEvent | GameOverEvent | HazardsChangeEvent

export interface PlayerActionEvent {
  type: 'PLAYER_ACTION',
  playerName: string
  details: PlayerActionDetails
}

export interface PPChangeEvent {
  type: 'PP_CHANGE',
  playerName: string,
  newPP: number,
  moveIndex: number,
  pokemonIndex: number
}

export interface SoundEffectEvent {
  type: 'SOUND_EFFECT',
  fileName: MoveAudioFile,
  soundType: 'MOVE' | 'MUSIC',
  stopMusic?: boolean,
  forPlayerName?: string
}

export interface HealthChangeEvent {
  type: 'HEALTH_CHANGE',
  playerName: string,
  newHP: number,
  oldHP: number,
  totalHP: number,
  directAttack?: boolean,
  playSound?: boolean
}

export interface HealthBarAnimationEvent {
  type: 'HEALTH_BAR_ANIMATION',
  playerName: string,
  newHP: number,
  oldHP: number,
  totalHP: number
}

export interface TakeDamageAnimationEvent {
  type: 'TAKE_DAMAGE_ANIMATION',
  playerName: string,
  directAttack?: boolean,
  playSound?: boolean
}

export interface HealAnimationEvent {
  type: 'HEAL_ANIMATION',
  playerName: string
}

export interface DeployEvent {
  type: 'DEPLOY',
  playerName: string,
  pokemonIndex: number
}

export interface WithdrawEvent {
  type: 'WITHDRAW',
  playerName: string
}

export interface DeployAnimationEvent {
  type: 'DEPLOY_ANIMATION',
  playerName: string
}

export interface FaintEvent {
  type: 'FAINT',
  playerName: string
}

export interface FaintAnimationEvent {
  type: 'FAINT_ANIMATION',
  playerName: string
}

export interface StatusChangeEvent {
  type: 'STATUS_CHANGE',
  newStatus: NonVolatileStatusCondition | null
  playerName: string
}

export interface BindChangeEvent {
  type: 'BIND_CHANGE',
  newBindingMoveName: string | null
  playerName: string
}

export interface DisplayMessageEvent {
  type: 'DISPLAY_MESSAGE',
  referencedPlayerName?: string, // Used to know if enemy prefix is needed
  forPlayerName?: string, // Used to show a message to only one player
  lengthOfPause?: 'NONE' | 'SHORTER'
  message: string
}

export interface TransformEvent {
  type: 'TRANSFORM',
  newPlayer: Player,
  playerName: string
  newPokemon: Pokemon
}

export interface TransformStanceChangeEvent {
  type: 'TRANSFORM_STANCE_CHANGE',
  form: 'BLADE' | 'SHIELD',
  player: Player
  newPokemon: Pokemon
}

export interface ClientStateChangeEvent {
  type: 'CLIENT_STATE_CHANGE',
  newState: ClientState
}

export interface BattleStateChangeEvent {
  type: 'BATTLE_STATE_CHANGE',
  newState: BattleState
}

export interface PPChangeEvent {
  type: 'PP_CHANGE',
  playerName: string,
  newPP: number,
}

export interface WeatherChangeEvent {
  type: 'WEATHER_CHANGE',
  newWeather: Weather
}

export interface TeamSelectedEvent {
  type: 'TEAM_SELECTED',
  playerName: string,
  team: Pokemon[],
  pokemonNames: string[]
}

export interface RematchCreatedEvent {
  type: 'REMATCH_CREATED',
  newBattleId: string
}

export interface ShowPokemonCardEvent {
  type: 'SHOW_POKEMON_CARD',
  pokemon: Pokemon | PokemonSpecies
  isUser: boolean
}

export interface ShowMoveCardEvent {
  type: 'SHOW_MOVE_CARD',
  move: MoveDefinition
}

export interface UnlockPokemonEvent {
  type: 'UNLOCK_POKEMON',
  dexNumbers: number[],
  isLastPokemon: boolean
}

export interface RevealUnlockedPokemonEvent {
  type: 'REVEAL_UNLOCKED_POKEMON',
  index: number
}

export interface GameOverEvent {
  type: 'GAME_OVER',
  winnerName: string
}

export interface HazardsChangeEvent {
  type: 'HAZARDS_CHANGE',
  playerName: string,
  spikeLayerCount: number,
  toxicSpikeLayerCount: number,
  hasStealthRock?: boolean,
  hasStickyWeb?: boolean,
  hasLightScreen: boolean,
  hasReflect: boolean,
}

export type PlayerActionDetails = SelectTeamDetails | SelectPokemonDetails | SelectMoveDetails | QuitBattleDetails | NothingDetails | RequestRematchDetails

export interface SelectTeamDetails {
  type: 'SELECT_TEAM'
  pokemonNames: string[]
  enemyPokemonNames?: string[]
}

export interface SelectPokemonDetails {
  type: 'SELECT_POKEMON'
  pokemonIndex: number
}

export interface SelectMoveDetails {
  type: 'SELECT_MOVE'
  moveIndex: number
  struggle?: boolean
}

export interface QuitBattleDetails {
  type: 'QUIT_BATTLE'
}

// Used when one player does a required switch but the other player doesn't do anything
export interface NothingDetails {
  type: 'NOTHING'
}

export interface RequestRematchDetails {
  type: 'REQUEST_REMATCH'
}