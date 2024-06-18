import { AbilityDefinition } from "../model/ability-definition"
import { Move } from "../model/move"
import { MoveDefinition } from "../model/move-definition"
import { Pokemon } from "../model/pokemon"
import { PokemonSpecies } from "../model/pokemon-species"
import { DefensiveEffectiveness, getDefensiveEffectivenessForTypes, Type } from "../model/type"
import { BaseComponent } from "./base-component"
import { TypeCardComponent } from "./type-card-component"
import { TYPE_COLORS } from "./type-colors"

export class PokemonCardComponent extends BaseComponent<{
  species: PokemonSpecies
  click_move?: (move: MoveDefinition) => void
  league?: boolean
}> {
  defensiveEffectiveness: DefensiveEffectiveness | null = null
  // {{props.species.pokedexNumber}}, // {{props.species.name.toUpperCase()}}
  constructor(props: any) {
    super(props)
    this.defensiveEffectiveness = getDefensiveEffectivenessForTypes(props.species.types, props.species.ability)
  }
  template = /*html*/ `
    <div class="">
      <div class="grid justify-items-center">
        <span class="text-lg mb-1">
        {{props.species.name.toUpperCase()}}
        </span>
        <span $if="props.league" class="text-sm text-gray-600 mb-1">
          Lv{{props.species.level}}
        </span>
        <img class="h-24" src="/sprites/front/{{getSprite(props.species)}}.png" />
        <types-row :types="props.species.types"></types-row>
      </div>
      <div class="mt-2 mb-2 p-1">
        <stat-row-component desc="HP" :value="props.species.hp">
        </stat-row-component>
        <stat-row-component desc="ATTACK" :value="props.species.attack">
        </stat-row-component>
        <stat-row-component desc="DEFENSE" :value="props.species.defense">
        </stat-row-component>
        <stat-row-component desc="SP. ATK" :value="props.species.specialAttack">
        </stat-row-component>
        <stat-row-component desc="SP. DEF" :value="props.species.specialDefense">
        </stat-row-component>
        <stat-row-component desc="SPEED" :value="props.species.speed">
        </stat-row-component>
      </div>
      <moves-component $if="!props.league" :moves="props.species.moves" :action="props.click_move"></moves-component>
      <tab-switcher :species="props.species"
        :click_move="props.click_move"
        :league="props.league"
        :eff="defensiveEffectiveness">
      </tab-switcher>
    </div>
  `
  includes = {
    StatRowComponent,
    TypesRow,
    TypeCardComponent,
    TabSwitcher,
    MovesComponent
  }
}

class TypesRow extends BaseComponent<{
  types: Type[]
}>{
  template = /*html*/ `
    <div class="flex flex-row">
      <type-card-component :type="props.types[0]"></type-card-component>
      <div class="ml-2">
        <type-card-component $if="props.types.length > 1" :type="props.types[1]"></type-card-component>
      </div>
    </div>
  `
  includes = {
    TypeCardComponent
  }
}

const MAX_PERCENT = 100
const MIN_PERCENT = 8

class StatRowComponent extends BaseComponent<{
  desc: string
  value: number
}> {
  template = /*html*/ `
    <div class="flex flex-row items-center mb-1">
      <div class="mr-1 w-16 text-xs text-right">
        {{props.desc}}
      </div>
      <div class="w-48 rounded-lg">
        <div style="width: {{getPercent()}}%;" class="{{getColor()}} h-2 rounded-lg border border-solid border-gray-500">
        </div>
      </div>
    </div>
  `
  
  getPercent() {
    let percent = this.props.value - 45
    if (percent > MAX_PERCENT) {
      percent = MAX_PERCENT
    }
    if (percent < MIN_PERCENT) {
      percent = MIN_PERCENT
    }
    return percent
  }

  getColor(): string {
    const value = this.props.value
    if (value >= 150) {
      return 'stat-bar-best'
    } else if (value >= 120) {
      return 'stat-bar-verygood'
    } else if (value >= 90) {
      return 'stat-bar-good'
    } else if (value >= 60) {
      return 'stat-bar-ok'
    } else if (value >= 35) {
      return 'stat-bar-bad'
    } else {
      return 'stat-bar-worst'
    }
  }

}

