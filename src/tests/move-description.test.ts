import { MoveDefinition } from '../model/move-definition.js'
import { getMoveDescription } from '../model/move-description.js'

import { assertEquals } from './assert.js'

describe('getMoveDescription', () => {
  it('should get hard coded desc', () => {
    const move = {
      description: 'Hard coded'
    } as MoveDefinition
    assertEquals(getMoveDescription(move), 'Hard coded')
  })
  it('should get desc for move that damages with no additonal effect', () => {
    const move = {
      power: 80
    } as MoveDefinition
    assertEquals(getMoveDescription(move), '')
  })
  it('should get desc for move with chance to burn', () => {
    const move = {
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            chance: .1,
            type: 'BURNED'
          }]
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), '10% chance to burn target.')
  })
  it('should get desc for move that always paralyzes', () => {
    const move = {
      effects: {
        applyNonVolatileStatusConditions: {
          conditions: [{
            chance: 1,
            type: 'PARALYZED'
          }]
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), 'Paralyzes target.')
  })
  it('should get desc for move that sometimes confuses', () => {
    const move = {
      effects: {
        applyConfusion: {
          chance: .5
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), '50% chance to confuse target.')
  })
  it('should get desc for move that always confuses', () => {
    const move = {
      effects: {
        applyConfusion: {
          chance: 1
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), 'Confuses target.')
  })
  it('should get desc for move that always raises defense', () => {
    const move = {
      effects: {
        modifyStages: {
          modifiers: [{
            userOrTarget: 'USER',
            stageStat: 'defense',
            stages: 1,
            chance: 1,
          }]
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Raises user's defense by 1 stage.`)
  })
  it('should get desc for move that always lowers enemy speed', () => {
    const move = {
      effects: {
        modifyStages: {
          modifiers: [{
            userOrTarget: 'TARGET',
            stageStat: 'speed',
            stages: -1,
            chance: 1,
          }]
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Lowers target's speed by 1 stage.`)
  })
  it('should get desc for move that sometimes raises special attack', () => {
    const move = {
      effects: {
        modifyStages: {
          modifiers: [{
            userOrTarget: 'USER',
            stageStat: 'specialAttack',
            stages: 2,
            chance: .25,
          }]
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `25% chance to raise user's special attack by 2 stages.`)
  })
  it('should get desc for move that sometimes lowers enemy special attack', () => {
    const move = {
      effects: {
        modifyStages: {
          modifiers: [{
            userOrTarget: 'TARGET',
            stageStat: 'specialAttack',
            stages: -1,
            chance: .25,
          }]
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `25% chance to lower target's special attack by 1 stage.`)
  })
  it('should get desc for halfRemainingHP', () => {
    const move = {
      effects: {
        halfRemainingHP: true
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Always takes off half of the target's remaining HP.`)
  })
  it('should get desc for two hit move', () => {
    const move = {
      effects: {
        multipleHits: {
          additionalHits: [
            {
              chance: 1
            }
          ]
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Hits twice per turn.`)
  })
  it('should get desc for multipleHits', () => {
    const move = {
      effects: {
        multipleHits: {
          additionalHits: [
            {
              chance: 3/8
            },
            {
              chance: 3/8
            },
            {
              chance: 1/8
            },
            {
              chance: 1/8
            },
          ]
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Hits 2-5 times per turn.`)
  })
  it('should get desc for move that sometimes flinches', () => {
    const move = {
      effects: {
        flinchTarget: {
          chance: .1
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), '10% chance to cause target to flinch.')
  })
  it('should get desc for move that protects', () => {
    const move = {
      effects: {
        protectUser: true
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Prevents damage and effects from the enemy's attack. Its chance of failing rises if used in succession.`)
  })
  it('should get desc for drain move', () => {
    const move = {
      effects: {
        drain: {
          percent: 1/2
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), 'User heals for 50% of the damage done.')
  })
  it('should get desc for drain move that heals 25%', () => {
    const move = {
      effects: {
        drain: {
          percent: 1/4
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), 'User heals for 25% of the damage done.')
  })
  it('should get desc for increaseCritical', () => {
    const move = {
      effects: {
        increaseCritical: {
          percent: 1/8
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), 'Increased critical hit ratio.')
  })
  it('should get desc for ignoreAccuracyAndEvasion', () => {
    const move = {
      effects: {
        ignoreAccuracyAndEvasion: true
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), 'Ignores accuracy and evasion.')
  })
  it('should get desc for constantDamage', () => {
    const move = {
      effects: {
        constantDamage: {damage: 50}
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), 'Always does 50 damage.')
  })
  it('should get desc for healUser', () => {
    const move = {
      effects: {
        healUser: {percent: 1/2}
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Restores 50% of the user's max HP.`)
  })
  it('should get desc for doublePowerIfTargetHasStatus ANY', () => {
    const move = {
      effects: {
        doublePowerIfTargetHasStatus: { statuses: 'ANY' }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Power doubles if target has a status condition.`)
  })
  it('should get desc for doublePowerIfTargetHasStatus ASLEEP', () => {
    const move = {
      effects: {
        doublePowerIfTargetHasStatus: { statuses: ['ASLEEP'] }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Power doubles if target is asleep.`)
  })
  it('should get desc for doublePowerIfTargetHasStatus POISONED or BADLY POISONED', () => {
    const move = {
      effects: {
        doublePowerIfTargetHasStatus: { statuses: ['POISONED', 'BADLY POISONED'] }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Power doubles if target is poisoned.`)
  })
  it('should get desc for last resort', () => {
    const move = {
      effects: {
        lastResort: true
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Fails if user has not used all other moves first.`)
  })
  it('should get desc for binding move', () => {
    const move = {
      effects: {
        applyBind: true
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Target can't switch and takes damage each turn.`)
  })
  it('should get desc for copycat', () => {
    const move = {
      effects: {
        copyTargetLastMove: true
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Copies opponent's last move.`)
  })
  it('should get desc for metronome', () => {
    const move = {
      effects: {
        randomMove: {
          moveNames: ['Flamethrower']
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Uses a random move.`)
  })
  it('should get desc for doublePowerIfDamagedFirst', () => {
    const move = {
      effects: {
        doublePowerIfDamagedFirst: true
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Double power if user was hit first.`)
  })
  it('should get desc for doubleDamageTaken PHYSICAL', () => {
    const move = {
      effects: {
        doubleDamageTaken: {
          categoryRestriction: 'PHYSICAL'
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Hits back with double damage if hit with a physical attack first.`)
  })
  it('should get desc for doubleDamageTaken PHYSICAL', () => {
    const move = {
      effects: {
        doubleDamageTaken: {
          categoryRestriction: 'SPECIAL'
        }
      }
    } as MoveDefinition
    assertEquals(getMoveDescription(move), `Hits back with double damage if hit with a special attack first.`)
  })
})

