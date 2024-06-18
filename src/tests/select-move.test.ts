import { ActionSelectorContext } from "../ai/action-selector-context.js"
import { getActionOptions } from "../ai/select-action.js"
import { getDamagingMoveOptions } from "../ai/select-move.js"
import { getSwitchOptions } from "../ai/select-switch.js"
import { moves } from "../data/move-data.js"
import { buildPokemon } from "../data/pokemon-data.js"
import { Player } from "../model/player.js"
import { Random } from "../util/random.js"
import { assertEquals, assertNotNull, assertNull, assertTrue } from "./assert.js"

const Machamp = buildPokemon('Machamp')
const Wobbuffet = buildPokemon('Wobbuffet')

// describe(`getDamagingMoveOptions`, () => {
//   it(`Wobbuffet should pick Counter against Machamp`, () => {
//     const ctx = {
//       attackingPokemon: Wobbuffet,
//       defendingPokemon: Machamp,
//       random: new Random()
//     } as any
//     const options = getDamagingMoveOptions(ctx)
//     assertEquals(options[0].option, 0)
//     assertEquals(options[0].weight, 336)
//     assertEquals(options[1].option, 1)
//     assertEquals(options[1].weight, 171)
//     assertEquals(options[2].option, 2)
//     assertEquals(options[2].weight, 45)
//     assertEquals(options[3].option, 3)
//     assertEquals(options[3].weight, 20)
//   })
// })
