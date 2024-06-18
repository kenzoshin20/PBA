import { Pokemon } from "../model/pokemon"
import { BaseComponent } from "./base-component"
import { getUserName } from "./client-api"
import { getColor, getPercent, HpBarComponent } from "./hp-component"
import { playClickSound } from "./audio"
import { StatusIndicatorComponent } from "./status-indicator-component"
import { WideButtonComponent } from "./wide-button-component"

let pressAndHoldCallback: any

export class PokemonButtonsComponent extends BaseComponent<{
  team: Pokemon[],
  cancellable: boolean,
  current: number
}> {
  template = /*html*/ `
    <div class="grid grid-cols-2 gap-1">
      <pokemon-button-component 
        $for="pokemon, i in props.team" 
        :pokemon="pokemon" 
        :index="i"
        :disabled="props.cancellable && (i === props.current || pokemon.hp <= 0)">
      </pokemon-button-component>
      <wide-button-component $if="props.cancellable" text="Cancel" :action="()=>cancel()">
      </wide-button-component>
    </div>
  `
  includes = {
    PokemonButtonComponent,
    WideButtonComponent
  }

  async cancel() {
    playClickSound()
    await this.$controller.publish({
      type: 'CLIENT_STATE_CHANGE', 
      newState: 'SELECTING_ACTION'
    })
  }

}

class PokemonButtonComponent extends BaseComponent<{
  index: number,
  pokemon: Pokemon,
  disabled: boolean
}> {

  template = /*html*/ `
    <div class="{{getCursor()}} {{getBgColor()}} {{getMargin()}} text-center text-lg h-16 rounded border-2 border-solid border-black"
      @mousedown="(e)=>handleDown(e)" 
      @mouseup="(e)=>handleUp(e)" 
      @touchstart="(e)=>handleDown(e)" 
      @touchend="(e)=>handleUp(e)"
      >
      <div class="flex flex-row px-2">
        <div>
          <img class="h-12 w-12" src="/sprites/front/{{props.pokemon.startingSpriteName}}.png" alt:="props.pokemon.name" />
        </div>
        <div>
          <div class="text-xs flex flex-row justify-between items-center w-32 mb-3">
            <div class="ml-3 mt-2">
              {{props.pokemon.name}}
            </div>
            <div $if="props.pokemon.hp <= 0 || !props.pokemon.nonVolatileStatusCondition" class="mr-2 mt-2">
              Lv{{props.pokemon.level}}
            </div>
            <div $if="props.pokemon.hp > 0 && props.pokemon.nonVolatileStatusCondition" class="mr-2 mt-2">
              <status-indicator-component :condition="props.pokemon.nonVolatileStatusCondition"></status-indicator-component>
            </div>
          </div>
          <hp-bar-component :percent="getHpBarProps().percent" :color="getHpBarProps().color"></hp-bar-component>
        </div>
      </div>
    </div>
  `
  includes = {
    HpBarComponent,
    StatusIndicatorComponent
  }

  isSelectable(): boolean {
    return this.props.pokemon.hp > 0 && !this.props.disabled
  }

  handleDown(event: any) {
    event.preventDefault()
    pressAndHoldCallback = setTimeout(() => {
      const pokemonToShow = this.props.pokemon
      if (pokemonToShow) {
        playClickSound()
        this.$controller.publish({
          type: 'SHOW_POKEMON_CARD',
          pokemon: pokemonToShow,
          isUser: true,
        })
      }
      pressAndHoldCallback = null
    }, 500)
  }

  handleUp(event: any) {
    event.preventDefault()
    if (pressAndHoldCallback) {
      clearTimeout(pressAndHoldCallback)
      this.selectPokemon()
    }
  }

  selectPokemon() {
    if (this.isSelectable()) {
      playClickSound()
      this.$controller.publish({
        type: 'PLAYER_ACTION',
        playerName: getUserName(),
        details: {
          type: 'SELECT_POKEMON',
          pokemonIndex: this.props.index
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

  getHpBarProps() {
    const percent = getPercent(this.props.pokemon.hp, this.props.pokemon.startingHP)
    const color = getColor(percent)
    return { percent, color }
  }

}