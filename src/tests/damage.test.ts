import { calculateBadlyPoisonedDamage, calculateConfusionHitDamage, calculateStealthRockDamagePercent } from '../model/damage.js'
import { Pokemon } from '../model/pokemon.js'
import { Random } from '../util/random.js'
import { assertEquals, assertFalse, assertNotNull, assertThrows, assertTrue } from './assert.js'
import { setupBattle } from './test-setup.js'

describe('getBadlyPoisonedDamage', () => {
  it('should get BADLY POISED damage on first turn', () => {
    const pokemon = {
      startingHP: 100,
      badlyPoisonedTurns: 1
    }
    assertEquals(calculateBadlyPoisonedDamage(pokemon as any), 100 / 16)
  })
  it('should get BADLY POISED damage on second turn', () => {
    const pokemon = {
      startingHP: 100,
      badlyPoisonedTurns: 2
    }
    assertEquals(calculateBadlyPoisonedDamage(pokemon as any), 100 / 8)
  })
  it('should get BADLY POISED damage on third turn', () => {
    const pokemon = {
      startingHP: 100,
      badlyPoisonedTurns: 3
    }
    assertEquals(calculateBadlyPoisonedDamage(pokemon as any), 18.75)
  })
  it('should get BADLY POISED damage on 15th turn', () => {
    const pokemon = {
      startingHP: 100,
      badlyPoisonedTurns: 15
    }
    assertEquals(calculateBadlyPoisonedDamage(pokemon as any), 93.75)
  })
  it('should get BADLY POISED damage on 16th turn', () => {
    const pokemon = {
      startingHP: 100,
      badlyPoisonedTurns: 16
    }
    assertEquals(calculateBadlyPoisonedDamage(pokemon as any), 93.75)
  })
  it('should get BADLY POISED damage on 17th turn', () => {
    const pokemon = {
      startingHP: 100,
      badlyPoisonedTurns: 17
    }
    assertEquals(calculateBadlyPoisonedDamage(pokemon as any), 93.75)
  })
})

describe('calculateConfusionHitDamage', () => {
  const mockRandom: Random = new Random(() => 1)
  it('should calculate damage for 50 attack/defense pokemon', () => {
    const pokemon = {
      attack: 50,
      defense: 50,
      stages: {
        attack: 0,
        defense: 0
      }
    }
    assertEquals(calculateConfusionHitDamage(pokemon as Pokemon, mockRandom), 40)
  })
  it('should calculate damage for 50 attack, 100 defense pokemon', () => {
    const pokemon = {
      attack: 50,
      defense: 100,
      stages: {
        attack: 0,
        defense: 0
      }
    }
    assertEquals(calculateConfusionHitDamage(pokemon as Pokemon, mockRandom), 20)
  })
  it('should calculate damage for 100 attack, 50 defense pokemon', () => {
    const pokemon = {
      attack: 100,
      defense: 50,
      stages: {
        attack: 0,
        defense: 0
      }
    }
    assertEquals(calculateConfusionHitDamage(pokemon as Pokemon, mockRandom), 80)
  })
  it('should calculate damage for boosted attack stage pokemon', () => {
    const pokemon = {
      attack: 50,
      defense: 50,
      stages: {
        attack: 1,
        defense: 0
      }
    }
    assertEquals(calculateConfusionHitDamage(pokemon as Pokemon, mockRandom), 60)
  })
})

describe('calculateStealthRockDamagePercent', () => {
  it('should calculate damage for NORMAL type', () => {
    const pokemon = {
      types: ['NORMAL']
    }
    assertEquals(calculateStealthRockDamagePercent(pokemon as Pokemon), 1/8)
  })
  it('should calculate damage for FIRE type', () => {
    const pokemon = {
      types: ['FIRE']
    }
    assertEquals(calculateStealthRockDamagePercent(pokemon as Pokemon), 1/4)
  })
  it('should calculate damage for FIRE/FLYING type', () => {
    const pokemon = {
      types: ['FIRE', 'FLYING']
    }
    assertEquals(calculateStealthRockDamagePercent(pokemon as Pokemon), 1/2)
  })
  it('should calculate damage for FIGHTING type', () => {
    const pokemon = {
      types: ['FIGHTING']
    }
    assertEquals(calculateStealthRockDamagePercent(pokemon as Pokemon), 1/16)
  })
  it('should calculate damage for FIGHTING/STEEL type', () => {
    const pokemon = {
      types: ['FIGHTING', 'STEEL']
    }
    assertEquals(calculateStealthRockDamagePercent(pokemon as Pokemon), 1/32)
  })
})