import { ActionSelectorContext } from "../ai/action-selector-context.js"
import { getActionOptions } from "../ai/select-action.js"
import { moves } from "../data/move-data.js"
import { buildPokemon } from "../data/pokemon-data.js"
import { Random } from "../util/random.js"
import { assertEquals, assertNotNull, assertNull, assertTrue } from "./assert.js"

const bulbasaur = buildPokemon('Venusaur')
const charmander = buildPokemon('Charizard')
const squirtle = buildPokemon('Blastoise')
const rattata = buildPokemon('Raticate')

describe(`getActionOptions`, () => {
  it(`should usually fight when attacker has type advantage`, () => {
    const ctx = {
      attackingPokemon: charmander,
      defendingPokemon: bulbasaur,
      validMoves: charmander.moves,
      random: new Random()
    } as any
    const options = getActionOptions(ctx)
    assertEquals(options[0].option, 'FIGHT')
    assertEquals(options[0].weight, 100)
    assertEquals(options[1].option, 'SWITCH')
    assertEquals(options[1].weight, 0)
  })
  it(`should usually switch when attacker has type disadvantage`, () => {
    const ctx = {
      attackingPokemon: charmander,
      defendingPokemon: squirtle,
      validMoves: charmander.moves,
      random: new Random()
    } as any
    const options = getActionOptions(ctx)
    assertEquals(options[0].option, 'FIGHT')
    assertEquals(options[0].weight, 100)
    assertEquals(options[1].option, 'SWITCH')
    assertEquals(options[1].weight, 0)
  })
  it(`should usually fight when type advantage is neutral`, () => {
    const ctx = {
      attackingPokemon: rattata,
      defendingPokemon: rattata,
      validMoves: rattata.moves,
      random: new Random()
    } as any
    const options = getActionOptions(ctx)
    assertEquals(options[0].option, 'FIGHT')
    assertEquals(options[0].weight, 100)
    assertEquals(options[1].option, 'SWITCH')
    assertEquals(options[1].weight, 0)
  })
})