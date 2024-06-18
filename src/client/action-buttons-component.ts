import { isRaised, Pokemon } from "../model/pokemon";
import { BaseComponent } from "./base-component";
import { playClickSound } from "./audio";
import { isTrapped } from "../model/trap";

let tipShown = false

export class ActionButtonsComponent extends BaseComponent<{
  battle_id: string,
  user_pokemon: Pokemon,
  enemy_pokemon: Pokemon
}> {
  template = /*html*/ `
    <div class="grid grid-cols-2 gap-1">
      <div @click="selectFight" class="ml-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
        Fight
      </div>
      <div @click="selectSwitch" class="mr-1 mt-2 h-16 {{getCursor()}} {{getBgColor()}} text-center text-lg pt-3 rounded border-2 border-solid border-black">
        Switch Out
      </div>
    </div>
  `
  selectFight() {
    playClickSound()
    if (!tipShown) {
      tipShown = true
      this.$controller.publish({
        type: 'DISPLAY_MESSAGE',
        message: 'Press and hold on a Pokemon or move for more info.'
      })
    }
    this.$controller.publish({
      type: 'CLIENT_STATE_CHANGE',
      newState: 'SELECTING_MOVE'
    })
  }
  selectSwitch() {
    if (!tipShown) {
      tipShown = true
      this.$controller.publish({
        type: 'DISPLAY_MESSAGE',
        message: 'Press and hold on a Pokemon or move for more info.'
      })
    }
    if (this.canSwitch()) {
      playClickSound()
      this.$controller.publish({
        type: 'CLIENT_STATE_CHANGE',
        newState: 'SELECTING_POKEMON'
      })
    }
  }
  canSwitch() {
    return !isTrapped(this.props.user_pokemon, this.props.enemy_pokemon)
  }
  getCursor() {
    return this.canSwitch() ? 'cursor-pointer' : 'cursor-not-allowed'
  }
  getBgColor() {
    return this.canSwitch() ? 'bg-gray-100' : 'bg-gray-400'
  }
}
