import { Random } from "../util/random";
import { PokemonSpecies } from "./pokemon-species";

const random = new Random()

export function automaticallyPickTeam(teamSize: number, unlocked: PokemonSpecies[]): string[] {
  const team: PokemonSpecies[] = []

  for (let i = 0; i < teamSize; i++) {
    pick(team, unlocked)
  }

  return team.map(species => species.name)
}

function pick(team: PokemonSpecies[], unlocked: PokemonSpecies[]) {
  let pick 
  let attempts = 0
  while (alreadyPicked(pick, team)) {
    if (attempts > 1_000) {
      throw new Error('Unable to find pick')
    }
    pick = random.randomPick(unlocked)
    attempts++
  }
  if (pick) {
    team.push(pick)
  }
}

function alreadyPicked(pick: PokemonSpecies | undefined, team: PokemonSpecies[]): boolean {
  if (!pick) {
    return true
  }
  const length = team.filter(e => e.name === pick.name).length
  return length > 0
}

