import { MoveDefinition } from "./move-definition.js";
import { stageStatDisplayTexts } from "./stages.js";

export function getMoveDescription(move: MoveDefinition) {

  if (move.description) {
    return move.description
  }

  const descriptions: string[] = []
  if (move.effects?.applyNonVolatileStatusConditions) {
    move.effects.applyNonVolatileStatusConditions.conditions.forEach(condition => {
      let statusConditionText = ''
      if (condition.chance < 1) {
        switch (condition.type) {
          case 'ASLEEP':
            statusConditionText = `${condition.chance * 100}% chance to put target to sleep`
            break
          case 'BADLY POISONED':
            statusConditionText = `${condition.chance * 100}% chance to badly poison target`
            break
          case 'BURNED':
            statusConditionText = `${condition.chance * 100}% chance to burn target`
            break
          case 'FROZEN':
            statusConditionText = `${condition.chance * 100}% chance to freeze target`
            break
          case 'PARALYZED':
            statusConditionText = `${condition.chance * 100}% chance to paralyze target`
            break
          case 'POISONED':
            statusConditionText = `${condition.chance * 100}% chance to poison target`
            break
        }
      } else {
        switch (condition.type) {
          case 'ASLEEP':
            statusConditionText = `Puts target to sleep`
            break
          case 'BADLY POISONED':
            statusConditionText = `Badly poisons target`
            break
          case 'BURNED':
            statusConditionText = `Burns target`
            break
          case 'FROZEN':
            statusConditionText = `Freezes target`
            break
          case 'PARALYZED':
            statusConditionText = `Paralyzes target`
            break
          case 'POISONED':
            statusConditionText = `Poisons target`
            break
        }
      }
      descriptions.push(statusConditionText)
    })
  }

  if (move.effects?.applyConfusion) {
    if (move.effects.applyConfusion.chance < 1) {
      descriptions.push(`${move.effects.applyConfusion.chance * 100}% chance to confuse target`)
    } else {
      descriptions.push(`Confuses target`)
    }
  }

  if (move.effects?.modifyStages) {
    move.effects.modifyStages.modifiers.forEach(modifier => {
      const raiseOrLower = modifier.stages > 0 ? 'raise' : 'lower'
      const raiseOrLowerPresentTense = modifier.stages > 0 ? 'Raises' : 'Lowers'
      const statText = stageStatDisplayTexts[modifier.stageStat]
      const userOrTarget = modifier.userOrTarget.toLowerCase()
      const stageOrStages = modifier.stages > 1 ? 'stages' : 'stage'
      const numberText = Math.abs(modifier.stages)
      if (modifier.chance < 1) {
        descriptions.push(`${modifier.chance * 100}% chance to ${raiseOrLower} ${userOrTarget}'s ${statText} by ${numberText} ${stageOrStages}`)
      } else {
        descriptions.push(`${raiseOrLowerPresentTense} ${userOrTarget}'s ${statText} by ${numberText} ${stageOrStages}`)
      }
    })
  }

  if (move.effects?.halfRemainingHP) {
    descriptions.push(`Always takes off half of the target's remaining HP`)
  }

  if (move.effects?.multipleHits) {
    if (move.effects.multipleHits.additionalHits.length === 1 && 
      move.effects.multipleHits.additionalHits[0].chance === 1) {
      descriptions.push(`Hits twice per turn`)
    } else {
      descriptions.push(`Hits 2-${move.effects.multipleHits.additionalHits.length + 1} times per turn`)
    }
  }

  if (move.effects?.flinchTarget) {
    descriptions.push(`${move.effects.flinchTarget.chance * 100}% chance to cause target to flinch`)
  }

  if (move.effects?.protectUser) {
    descriptions.push(`Prevents damage and effects from the enemy's attack. Its chance of failing rises if used in succession`)
  }

  if (move.effects?.drain) {
    descriptions.push(`User heals for ${move.effects.drain.percent * 100}% of the damage done`)
  }

  if (move.effects?.increaseCritical) {
    descriptions.push(`Increased critical hit ratio`)
  }

  if (move.effects?.constantDamage) {
    descriptions.push(`Always does ${move.effects.constantDamage.damage} damage`)
  }

  if (move.effects?.healUser) {
    descriptions.push(`Restores ${move.effects.healUser.percent * 100}% of the user's max HP`)
  }

  if (move.effects?.doublePowerIfTargetHasStatus) {
    if (move.effects.doublePowerIfTargetHasStatus.statuses === 'ANY') {
      descriptions.push(`Power doubles if target has a status condition`)
    } else {
      descriptions.push(`Power doubles if target is ${move.effects.doublePowerIfTargetHasStatus.statuses[0].toLowerCase()}`)
    }
  }

  if (move.effects?.lastResort) {
    descriptions.push(`Fails if user has not used all other moves first`)
  }

  if (move.effects?.applyBind) {
    descriptions.push(`Target can't switch and takes damage each turn`)
  }

  if (move.effects?.copyTargetLastMove) {
    descriptions.push(`Copies opponent's last move`)
  }

  if (move.effects?.randomMove) {
    descriptions.push(`Uses a random move`)
  }

  if (move.effects?.doublePowerIfDamagedFirst) {
    descriptions.push(`Double power if user was hit first`)
  }

  if (move.effects?.doubleDamageTaken) {
    descriptions.push(`Hits back with double damage if hit with a ${move.effects.doubleDamageTaken.categoryRestriction.toLowerCase()} attack first`)
  }

  if (move.effects?.removeUserType) {
    descriptions.push(`After using this, the user will no longer be ${move.effects.removeUserType.type} type`)
  }

  /*
    This needs to stay at the bottom!
  */
  if (move.effects?.ignoreAccuracyAndEvasion && descriptions.length === 0) {
    descriptions.push(`Ignores accuracy and evasion`)
  }

  const joined = descriptions.join('. ')
  if (joined !== '') {
    return joined + '.'
  } else {
    return joined
  }
}