import { Battle } from "../model/battle";
import { PlayerActionEvent, RematchCreatedEvent } from "../model/battle-event";
import { sleep } from "../util/async-utils";
import { logDebug } from "../util/logger";
import { clientError, getBattle, getPlayers, getUserName, postPlayerAction } from "./client-api";
import { Controller } from "./controller";

export class BattleLoopHandler {

  eventCursor: number = 0
  running: boolean = true
  battleId: string
  controller: Controller

  constructor(battleId: string, controller: Controller) {
    this.battleId = battleId
    this.controller = controller
  }

  async start(initialBattle: Battle) {
    this.eventCursor = initialBattle.events.length
    this.handlePlayerAction = this.handlePlayerAction.bind(this)
    this.controller.subscribe('PLAYER_ACTION', this.handlePlayerAction)
    this.controller.subscribe('REMATCH_CREATED', this.handleRematchCreated)
    // This sleep is to prevent a stutter in the terminal when the page first loads
    await sleep(100)
    await this.process(initialBattle)
  }

  stop() {
    this.running = false
    this.controller.unsubscribe('PLAYER_ACTION', this.handlePlayerAction)
    this.controller.unsubscribe('REMATCH_CREATED', this.handleRematchCreated)
  }

  async handleRematchCreated(event: RematchCreatedEvent) {
    window.location.href = `/battle/${event.newBattleId}`
  }

  async handlePlayerAction(event: PlayerActionEvent) {
    logDebug('Handling player action')
    try {
      await this.controller.publish({
        type: 'CLIENT_STATE_CHANGE',
        newState: 'SENDING_PLAYER_ACTION'
      })
      let battle = await postPlayerAction(this.battleId, event)
      if (this.hasNewEvents(battle)) {
        await this.controller.publish({
          type: 'CLIENT_STATE_CHANGE',
          newState: 'PLAYING_ANIMATIONS'
        })
      } else {
        await this.controller.publish({
          type: 'CLIENT_STATE_CHANGE',
          newState: 'WAITING'
        })
        await this.controller.publish({
          type: 'DISPLAY_MESSAGE',
          message: 'Waiting for other player...'
        })
      }
      await this.pollForNewEvents(battle)
    } catch (e) {
      clientError(e)
    }
  }

  async pollForNewEvents(battle: Battle) {
    let hasNewEvents = false
    while (!hasNewEvents && this.running) {
      if (this.hasNewEvents(battle)) {
        logDebug('Received new battle events')
        hasNewEvents = true
        await this.process(battle)
        if (battle.battleState === 'SELECTING_REQUIRED_SWITCH' && !battle.requiredToSwitch.includes(getUserName())) {
          // Enemy needs to switch so go back to waiting and polling
          hasNewEvents = false
        }
      } else {
        logDebug('Polling...')
        await sleep(2000)
        battle = await getBattle(this.battleId)
      }
    }
  }

  hasNewEvents(battle: Battle) {
    return battle.events.length > this.eventCursor
  }

  async process(battle: Battle) {
    this.controller.publish({
      type: 'BATTLE_STATE_CHANGE',
      newState: battle.battleState
    })
    const newEvents = battle.events.slice(this.eventCursor, battle.events.length)
    for (const event of newEvents) {
      await this.controller.publish(event)
    }
    this.eventCursor = battle.events.length
    const { user, enemy } = getPlayers(battle)
    if (battle.battleState === 'GAME_OVER') {
      // Game is over
      // await this.controller.publish({
      //   type: 'CLIENT_STATE_CHANGE',
      //   newState: 'SELECTING_ACTION'
      // })
      // this.pollForNewEvents(battle)
    } else if (battle.pendingPlayerAction?.playerName === getUserName() || 
      (battle.battleState === 'SELECTING_REQUIRED_SWITCH' && !battle.requiredToSwitch.includes(getUserName()))) {
      // User already submitted action or waiting on enemy to do a required switch
      await this.controller.publish({
        type: 'CLIENT_STATE_CHANGE',
        newState: 'WAITING'
      })
      await this.controller.publish({
        type: 'DISPLAY_MESSAGE',
        message: 'Waiting for other player...'
      })
      // this.pollForNewEvents(battle)
    } else if (battle.battleState === 'SELECTING_FIRST_POKEMON') {
      // Pause to give time for music to start
      await sleep(500)
      await this.controller.publish({
        type: 'DISPLAY_MESSAGE',
        message: `${enemy.name} has challenged you to a battle!`
      })
      await this.controller.publish({
        type: 'CLIENT_STATE_CHANGE',
        newState: 'SELECTING_POKEMON'
      })
      await this.controller.publish({
        type: 'DISPLAY_MESSAGE',
        message: `Who will go out first?`
      })
    } else if (battle.battleState === 'SELECTING_REQUIRED_SWITCH') { 
      // User is required to switch because their Pokemon fainted
      await this.controller.publish({
        type: 'CLIENT_STATE_CHANGE',
        newState: 'SELECTING_POKEMON'
      })
      await this.controller.publish({
        type: 'DISPLAY_MESSAGE',
        message: `Who will go out next?`
      })
    } else {
      // User needs to select action
      await this.controller.publish({
        type: 'CLIENT_STATE_CHANGE',
        newState: 'SELECTING_ACTION'
      })
      await this.controller.publish({
        type: 'DISPLAY_MESSAGE',
        message: `What will ${user.team[user.activePokemonIndex].name} do?`
      })
    }
  }

}
