
import { assertEquals, assertFalse, assertNotNull, assertThrows, assertTrue } from './assert.js'
import { setupBattle } from './test-setup.js'

describe('getPlayer', () => {
  it('should get player by name', () => {
    const battle = setupBattle()
    assertEquals(battle.getPlayer('Player1'), battle.players[0])
    assertEquals(battle.getPlayer('Player2'), battle.players[1])
  })
})

describe('getOtherPlayer', () => {
  it('should get other player', () => {
    const battle = setupBattle()
    assertEquals(battle.getOtherPlayer(battle.players[0]), battle.players[1])
    assertEquals(battle.getOtherPlayer(battle.players[1]), battle.players[0])
  })
})
