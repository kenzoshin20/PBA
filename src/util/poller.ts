import { sleep } from "./async-utils.js"
import { logDebug } from "./logger.js"

export class Poller {

  // Intervals to use, in seconds
  // Once it gets to the end of the schedule
  // it will keep using the last interval
  schedule: number[] = [
    1, 1, 1, 1, 1,
    2, 2, 2, 2, 2,
    3, 3, 3, 3, 3,
    5, 5, 5, 5, 5,
    10
  ]

  // Required. What the poller does after each interval
  action: (() => Promise<void>) | undefined

  // Required. Function should return true when the poller can stop
  endCondition: (() => Promise<boolean>) | undefined

  async run(): Promise<void> {
    if (!this.action) {
      throw new Error('No action defined')
    }
    if (!this.endCondition) {
      throw new Error('No endCondition defined')
    }

    logDebug('Starting polling loop')

    let scheduleIndex = 0

    let polling = true
    while (polling) {
      await this.action()
      const done = await this.endCondition()
      if (!done) {
        const sleepTimeInSeconds = this.schedule.length > scheduleIndex ? this.schedule[scheduleIndex] : this.schedule[this.schedule.length-1]
        await sleep(sleepTimeInSeconds * 1_000)
        scheduleIndex++
      } else {
        polling = false
      }
    }

  }

}