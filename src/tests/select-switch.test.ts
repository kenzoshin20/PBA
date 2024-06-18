import { ActionSelectorContext } from "../ai/action-selector-context.js"
import { getActionOptions } from "../ai/select-action.js"
import { getSwitchOptions } from "../ai/select-switch.js"
import { moves } from "../data/move-data.js"
import { buildPokemon } from "../data/pokemon-data.js"
import { Player } from "../model/player.js"
import { Random } from "../util/random.js"
import { assertEquals, assertNotNull, assertNull, assertTrue } from "./assert.js"

const bulbasaur = buildPokemon('Venusaur')
const charmander = buildPokemon('Charizard')
const squirtle = buildPokemon('Blastoise')
const rattata = buildPokemon('Raticate')

const attackingPlayer: Player = {
  name: 'test',
  activePokemonIndex: 0,
  team: [
    bulbasaur,
    squirtle,
    rattata,
    charmander
  ]
} as Player

describe(`getSwitchOptions`, () => {
  it(`should usually pick the pokemon with type advantage`, () => {
    const ctx = {
      attackingPlayer: attackingPlayer,
      defendingPokemon: charmander,
      random: new Random()
    } as any
    const options = getSwitchOptions(ctx)
    assertEquals(options[0].option, 0)
    assertEquals(options[0].weight, 0)
    assertEquals(options[1].option, 1)
    assertEquals(options[1].weight, 50)
    assertEquals(options[2].option, 2)
    assertEquals(options[2].weight, 10)
    assertEquals(options[3].option, 3)
    assertEquals(options[3].weight, 1)
  })
})