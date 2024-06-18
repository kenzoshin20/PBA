import { AbilityDefinition } from "./ability-definition";
import { MoveDefinition } from "./move-definition";
import { PokemonSize } from "./pokemon-size";
import { Type } from "./type";

export interface PokemonSpecies {
  readonly pokedexNumber: number
  readonly name: string
  readonly spriteName?: string
  readonly altSpriteName?: string
  readonly types: Type[]
  readonly hp: number
  readonly speed: number
  readonly attack: number
  readonly specialAttack: number
  readonly defense: number
  readonly specialDefense: number
  readonly moves: MoveDefinition[]
  readonly size: PokemonSize
  readonly imgHeight: number
  readonly ability: AbilityDefinition
  readonly isLegendary?: true
}

export function getSpriteName(species: PokemonSpecies) {
  return species.spriteName ? species.spriteName : species.name.toLowerCase()
}