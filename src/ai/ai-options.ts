import { Random } from "../util/random"

export type AIOptions<T> = {
  option: T
  weight: number
  desc: string
}[]

export function selectAIOption<T>(aiOptions: AIOptions<T>, random: Random): T {
  if (aiOptions.length === 0) {
    throw new Error('Empty AI options array')
  }
  const totalWeight = aiOptions.reduce((prev, current) => {
    return prev + current.weight
  }, 0)
  const options = aiOptions.map(aiOption => aiOption.option)
  if (totalWeight === 0) {
    return random.randomPick(options)
  } else {
    const chances = aiOptions.map(aiOption => aiOption.weight / totalWeight)
    return random.weightedRandomPick(options, chances)
  }
}

export function optionsToString<T>(aiOptions: AIOptions<T>): string {
  // AI Options: 0->90,1->10
  return aiOptions.reduce((prev, current) => {
    return prev + ` Opt:${current.desc}(${current.option})->Weight:${current.weight}`
  }, 'AI Options:')
}