import { getAccuracyDisplayValue, Move } from "../model/move";
import { Type } from "../model/type";
import { BaseComponent } from "./base-component";
import { getUserName } from "./client-api";
import { playClickSound } from "./audio";
import { TypeCardComponent } from "./type-card-component";
import { TYPE_COLORS } from "./type-colors";
import { WideButtonComponent } from "./wide-button-component"

let pressAndHoldCallback: any

export class MoveButtonsComponent extends BaseComponent<{
  moves: Move[]
}> {
  template = /*html*/ `
    <div class="grid grid-cols-2 gap-1">
      <move-button-component
        $for="move, i in props.moves" 
        :move="move" 
        :index="i">
      </move-button-component>
      <wide-button-component $if="noMovesAreSelectable()" text="Struggle" :action="()=>selectStruggle()"></wide-button-component>
      <wide-button-component text="Cancel" :action="()=>cancel()"></wide-button-component>
    </div>
  `
  includes = {
    MoveButtonComponent,
    WideButtonComponent
  }

  noMovesAreSelectable(): boolean {
    return this.props.moves.filter(move => move.pp > 0).length < 1
  }

  async cancel() {
    playClickSound()
    await this.$controller.publish({
      type: 'CLIENT_STATE_CHANGE', 
      newState: 'SELECTING_ACTION'
    })
  }

  selectStruggle() {
    playClickSound()
    this.$controller.publish({
      type: 'PLAYER_ACTION',
      playerName: getUserName(),
      details: {
        type: 'SELECT_MOVE',
        moveIndex: 0,
        struggle: true
      }
    })
  }

}

class MoveButtonComponent extends BaseComponent<{
  index: number,
  move: Move
}> {

  template = /*html*/ `
    <div 
      @mousedown="(e)=>handleDown(e)" 
      @mouseup="(e)=>handleUp(e)" 
      @touchstart="(e)=>handleDown(e)" 
      @touchend="(e)=>handleUp(e)"
      class="{{getCursor()}} {{getBgColor(props.move.type)}} {{getMargin()}} p-2 h-20 rounded border-2 border-solid border-black flex flex-col justify-between"
      >
      <div class="flex flex-row justify-between px-2">
        <div class="select-none">{{props.move.name}}</div>
      </div>
      <div class="flex flex-row items-center px-2">
        <type-card-component :type="props.move.type"></type-card-component>
        <div class="select-none ml-7">{{props.move.pp}}/{{props.move.startingPP}}</div>
      </div>
    </div>
  `
  includes = {
    TypeCardComponent
  }

  isSelectable(): boolean {
    return this.props.move.pp > 0
  }

  handleDown(event: any) {
    event.preventDefault()
    pressAndHoldCallback = setTimeout(() => {
      const moveToShow = this.props.move
      if (moveToShow) {
        playClickSound()
        this.$controller.publish({
          type: 'SHOW_MOVE_CARD',
          move: moveToShow
        })
      }
      pressAndHoldCallback = null
    }, 500)
  }

  handleUp(event: any) {
    event.preventDefault()
    if (pressAndHoldCallback) {
      clearTimeout(pressAndHoldCallback)
      this.selectMove()
    }
  }

  selectMove() {
    if (this.isSelectable()) {
      playClickSound()
      this.$controller.publish({
        type: 'PLAYER_ACTION',
        playerName: getUserName(),
        details: {
          type: 'SELECT_MOVE',
          moveIndex: this.props.index
        }
      })
    }
  }

  getBgColor() {
    return this.isSelectable() ? 'bg-gray-100' : 'bg-gray-400'
  }

  getMargin() {
    let margin = ''
    if (this.props.index % 2 === 0) {
      margin += 'ml-1 '
    } else {
      margin += 'mr-1 '
    }
    if (this.props.index < 2) {
      margin += 'mt-2 '
    }
    return margin
  }

  getCursor() {
    return this.isSelectable() ? 'cursor-pointer' : 'cursor-not-allowed'
  }

  getAccuracy(move: Move) {
    return getAccuracyDisplayValue(move)
  }

}