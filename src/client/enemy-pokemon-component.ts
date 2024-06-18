import { BasePokemonComponent } from './base-pokemon-component'
import { EnemyHazardsComponent } from './hazards-component'
import { HpComponent } from './hp-component'
import { StatusIndicatorComponent } from "./status-indicator-component"

let pressAndHoldCallback: any

export class EnemyPokemonComponent extends BasePokemonComponent {

  constructor(props: any) {
    super(props, false)
  }

  template = /*html*/ `
    <div>
      <div $class="{invisible: !hudVisible}" class="absolute flex flex-row justify-start items-center h-32 w-full">
        <div style="width: 10.2rem" class="z-20 border-2 border-solid border-black h-14 ml-5 bg-gray-100">
          <div class="flex flex-row justify-between h-10">
            <div class="ml-2 mt-2 select-none">{{props.pokemon.name}}</div>
            <div $if="!status" class="mr-2 mt-2 select-none">Lv{{props.pokemon.level}}</div>
            <div $if="status" class="mr-2 mt-2">
              <status-indicator-component :condition="status"></status-indicator-component>
            </div>
          </div>
          <hp-component :pokemon="props.pokemon" :is_user="false"></hp-component>
        </div>
      </div>
      <div class="flex flex-row justify-end items-end h-32">
        <enemy-hazards-component 
          :reflect="reflect" 
          :light_screen="light_screen" 
          :rocks="rocks" 
          :web="web" 
          :spikes="spikes" 
          :toxic_spikes="toxic_spikes">
        </enemy-hazards-component>
        <img 
          @mousedown="(e)=>handleDown(e)" 
          @mouseup="(e)=>handleUp(e)" 
          @touchstart="(e)=>handleDown(e)" 
          @touchend="(e)=>handleUp(e)"
          $class="{invisible: !visible, enemy_deploying: deploying, enemy_withdrawing: withdrawing}" 
          class="{{props.animation_ctx.transformAnimationState}} max-h-32 pr-14 absolute block cursor-pointer z-10" 
          :src="getPokemonImg()"
          data-pokemon-img>
      </div>
    </div>
  `

  includes = {
    EnemyHazardsComponent,
    HpComponent,
    StatusIndicatorComponent,
  }

  getPokemonImg() {
    return `/sprites/front-ani/${this.props.pokemon.spriteName}.gif`
  }

  handleDown(event: any) {
    event.preventDefault()
    pressAndHoldCallback = setTimeout(() => {
      const pokemonToShow = this.props.pokemon.species
      if (pokemonToShow) {
        this.showPokemonCard()
      }
      pressAndHoldCallback = null
    }, 500)
  }

  handleUp(event: any) {
    event.preventDefault()
    if (pressAndHoldCallback) {
      clearTimeout(pressAndHoldCallback)
      this.showPokemonCard()
    }
  }

  showPokemonCard() {
    this.$controller.publish({
      type: 'SHOW_POKEMON_CARD',
      pokemon: this.props.pokemon,
      isUser: false,
    })
  }

}