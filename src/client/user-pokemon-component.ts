import { BasePokemonComponent } from "./base-pokemon-component"
import { UserHazardsComponent } from "./hazards-component"
import { HpComponent } from './hp-component'
import { StatusIndicatorComponent } from "./status-indicator-component"

let pressAndHoldCallback: any

export class UserPokemonComponent extends BasePokemonComponent {

  constructor(props: any) {
    super(props, true)
  }

  template = /*html*/ `
    <div class="relative">
      <div $class="{invisible: !hudVisible}" class="absolute flex flex-row justify-end items-center h-32 w-full">
        <div style="width: 10.2rem" class="z-20 rounded border-2 border-solid border-black h-14 mr-5 bg-gray-100">
          <div class="flex flex-row justify-between h-10">
            <div class="ml-2 mt-2 select-none">{{props.pokemon.name}}</div>
            <div $if="!status" class="mr-2 mt-2 select-none">Lv{{props.pokemon.level}}</div>
            <div $if="status" class="mr-2 mt-2">
              <status-indicator-component :condition="status"></status-indicator-component>
            </div>
          </div>
          <hp-component :pokemon="props.pokemon" :is_user="true"></hp-component>
        </div>
      </div>
      <div class="flex flex-row justify-start items-end h-32">
        <img 
          @mousedown="(e)=>handleDown(e)" 
          @mouseup="(e)=>handleUp(e)" 
          @touchstart="(e)=>handleDown(e)" 
          @touchend="(e)=>handleUp(e)"
          $class="{invisible: !visible, user_deploying: deploying, user_withdrawing: withdrawing}" 
          class="{{props.animation_ctx.transformAnimationState}} {{getBottomPadding()}} absolute block cursor-pointer z-10" 
          style="height: {{getImgHeight()}}rem; padding-left: {{getLeftPadding()}}px"
          :src="getPokemonImg()"
          data-pokemon-img>
        <user-hazards-component 
          :reflect="reflect" 
          :light_screen="light_screen" 
          :rocks="rocks" 
          :web="web" 
          :spikes="spikes" 
          :toxic_spikes="toxic_spikes">
        </user-hazards-component>
      </div>
    </div>
  `
  includes = {
    HpComponent,
    StatusIndicatorComponent,
    UserHazardsComponent
  }

  getLeftPadding() {
    return 24
  }

  getBottomPadding() {
    if (this.props.pokemon.name.toLowerCase() === 'sylveon') {
      return ''
    } else {
      return 'pb-3'
    }
  }

  getImgHeight() {
    return this.props.pokemon.imgHeight
  }

  getPokemonImg() {
    return `/sprites/back-ani/${this.props.pokemon.spriteName}.gif`
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
      isUser: true,
    })
  }

}