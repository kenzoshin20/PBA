import { logDebug, logInfo } from "../util/logger";
import { PokemonSpecies } from "./pokemon-species";

export function createSpeciesListIndex(speciesList: PokemonSpecies[]): Record<string, PokemonSpecies[]> {
  const startTime = performance.now()
  const index: Record<string, PokemonSpecies[]> = {}
  speciesList.forEach(species => {
    const tokens = generateTokensForSpecies(species)
    tokens.forEach(token => {
      if (!index[token]) {
        index[token] = [species]
      } else if (!index[token].includes(species)) {
        index[token].push(species)
      }
    })
  })
  const endTime = performance.now()
  logDebug(`Indexed ${Object.keys(index).length} tokens in ${endTime - startTime} milliseconds`)
  return index
}

export function generateTokensForSpecies(p: PokemonSpecies) {
  const tokens: string[] = []
  tokens.push(...generateTypeAheadTokens(p.name))
  p.types.forEach(type => tokens.push(...generateTypeAheadTokens(type)))
  p.moves.forEach(move => {
    tokens.push(...generateTypeAheadTokens(move.name))
    tokens.push(...generateTypeAheadTokens(move.type))
  })
  if (p.ability) {
    tokens.push(...generateTypeAheadTokens(p.ability.name))
  }
  return normalizeTokens(tokens)
}

function generateTypeAheadTokens(val: string) {
  const tokens: string[] = []
  if (val.length > 0) {
    for (let i=1; i<val.length; i++) {
      const sub = val.substring(0, i+1)
      tokens.push(sub)
    }
  }
  return tokens
}

function normalizeTokens(tokens: string[]) {
  return tokens.map(normalizeToken)
}

export function normalizeToken(token: string) {
  return token
    .toLowerCase()
    .replace(' ', '')
    .replace(".", '')
    .replace("'", '')
    .replace('♀', '')
    .replace('♂', '')
}