import { Pokemon } from "./pokemon.js";

export type PlayerType = 'HUMAN' | 'COMPUTER'

export interface Player {
  type: PlayerType
  name: string
  avatar: string
  team: Pokemon[]
  activePokemonIndex: number
  leadPokemonIndex?: number

  // Entry hazards
  hasStickyWeb?: boolean
  hasStealthRock?: boolean
  spikeLayerCount: 0 | 1 | 2 | 3
  toxicSpikeLayerCount: 0 | 1 | 2

  // Screens
  remainingReflectTurns: number
  remainingLightScreenTurns: number
}

export function getActivePokemonForPlayer(player: Player): Pokemon {
  return player.team[player.activePokemonIndex]
}
