import { AbilityDefinition } from '../model/ability-definition.js'
import { EXTREMELY_EFFECTIVE, getDefensiveEffectivenessForTypes, getSingleTypeEffectiveness, getTypeEffectiveness, NORMALLY_EFFECTIVE, NOT_VERY_EFFECTIVE, NO_EFFECT, SUPER_EFFECTIVE } from '../model/type.js'
import { assertArrayEquals, assertEquals } from './assert.js'

describe('getSingleTypeEffectiveness', () => {
  it('should return NO_EFFECT', () => {
    assertEquals(NO_EFFECT, getSingleTypeEffectiveness('NORMAL', 'GHOST'))
    assertEquals(NO_EFFECT, getSingleTypeEffectiveness('FIGHTING', 'GHOST'))
    assertEquals(NO_EFFECT, getSingleTypeEffectiveness('GHOST', 'NORMAL'))
    assertEquals(NO_EFFECT, getSingleTypeEffectiveness('ELECTRIC', 'GROUND'))
    assertEquals(NO_EFFECT, getSingleTypeEffectiveness('POISON', 'STEEL'))
    assertEquals(NO_EFFECT, getSingleTypeEffectiveness('GROUND', 'FLYING'))
    assertEquals(NO_EFFECT, getSingleTypeEffectiveness('PSYCHIC', 'DARK'))
    assertEquals(NO_EFFECT, getSingleTypeEffectiveness('DRAGON', 'FAIRY'))
  })
  it('should return NOT_VERY_EFFECTIVE', () => {
    assertEquals(NOT_VERY_EFFECTIVE, getSingleTypeEffectiveness('GRASS', 'FIRE'))
    assertEquals(NOT_VERY_EFFECTIVE, getSingleTypeEffectiveness('WATER', 'GRASS'))
    assertEquals(NOT_VERY_EFFECTIVE, getSingleTypeEffectiveness('FIRE', 'WATER'))
  })
  it('should return NORMALLY_EFFECTIVE', () => {
    assertEquals(NORMALLY_EFFECTIVE, getSingleTypeEffectiveness('NORMAL', 'NORMAL'))
    assertEquals(NORMALLY_EFFECTIVE, getSingleTypeEffectiveness('FIRE', 'NORMAL'))
    assertEquals(NORMALLY_EFFECTIVE, getSingleTypeEffectiveness('WATER', 'GHOST'))
  })
  it('should return SUPER_EFFECTIVE', () => {
    assertEquals(SUPER_EFFECTIVE, getSingleTypeEffectiveness('FIRE', 'GRASS'))
    assertEquals(SUPER_EFFECTIVE, getSingleTypeEffectiveness('GRASS', 'WATER'))
    assertEquals(SUPER_EFFECTIVE, getSingleTypeEffectiveness('WATER', 'FIRE'))
  })
})

describe('getTypeEffectiveness', () => {
  it('should return NO_EFFECT', () => {
    assertEquals(NO_EFFECT, getTypeEffectiveness('NORMAL', ['GHOST']))
    assertEquals(NO_EFFECT, getTypeEffectiveness('NORMAL', ['GHOST', 'FIGHTING']))
    assertEquals(NO_EFFECT, getTypeEffectiveness('NORMAL', ['GHOST', 'FIRE']))
    assertEquals(NO_EFFECT, getTypeEffectiveness('NORMAL', ['GHOST', 'FIRE']))
    assertEquals(NO_EFFECT, getTypeEffectiveness('DRAGON', ['FAIRY', 'GHOST']))
    assertEquals(NO_EFFECT, getTypeEffectiveness('GHOST', ['NORMAL', 'FIGHTING']))
  })
  it('should return NOT_VERY_EFFECTIVE', () => {
    assertEquals(NOT_VERY_EFFECTIVE, getTypeEffectiveness('GRASS', ['FIRE']))
    assertEquals(NOT_VERY_EFFECTIVE, getTypeEffectiveness('GRASS', ['FIRE', 'DARK']))
    assertEquals(NOT_VERY_EFFECTIVE, getTypeEffectiveness('FIRE', ['WATER', 'DARK']))
  })
  it('should return NORMALLY_EFFECTIVE', () => {
    assertEquals(NORMALLY_EFFECTIVE, getTypeEffectiveness('NORMAL', ['NORMAL']))
    assertEquals(NORMALLY_EFFECTIVE, getTypeEffectiveness('NORMAL', ['NORMAL', 'FIRE']))
  })
  it('should return SUPER_EFFECTIVE', () => {
    assertEquals(SUPER_EFFECTIVE, getTypeEffectiveness('FIRE', ['GRASS']))
    assertEquals(SUPER_EFFECTIVE, getTypeEffectiveness('FIRE', ['GRASS', 'NORMAL']))
  })
  it('should return EXTREMELY_EFFECTIVE', () => {
    assertEquals(EXTREMELY_EFFECTIVE, getTypeEffectiveness('FIRE', ['GRASS', 'BUG']))
  })
})


