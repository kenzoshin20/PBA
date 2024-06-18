import { BattleRound } from '../model/battle-round.js'
import { assertEquals, assertFalse, assertNotNull, assertThrows, assertTrue } from './assert.js'
import { Battle } from '../model/battle.js'
import { Pokemon } from '../model/pokemon.js'
import { Player } from '../model/player.js'
import { DEFAULT_WEATHER } from '../model/weather.js'

describe('BattleRound', () => {
  it('should select Pokemon', () => {
    const player1 = {
      name: 'Name1',
      activePokemonIndex: 0,
      team: [
        { name: 'Pokemon1' } as any,
        { name: 'Pokemon2' } as any
      ]
    } as Player
    const player2 = {
      name: 'Name2',
      activePokemonIndex: 0,
      team: [
        { name: 'Pokemon1' } as any,
        { name: 'Pokemon2' } as any
      ]
    } as Player
    const battle = new Battle({
      battleType: 'MULTI_PLAYER',
      battleSubType: 'CHALLENGE',
      players: [player1, player2],
      weather: DEFAULT_WEATHER,
      remainingWeatherTurns: 0,
      rewards: [],
      turnCount: 0
    })
    const battleRound = new BattleRound(battle, [
      {
        playerName: 'Name1',
        type: 'PLAYER_ACTION',
        details: {
          type: 'SELECT_POKEMON',
          pokemonIndex: 0
        }
      },
      {
        playerName: 'Name2',
        type: 'PLAYER_ACTION',
        details: {
          type: 'SELECT_POKEMON',
          pokemonIndex: 1
        }
      }
    ])
    battleRound.start()
    assertEquals(player1.activePokemonIndex, 0)
    assertEquals(player2.activePokemonIndex, 1)
    assertTrue(battle.events.length > 3)
  })
})