import { Battle } from "../model/battle.js";
import { Move } from "../model/move.js";
import { Player } from "../model/player.js";
import { Pokemon } from "../model/pokemon.js";
import { Random } from "../util/random.js";

export interface ActionSelectorContext {
  attackingPlayer: Player
  attackingPokemon: Pokemon
  defendingPlayer: Player
  defendingPokemon: Pokemon
  battle: Battle
}