class MovesComponent extends BaseComponent<{
  action?: (move: MoveDefinition) => void
}> {
  template = /*html*/ `
    <div class="">
      <div :class="props.moves.length === 1 ? 'grid grid-cols-1 mx-10' : 'grid grid-cols-2 gap-1'">
        <div $for="move in props.moves" @click="clickHandler(move)" style="background-color: {{getBgColor(move.type)}};" class="{{getCursor()}} text-xs rounded text-white text-center p-1 border border-solid border-gray-500">
          {{move.name.toUpperCase()}}
        </div>
      </div>
    </div>
  `
  getBgColor(type: Type) {
    return TYPE_COLORS[type]
  }

  getCursor() {
    return this.props.action ? 'cursor-pointer': ''
  }

  clickHandler(move: MoveDefinition) {
    if (this.props.action) {
      // @ts-ignore
      return () => this.props.action(move)
    } else {
      return () => {}
    }
  }
}

class DefensiveTypeEffectivenessComponent extends BaseComponent<{
  eff: DefensiveEffectiveness
}> {
  template = /*html*/`
    <div class="">
      <div $if="props.eff.effective.length" class="mt-2">
        <h2 class="text-center font-semibold">Effective</h2>
        <div class="flex flex-row justify-center flex-wrap">
          <type-card-component $for="type in props.eff.effective" :type="type"></type-card-component>
        </div>
      </div>
      <div $if="props.eff.notEffective.length" class="mt-2">
        <h2 class="text-center font-semibold">Not Effective</h2>
        <div class="flex flex-row justify-center flex-wrap">
          <type-card-component $for="type in props.eff.notEffective" :type="type"></type-card-component>
        </div>
      </div>
      <div $if="props.eff.noEffect.length" class="mt-2">
        <h2 class="text-center font-semibold">No Effect</h2>
        <div class="flex flex-row justify-center flex-wrap">
          <type-card-component $for="type in props.eff.noEffect" :type="type"></type-card-component>
        </div>
      </div>
    </div>
  `
  includes = {
    TypeCardComponent,
  }
}


// <tab-title text="Moves" :click="()=>this.switch('Moves')" :selected="selected"></tab-title>
// <moves-component $if="selected == 'Moves' && !props.league" :moves="props.species.moves" :action="props.click_move"></moves-component>
export class TabSwitcher extends BaseComponent<{}> {
  ability = 'Ability'
  types = 'Type Eff.'
  selected = this.ability
  template = /*html*/`
    <div class="mt-4">
      <div class="grid grid-cols-2">
        <tab-title :text="ability" :click="()=>this.switch(ability)" :selected="selected"></tab-title>
        <tab-title :text="types" :click="()=>this.switch(types)" :selected="selected"></tab-title>
      </div>
      <div class="p-2 text-sm border-b border-r border-l border-solid border-gray-300 rounded-b-lg" style="min-height: 140px">
        <div $if="selected == ability" class="">
          <h2 class="text-center font-semibold">{{props.species.ability.name}}</h2>
          <p class="mt-1 text-xs pr-3 pl-3">
            {{props.species.ability.desc}}
          </p>
        </div>
        <defensive-type-effectiveness-component $if="selected == types" :eff="props.eff">
        </defensive-type-effectiveness-component>
      </div>
    </div>
  `
  includes = {
    TabTitle,
    MovesComponent,
    DefensiveTypeEffectivenessComponent,
  }
  switch(newTab: string) {
    this.selected = newTab
  }
}

export class TabTitle {
  template = /*html*/`
    <span @click="props.click" class="text-center {{props.selected == props.text ? '' : 'bg-gray-200'}} {{props.selected == props.text ? '' : 'cursor-pointer'}} text-sm font-medium py-1 px-3 rounded-t-lg border-t border-r border-l border-solid border-gray-300">
      {{props.text}}
    </span>
  `
}