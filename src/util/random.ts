import { logInfo } from "./logger.js"

// Returns a random number between 0 and 1
interface RandomNumberGenerator {
  (): number
}

export class Random {
  rng: RandomNumberGenerator
  constructor(rng?: RandomNumberGenerator) {
    if (rng) {
      this.rng = rng
    } else {
      this.rng = Math.random
    }
  }
  coinFlip(): boolean {
    return this.rng() < 0.5
  }
  randomPick<T>(options: T[]): T {
    return options[Math.floor(this.rng() * options.length)]
  }
  weightedRandomPick<T>(options: T[], chances: number[]): T {
    if (options.length !== chances.length) {
      throw new Error('Each option should have a chance number')
    }
    let sum = chances.reduce((prev, current) => prev + current, 0)
    if (sum < .9) {
      logInfo('WARNING: Chance numbers should add up to 1 or nearly 1. Instead the sum is: ' + sum)
    }
    let random = this.rng()
    let totalChances = 0
    for (let i = 0; i < options.length; i++) {
      totalChances += chances[i]
      if (random <= totalChances) {
        return options[i]
      }
    }
    throw new Error('Something went wrong during weighted random pick')
  }
  randomFloatInRange(start: number, end: number): number {
    return this.rng() * (end - start) + start
  }
  randomIntegerInRange(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max) + 1
    return Math.floor(this.rng() * (max - min) + min)
  }
  roll(percentage: number): boolean {
    return this.rng() < percentage
  }
  generateId(): string {
    return Math.floor(1000 + this.rng() * 9000) + ''
  }
  shuffle(array: any[]) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
}