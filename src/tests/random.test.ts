import { Random } from '../util/random.js'

import { assertEquals, assertFalse, assertNotNull, assertThrows, assertTrue } from './assert.js'

describe('Random', () => {
  it('should return true or false randomly', () => {
    const random = new Random()
    random.rng = () => 0
    assertTrue(random.coinFlip())
    random.rng = () => .4999
    assertTrue(random.coinFlip())
    random.rng = () => .5
    assertFalse(random.coinFlip())
    random.rng = () => 1
    assertFalse(random.coinFlip())
  })
  it('should return true or false based on probability', () => {
    const random = new Random()
    random.rng = () => .25
    assertTrue(random.roll(.26))
    assertFalse(random.roll(.25))
  })
  it('should pick option randomly', () => {
    const random = new Random()
    const options = ['one', 'two', 'three', 'four']
    random.rng = () => 0
    assertEquals(random.randomPick(options), 'one')
    random.rng = () => .25
    assertEquals(random.randomPick(options), 'two')
    random.rng = () => .5
    assertEquals(random.randomPick(options), 'three')
    random.rng = () => .75
    assertEquals(random.randomPick(options), 'four')
  })
  it('should pick option based on probabilities', () => {
    const random = new Random()
    const options = ['one', 'two', 'three', 'four']
    const chances = [.5, .2, .25, .05]
    random.rng = () => .5
    assertEquals(random.weightedRandomPick(options, chances), 'one')
    random.rng = () => .7
    assertEquals(random.weightedRandomPick(options, chances), 'two')
    random.rng = () => .95
    assertEquals(random.weightedRandomPick(options, chances), 'three')
    random.rng = () => .96
    assertEquals(random.weightedRandomPick(options, chances), 'four')
  })
  it('should pick a random float within the range', () => {
    const random = new Random()
    random.rng = () => .22
    assertEquals(.22, random.randomFloatInRange(0, 1))
    random.rng = () => .25
    assertEquals(25, random.randomFloatInRange(0, 100))
    random.rng = () => 0
    assertEquals(0, random.randomFloatInRange(0, 100))
    random.rng = () => 1
    assertEquals(100, random.randomFloatInRange(0, 100))
    random.rng = () => .25
    assertEquals(125, random.randomFloatInRange(0, 500))
  })
  it('should pick a random integer within the range', () => {
    const random = new Random()
    random.rng = () => 0
    assertEquals(0, random.randomIntegerInRange(0, 1))
    random.rng = () => .49
    assertEquals(0, random.randomIntegerInRange(0, 1))
    random.rng = () => .5
    assertEquals(1, random.randomIntegerInRange(0, 1))
    random.rng = () => .9999
    assertEquals(1, random.randomIntegerInRange(0, 1))
  })
})