import { Pokemon } from "./pokemon"

// NOTE: These strings must match the Pokemon class property names
export type StageStat = 'attack' | 'defense' | 'specialAttack' | 'specialDefense' |
  'speed' | 'accuracy' | 'evasion'

const stageMultiplierMap: Map<number, number> = new Map()
stageMultiplierMap.set(-6, 2/8)
stageMultiplierMap.set(-5, 2/7)
stageMultiplierMap.set(-4, 2/6)
stageMultiplierMap.set(-3, 2/5)
stageMultiplierMap.set(-2, 2/4)
stageMultiplierMap.set(-1, 2/3)
stageMultiplierMap.set(0, 2/2)
stageMultiplierMap.set(1, 3/2)
stageMultiplierMap.set(2, 4/2)
stageMultiplierMap.set(3, 5/2)
stageMultiplierMap.set(4, 6/2)
stageMultiplierMap.set(5, 7/2)
stageMultiplierMap.set(6, 8/2)

const accuracyStageMultiplierMap: Map<number, number> = new Map()
accuracyStageMultiplierMap.set(-6, 3/9)
accuracyStageMultiplierMap.set(-5, 3/8)
accuracyStageMultiplierMap.set(-4, 3/7)
accuracyStageMultiplierMap.set(-3, 3/6)
accuracyStageMultiplierMap.set(-2, 3/5)
accuracyStageMultiplierMap.set(-1, 3/4)
accuracyStageMultiplierMap.set(0, 3/3)
accuracyStageMultiplierMap.set(1, 4/3)
accuracyStageMultiplierMap.set(2, 5/3)
accuracyStageMultiplierMap.set(3, 6/3)
accuracyStageMultiplierMap.set(4, 7/3)
accuracyStageMultiplierMap.set(5, 8/3)
accuracyStageMultiplierMap.set(6, 9/3)

export function getStageMultiplier(stageStat: StageStat, stageValue: number): number {
  let stageMultiplierValue
  if (stageStat === 'accuracy' || stageStat === 'evasion') {
    stageMultiplierValue = accuracyStageMultiplierMap.get(stageValue)
  } else {
    stageMultiplierValue = stageMultiplierMap.get(stageValue)
  }

  if (stageMultiplierValue) {
    return stageMultiplierValue
  } else {
    throw new Error('Unable to retrieve stage multiplier for: ' + stageStat + ', value: ' + stageValue)
  }
}

export const stageStatDisplayTexts: Record<StageStat, string> = {
  attack: 'attack',
  defense: 'defense',
  specialAttack: 'special attack',
  specialDefense: 'special defense',
  accuracy: 'accuracy',
  evasion: 'evasion',
  speed: 'speed'
}

export function getStageChangeMsg(pokemon: Pokemon, stageStat: StageStat, numberOfStages: number, actualChange: number): string {
  const stageStatDisplay = stageStatDisplayTexts[stageStat]
  if (actualChange > 0) {
    if (actualChange === 1) {
      return `${pokemon.name}'s ${stageStatDisplay} rose!`
    } else {
      return `${pokemon.name}'s ${stageStatDisplay} rose sharply!`
    }
  } else if (actualChange < 0) {
    if (actualChange === -1) {
      return `${pokemon.name}'s ${stageStatDisplay} fell!`
    } else {
      return `${pokemon.name}'s ${stageStatDisplay} harshly fell!`
    }
  } else {
    if (numberOfStages > 0) {
      return `${pokemon.name}'s ${stageStatDisplay} won't go any higher!`
    } else {
      return `${pokemon.name}'s ${stageStatDisplay} won't go any lower!`
    }
  }
}