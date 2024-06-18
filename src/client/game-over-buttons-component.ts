import { Battle, BattleSubType, BattleType } from "../model/battle"
import { BaseComponent } from "./base-component"
import { getUserName } from "./client-api"

export class GameOverButtonsComponent extends BaseComponent<{
  battle: Battle
  won: boolean
}> {
  template = /*html*/ `
    <div class="grid grid-cols-2 gap-1">
      <div @click="selectRematch" class="ml-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
        {{getRematchText()}}
      </div>
      <div @click="selectQuit" class="mr-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
        Quit
      </div>
    </div>
  `
  getRematchText(): string {
    if (this.props.battle.battleType === 'SINGLE_PLAYER') {
      if (this.props.battle.battleSubType === 'LEAGUE') {
        if (!this.props.won) {
          return 'Rematch'
        } else {
          return 'Next Battle'
        }
      } else {
        return 'New Battle'
      }
    } else {
      return 'Rematch'
    }
  }

  selectRematch() {
    if (this.props.battle.battleSubType === 'LEAGUE') {
      this.$router.goTo('/league')
    } else {
      this.$controller.publish({
        type: 'PLAYER_ACTION',
        playerName: getUserName(),
        details: {
          type: 'REQUEST_REMATCH'
        }
      })
    }
  }

  selectQuit() {
    this.$router.goTo('/')
  }

}
