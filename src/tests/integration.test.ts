import { assertEquals, assertNotNull, assertNull, assertTrue } from "./assert.js"
import { setupBattle } from "./test-setup.js"

describe('Integration Test', () => {

  const battle = setupBattle()
  
  it(`should select Player1's pokemon`, () => {
    battle.receivePlayerAction({
      type: 'PLAYER_ACTION',
      playerName: 'Player1',
      details: {
        type: 'SELECT_POKEMON',
        pokemonIndex: 1
      }
    })
    assertNotNull(battle.pendingPlayerAction)
  })
  it(`should select Player2's pokemon`, () => {
    battle.receivePlayerAction({
      type: 'PLAYER_ACTION',
      playerName: 'Player2',
      details: {
        type: 'SELECT_POKEMON',
        pokemonIndex: 0
      }
    })
    assertNull(battle.pendingPlayerAction)
    assertEquals(battle.getPlayer('Player1').activePokemonIndex, 1)
    assertEquals(battle.getPlayer('Player2').activePokemonIndex, 0)
    assertEquals(battle.battleState, 'SELECTING_ACTIONS')
  })
  it(`should select Player1's move`, () => {
    battle.receivePlayerAction({
      type: 'PLAYER_ACTION',
      playerName: 'Player1',
      details: {
        type: 'SELECT_MOVE',
        moveIndex: 0
      }
    })
    assertNotNull(battle.pendingPlayerAction)
  })
  it(`should select Player2's move`, () => {
    battle.receivePlayerAction({
      type: 'PLAYER_ACTION',
      playerName: 'Player2',
      details: {
        type: 'SELECT_MOVE',
        moveIndex: 0
      }
    })
    assertNull(battle.pendingPlayerAction)
  })

})