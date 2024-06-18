import { moves } from "../data/move-data";
import { getSpecies } from "../data/pokemon-data";
import { Avatar, getAvatar } from "./avatar";
import { Pokemon } from "./pokemon";
import { PokemonSpecies } from "./pokemon-species";

interface NPC {
  name: string
  avatar: Avatar
  team: PokemonSpecies[]
}

export const npcList: NPC[] = [
  {
    name: 'Bug Catcher Wade',
    avatar: getAvatar('bugcatcher'),
    team: [
      build('Butterfree'),
      build('Scyther'),
      build('Beedrill'),
      build('Shuckle'),
      build('Heracross'),
      build('Flygon'),
    ]
  }
]

function build(name: string, modifications?: Partial<PokemonSpecies>): PokemonSpecies {
  const species = getSpecies(name)
  if (modifications) {
    return {
      ...species,
      ...modifications   
   }
  } else {
    return species
  }
} 