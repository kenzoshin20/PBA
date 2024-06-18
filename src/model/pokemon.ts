import { logDebug, logHealthOnSwitch } from "../util/logger.js";
import { Random } from "../util/random.js";
import { AbilityDefinition } from "./ability-definition.js";
import { buildMove, Move } from "./move.js";
import { MoveDefinition } from "./move-definition.js";
import { getMoveDescription } from "./move-description.js";
import { PokemonSize } from "./pokemon-size.js";
import { getSpriteName, PokemonSpecies } from "./pokemon-species.js";
import { StageStat } from "./stages.js";
import { NonVolatileStatusCondition } from "./status-conditions.js";
import { Type } from "./type.js"
import { speciesList } from "../data/pokemon-data.js";

const HP_FACTOR = 500

export class Pokemon {

  species: PokemonSpecies
  readonly name: string
  readonly pokedexNumber: number

  startingHP: number
  startingSpriteName: string
  startingTypes: Type[]
  startingSpeed: number
  startingAttack: number
  startingSpecialAttack: number
  startingDefense: number
  startingSpecialDefense: number
  startingMoves: Move[]
  startingAbility?: AbilityDefinition
  readonly startingSize: PokemonSize
  readonly startingImgHeight: number

  hp: number
  spriteName: string
  types: Type[]
  speed: number
  attack: number
  specialAttack: number
  defense: number
  specialDefense: number
  moves: Move[]
  size: PokemonSize
  imgHeight: number
  ability?: AbilityDefinition

  level: number
  nonVolatileStatusCondition?: NonVolatileStatusCondition
  confused: boolean
  flinched: boolean
  protected: boolean
  protectedByKingsShield: boolean
  consecutiveProtectCount: number
  remainingSleepTurns: number
  remainingConfusedTurns: number
  badlyPoisonedTurns: number
  remainingBindTurns: number
  bindingMoveName: string | null
  previousMoveIndex: number | null
  hasLeechSeed: boolean
  roosted: boolean
  preRoostTypes: Type[]
  attackTypeBuff: Type | null
  isSlackingOff: boolean
  isBladeForm: boolean
  activeTurnCount: number

  stages: Record<StageStat, number> = {
    'attack': 0,
    'defense': 0,
    'specialAttack': 0,
    'specialDefense': 0,
    'accuracy': 0,
    'evasion': 0,
    'speed': 0
  }

  movesUsed: Record<number, boolean> = {
    0: false,
    1: false,
    2: false,
    3: false
  }

  constructor(species: PokemonSpecies) {
      this.species = species
      this.name = species.name
      this.pokedexNumber = species.pokedexNumber

      const startingHP = Math.floor(species.hp / 100 * HP_FACTOR)
      this.startingHP = species.ability?.wonderGuard ? 1 : startingHP
      // this.startingHP = species.hp + 150
      this.startingSpriteName = getSpriteName(species)
      this.startingTypes = species.types
      this.startingSpeed = species.speed
      this.startingMoves = species.moves.map(moveDef => buildMove(moveDef))
      this.startingAttack = species.attack
      this.startingDefense = species.defense
      this.startingSpecialAttack = species.specialAttack
      this.startingSpecialDefense = species.specialDefense
      this.startingSize = species.size
      this.startingImgHeight = species.imgHeight
      this.startingAbility = species.ability

      this.hp = this.startingHP
      this.spriteName = this.startingSpriteName
      this.types = this.startingTypes
      this.speed = this.startingSpeed
      this.moves = this.startingMoves
      this.attack = this.startingAttack
      this.defense = this.startingDefense
      this.specialAttack = this.startingSpecialAttack
      this.specialDefense = this.startingSpecialDefense
      this.size = this.startingSize
      this.imgHeight = this.startingImgHeight
      this.ability = this.startingAbility

      this.level = 50
      this.confused = false
      this.flinched = false
      this.protected = false
      this.protectedByKingsShield = false
      this.consecutiveProtectCount = 0
      this.remainingSleepTurns = 0
      this.remainingConfusedTurns = 0
      this.badlyPoisonedTurns = 0
      this.remainingBindTurns = 0
      this.bindingMoveName = null
      this.previousMoveIndex = null
      this.hasLeechSeed = false
      this.roosted = false
      this.preRoostTypes = []
      this.attackTypeBuff = null
      this.isSlackingOff = false
      this.isBladeForm = false
      this.activeTurnCount = 0
    }
}

export function modifyStage(pokemon: Pokemon, stage: StageStat, number: number): number {
  if ((number > 0 && pokemon.stages[stage] >= 6) || 
    (number < 0 && pokemon.stages[stage] <= -6)) {
      return 0
  }
  pokemon.stages[stage] += number
  return number
}

export function resetStats(p: Pokemon) {

  p.spriteName = p.startingSpriteName
  p.types = p.startingTypes
  p.speed = p.startingSpeed
  p.attack = p.startingAttack
  p.specialAttack = p.startingSpecialAttack
  p.defense = p.startingDefense
  p.specialDefense = p.startingSpecialDefense
  p.moves = p.startingMoves
  p.size = p.startingSize
  p.imgHeight = p.startingImgHeight
  p.ability = p.startingAbility

  // Stat stages
  for (const stage of Object.keys(p.stages) as StageStat[]) {
    p.stages[stage] = 0
  }
}

export function allMovesUsed(pokemon: Pokemon) {
  return pokemon.movesUsed[0] && pokemon.movesUsed[1] && 
    pokemon.movesUsed[2] && pokemon.movesUsed[3]
}

export function isRaised(pokemon: Pokemon) {
  return pokemon.types.includes('FLYING') || pokemon.ability?.raised
}

export function getCry(p: Pokemon) {
  return `cries/${p.spriteName ? p.spriteName : p.name.toLowerCase()}.mp3`
}

export function isAlive(pokemon: Pokemon) {
  return pokemon.hp > 0
}

export function isInAPinch(pokemon: Pokemon) {
  return isAlive(pokemon) && pokemon.hp < (pokemon.startingHP / 3)
}