import { DisplayMessageEvent } from "../model/battle-event"
import { playAnimation, sleep } from "../util/async-utils"
import { BaseComponent } from "./base-component"
import { getUserName } from "./client-api"
import { getTextLines } from "../util/text-utils"

const MAX_LINES = 2
const MAX_LINE_LENGTH = 30
const TEXT_SCROLL_SPEED = 15
const MESSAGE_DELAY = 1_000
const SHORTER_MESSAGE_DELAY = 500

let currentEvent: DisplayMessageEvent | undefined = undefined

export class TerminalComponent extends BaseComponent<void> {

  messageLines: string[] = []

  template = /*html*/ `
    <div style="max-width: 500px;" class="rounded pt-3 pl-4 pr-4 ml-1 mr-1 h-20 border-2 border-solid border-black bg-gray-100 select-none">
      <div $if="messageLines.length > 0">{{messageLines[0]}}</div>
      <div $if="messageLines.length > 1">{{messageLines[1]}}</div>
    </div>
  `

  async beforeMount() {
    this.$controller.subscribe('DISPLAY_MESSAGE', this.displayMessage)
  }

  beforeUnmount() {
    this.$controller.unsubscribe('DISPLAY_MESSAGE', this.displayMessage)
  }

  async displayMessage(event: DisplayMessageEvent) {
    currentEvent = event
    if (!event.forPlayerName || event.forPlayerName === getUserName()) {
      this.messageLines = []

      if (event.message) {
        let message = event.message

        if (event.referencedPlayerName && event.referencedPlayerName !== getUserName()) {
          // Add "The enemy" prefix if referencing the other player
          message = 'The enemy ' + message
        }

        // Break the message into substrings that are the length of the terminal's width
        const parsedTextLines = getTextLines(message, MAX_LINE_LENGTH)
        let displayLineCount = 0

        for (let line of parsedTextLines) {

          if (displayLineCount >= MAX_LINES) {
            // The terminal is full so remove the top line
            this.messageLines.shift()
          }

          // Add a new line
          this.messageLines.push('')
          
          let charCount = 0

          // Play the animation for the line
          const animation = () => {
            const char = line.charAt(charCount)
            this.messageLines[this.messageLines.length-1] = this.messageLines[this.messageLines.length-1] + char
            charCount++
          }
          const whileCondition = () => currentEvent === event && charCount < line.length
          await playAnimation(animation, whileCondition, TEXT_SCROLL_SPEED)

          // Increment count at end to keep it zero based
          displayLineCount++

          await sleep(TEXT_SCROLL_SPEED)
        }

        // All lines are done
        if (event.lengthOfPause === 'NONE') {
          // Don't sleep
        } else if (event.lengthOfPause === 'SHORTER') { 
          await sleep(SHORTER_MESSAGE_DELAY)
        } else {
          await sleep(MESSAGE_DELAY)
        }

      }
    }
  }

}