describe('getDefensiveEffectivenessForTypes', () => {
  it('NORMAL', () => {
    const mapping = getDefensiveEffectivenessForTypes(['NORMAL'])
    assertArrayEquals(['FIGHTING'], mapping.effective)
    assertArrayEquals([], mapping.notEffective)
    assertArrayEquals(['GHOST'], mapping.noEffect)
  })
  it('GHOST', () => {
    const mapping = getDefensiveEffectivenessForTypes(['GHOST'])
    assertArrayEquals([ 'GHOST', 'DARK' ], mapping.effective)
    assertArrayEquals([ 'POISON', 'BUG' ], mapping.notEffective)
    assertArrayEquals([ 'NORMAL', 'FIGHTING' ], mapping.noEffect)
  })
  it('FIRE', () => {
    const mapping = getDefensiveEffectivenessForTypes(['FIRE'])
    assertArrayEquals([ 'GROUND', 'ROCK', 'WATER' ], mapping.effective)
    assertArrayEquals([ 'BUG', 'STEEL', 'FIRE', 'GRASS', 'ICE', 'FAIRY' ], mapping.notEffective)
    assertArrayEquals([], mapping.noEffect)
  })
  it('PSYCHIC/NORMAL', () => {
    const mapping = getDefensiveEffectivenessForTypes(['PSYCHIC', 'NORMAL'])
    assertArrayEquals([ 'BUG', 'DARK' ], mapping.effective)
    assertArrayEquals([ 'PSYCHIC' ], mapping.notEffective)
    assertArrayEquals(['GHOST'], mapping.noEffect)
  })
  it('BUG/STEEL', () => {
    const mapping = getDefensiveEffectivenessForTypes(['BUG', 'STEEL'])
    assertArrayEquals([ 'FIRE' ], mapping.effective)
    assertArrayEquals([ 'NORMAL', 'GRASS', 'ICE', 'PSYCHIC', 'BUG', 'DRAGON', 'FAIRY', 'STEEL' ], mapping.notEffective)
    assertArrayEquals(['POISON'], mapping.noEffect)
  })
  it('STEEL/BUG', () => {
    const mapping = getDefensiveEffectivenessForTypes(['STEEL', 'BUG'])
    assertArrayEquals([ 'FIRE' ], mapping.effective)
    assertArrayEquals([ 'NORMAL', 'GRASS', 'ICE', 'PSYCHIC', 'BUG', 'DRAGON', 'FAIRY', 'STEEL' ], mapping.notEffective)
    assertArrayEquals(['POISON'], mapping.noEffect)
  })
  it('DARK/GHOST', () => {
    const mapping = getDefensiveEffectivenessForTypes(['DARK', 'GHOST'])
    assertArrayEquals([ 'FAIRY' ], mapping.effective)
    assertArrayEquals([ 'POISON' ], mapping.notEffective)
    assertArrayEquals(['NORMAL','FIGHTING', 'PSYCHIC'], mapping.noEffect)
  })
  it('GHOST/DARK', () => {
    const mapping = getDefensiveEffectivenessForTypes(['GHOST', 'DARK'])
    assertArrayEquals([ 'FAIRY' ], mapping.effective)
    assertArrayEquals([ 'POISON' ], mapping.notEffective)
    assertArrayEquals(['NORMAL','FIGHTING', 'PSYCHIC'], mapping.noEffect)
  })
  it('ROCK/PSYCHIC', () => {
    const mapping = getDefensiveEffectivenessForTypes(['ROCK', 'PSYCHIC'])
    assertArrayEquals([ 'GROUND', 'WATER', 'GRASS', 'BUG', 'GHOST', 'DARK', 'STEEL' ], mapping.effective)
    assertArrayEquals([ 'NORMAL', 'FIRE', 'POISON', 'FLYING', 'PSYCHIC' ], mapping.notEffective)
    assertArrayEquals([], mapping.noEffect)
  })
  it('ROCK/PSYCHIC and Levitate', () => {
    const mapping = getDefensiveEffectivenessForTypes(['ROCK', 'PSYCHIC'], {
      raised: true
    } as AbilityDefinition)
    assertArrayEquals([ 'WATER', 'GRASS', 'BUG', 'GHOST', 'DARK', 'STEEL' ], mapping.effective)
    assertArrayEquals([ 'NORMAL', 'FIRE', 'POISON', 'FLYING', 'PSYCHIC' ], mapping.notEffective)
    assertArrayEquals(['GROUND'], mapping.noEffect)
  })
  it('FIRE and Flash Fire', () => {
    const mapping = getDefensiveEffectivenessForTypes(['FIRE'], {
      buffFromAttackType: {
        type: 'FIRE'
      }
    } as AbilityDefinition)
    assertArrayEquals([ 'GROUND', 'ROCK', 'WATER' ], mapping.effective)
    assertArrayEquals([ 'BUG', 'STEEL', 'GRASS', 'ICE', 'FAIRY' ], mapping.notEffective)
    assertArrayEquals(['FIRE'], mapping.noEffect)
  })
  it('BUG/GHOST and Wonder Guard', () => {
    const mapping = getDefensiveEffectivenessForTypes(['BUG', 'GHOST'], {
      wonderGuard: true
    } as AbilityDefinition)
    assertArrayEquals([ 'FIRE', 'FLYING', 'ROCK', 'GHOST', 'DARK' ], mapping.effective)
    assertArrayEquals([], mapping.notEffective)
    assertArrayEquals([
      'NORMAL', 'WATER', 'ELECTRIC', 'GRASS', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 
      'PSYCHIC', 'BUG', 'DRAGON', 'STEEL', 'FAIRY'
    ], mapping.noEffect)
  })
  it('WATER/ICE and Water Absorb', () => {
    const mapping = getDefensiveEffectivenessForTypes(['WATER', 'ICE'], {
      healFromAttackType: {
        type: 'WATER'
      }
    } as AbilityDefinition)
    assertArrayEquals([ 'ELECTRIC', 'GRASS', 'FIGHTING', 'ROCK' ], mapping.effective)
    assertArrayEquals(['ICE'], mapping.notEffective)
    assertArrayEquals(['WATER'], mapping.noEffect)
  })
})