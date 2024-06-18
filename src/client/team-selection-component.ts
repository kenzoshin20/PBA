import { buildPokemon } from "../data/pokemon-data";
import { BattleSubType, BattleType } from "../model/battle";
import { PokemonSpecies } from "../model/pokemon-species";
import { createSpeciesListIndex, normalizeToken } from "../model/search";
import { automaticallyPickTeam } from "../model/team-autopick";
import { BaseComponent } from "./base-component";
import { getBattle, getUser, postPlayerAction } from "./client-api";
import { ClientState } from "./client-state";
import { BackArrowComponent, DoubleBackArrowComponent, DoubleForwardArrowComponent, ForwardArrowComponent, MenuIconComponent } from "./icons-component";
import { ReactiveTextboxComponent } from "./reactive-textbox-component";
import { TerminalComponent } from "./terminal-component";

const RANGE_SIZE = 9
let pressAndHoldCallback: any

interface Props {
  type: BattleType
  sub_type: BattleSubType
  client_state: ClientState
  unlocked_species: PokemonSpecies[]
  select_team: (userTeam: string[], enemyTeam: string[]) => void
}

export class TeamSelectionComponent extends BaseComponent<Props> {

  selectingFor: 'USER' | 'ENEMY' = 'USER'
  speciesList: PokemonSpecies[] = []
  originalSpeciesList: PokemonSpecies[]
  filteredSpeciesList:  PokemonSpecies[]
  selected: string[] = []
  userTeam: string[] = []
  enemyTeam: string[] = []
  speciesListIndex: Record<string, PokemonSpecies[]>
  rangeStart: number = 0
  maxRangeStart: number = 0

  constructor(props: Props) {
    super(props)
    this.originalSpeciesList = props.unlocked_species.sort((a, b) => {
      return a.pokedexNumber - b.pokedexNumber
    })
    this.filteredSpeciesList = this.originalSpeciesList
    this.setMaxRangeStart()
    this.displayRange()
    this.speciesListIndex = createSpeciesListIndex(this.originalSpeciesList)
  }

  template = /*html*/ `
    <div>

      <div class="mt-5 flex flex-row justify-between">
        <back-arrow-component :action="handleBack"></back-arrow-component>
        <div>
          <reactive-textbox-component
            :callback="(value)=>search(value)"
            placeholder="Search for a Pokemon"
            class="text-sm appearance-none border rounded-lg w-64 sm:w-80 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </reactive-textbox-component>
        </div>
        <menu-icon-component :action="handleMenu"></menu-icon-component>
      </div>

      <div class="h-80 mt-5">

        <div class="grid grid-cols-3 place-items-center">
          <div $for="pokemon in speciesList" class="cursor-pointer" 
              @mousedown="(e)=>handleDown(e,pokemon.name)" 
              @mouseup="(e)=>handleUp(e,pokemon.name)" 
              @touchstart="(e)=>handleDown(e,pokemon.name)" 
              @touchend="(e)=>handleUp(e,pokemon.name)">
            <img class="h-20 w-20 {{getBorder(pokemon.name)}}" 
              src="/sprites/front/{{getSprite(pokemon)}}.png" alt:="pokemon.name" />
            <div class="text-sm text-center mb-5">
              {{pokemon.name}}
            </div>
          </div>
        </div>
      </div>
      <grid-nav-component 
        :f="navForward"
        :df="navDoubleForward"
        :b="navBackward"
        :db="navDoubleBackward"
        :start="rangeStart==0"
        :end="rangeStart==maxRangeStart"
        >
      </grid-nav-component>
      <selected-pokemon-component :team="selected"></selected-pokemon-component>
      <terminal-component></terminal-component>
      <div class="grid grid-cols-2 gap-1">
        <div @click="selectDone" $if="props.client_state!=='WAITING'" class="ml-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
          Done
        </div>
        <div @click="autoPick" $if="props.client_state!=='WAITING'" class="mr-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
          Random
        </div>
      </div>
    </div>
  `
  includes = {
    TerminalComponent,
    SelectedPokemonComponent,
    GridNavComponent,
    ReactiveTextboxComponent,
    BackArrowComponent,
    MenuIconComponent
  }

  afterMount() {
    const upToText = this.props.sub_type === 'PRACTICE' ? 'up to ' : ''
    this.$controller.publish({
      type: 'DISPLAY_MESSAGE',
      message: `Select ${upToText}${this.getMaxTeamSize()} Pokemon. Press and hold for more info.`
    })
  }

  getMaxTeamSize() {
    if (this.props.sub_type === 'LEAGUE' && this.props.type === 'SINGLE_PLAYER') {
      return 4
    } else {
      return 6
    }
  }

  handleBack() {
    this.$router.goTo('/')
  }

  setMaxRangeStart() {
    const numberOfWholeRanges = Math.ceil(this.filteredSpeciesList.length / RANGE_SIZE)
    this.maxRangeStart = (numberOfWholeRanges - 1) * RANGE_SIZE
  }

  async handleMenu() {
    let result = confirm('Quit battle?')
    if (result) {
      const user = await getUser()
      if (user.singlePlayerBattleId) {
        const battle = await getBattle(user.singlePlayerBattleId)
        await postPlayerAction(battle.battleId, {
          type: 'PLAYER_ACTION',
          playerName: user.username,
          details: {
            type: 'QUIT_BATTLE'
          }
        })
      }
      this.$router.goTo('/')
    }
  }

  displayRange() {
    this.speciesList = this.filteredSpeciesList.slice(this.rangeStart, this.rangeStart + RANGE_SIZE)
  }

  selectDone() {
    if (this.selected.length === 0) {
      this.$controller.publish({
        type: 'DISPLAY_MESSAGE',
        message: `No Pokemon Selected...`
      })
      return
    }

    if (this.props.sub_type !== 'PRACTICE' && this.selected.length < this.getMaxTeamSize()) {
      this.$controller.publish({
        type: 'DISPLAY_MESSAGE',
        message: `Select ${this.getMaxTeamSize()} Pokemon.`
      })
      return
    } 

    if (this.props.sub_type === 'PRACTICE') {
      if (this.selectingFor === 'USER') {
        this.userTeam = this.selected
        this.selected = []
        this.selectingFor = 'ENEMY'
        this.$controller.publish({
          type: 'DISPLAY_MESSAGE',
          message: `Select up to ${this.getMaxTeamSize()} Pokemon for your opponent's team.`
        })
      } else {
        this.enemyTeam = this.selected
        this.props.select_team(this.userTeam, this.enemyTeam)
      }
    } else {
      // Only send user team
      this.props.select_team(this.selected, [])
    }
  }

  autoPick() {
    this.selected = automaticallyPickTeam(this.getMaxTeamSize(), this.props.unlocked_species)
  }

  handleDown(event: any, pokemonName: string) {
    event.preventDefault()
    pressAndHoldCallback = setTimeout(() => {
      const pokemonToShow = this.props.unlocked_species.find(p => p.name === pokemonName)
      if (pokemonToShow) {
        this.$controller.publish({
          type: 'SHOW_POKEMON_CARD',
          pokemon: pokemonToShow,
          isUser: true,
        })
      }
      pressAndHoldCallback = null
    }, 500)
  }

  handleUp(event: any, pokemonName: string) {
    event.preventDefault()
    if (pressAndHoldCallback) {
      clearTimeout(pressAndHoldCallback)
      this.selectPokemon(pokemonName)
    }
  }

  selectPokemon(pokemonName: string) {
    if (pokemonName) {
      if (this.isSelected(pokemonName)) {
        // Pokemon already selected so remove it
        this.selected = this.selected.filter(e => e !== pokemonName)
      } else {
        // Pokemon not selected yet so add it if not at the max yet
        if (this.selected.length < this.getMaxTeamSize()) {
          this.selected.push(pokemonName)
        }
      }
    }
  }

  search(value: string) {
    this.rangeStart = 0
    if (value && value.trim()) {
      this.filteredSpeciesList = this.speciesListIndex[normalizeToken(value)] || []
    } else {
      this.filteredSpeciesList = this.originalSpeciesList
    }
    this.setMaxRangeStart()
    this.displayRange()
  }

  getBorder(pokemonName: string) {
    return this.isSelected(pokemonName) ? 'border-2  border-green-500 rounded-2xl' : ''
  }

  isSelected(pokemonName: string): boolean {
    return this.selected.includes(pokemonName)
  }

  navForward() {
    const newRangeStart = this.rangeStart + RANGE_SIZE > this.maxRangeStart ? this.maxRangeStart : this.rangeStart + RANGE_SIZE
    if (this.rangeStart !== newRangeStart) {
      this.rangeStart = newRangeStart
    }
    this.displayRange()
  }

  navDoubleForward() {
    if (this.rangeStart !== this.maxRangeStart) {
      this.rangeStart = this.maxRangeStart
      this.displayRange()
    }
  }

  navBackward() {
    const newRangeStart = this.rangeStart - RANGE_SIZE < 0 ? 0 : this.rangeStart - RANGE_SIZE
    if (this.rangeStart !== newRangeStart) {
      this.rangeStart = newRangeStart
      this.displayRange()
    }
  }

  navDoubleBackward() {
    if (this.rangeStart !== 0) {
      this.rangeStart = 0
      this.displayRange()
    }
  }

}

class SelectedPokemonComponent extends BaseComponent<{
  team: string[]
}>{
  template = /*html*/ `
    <div class="flex flex-row justify-center mb-3">
      <div $if="!props.team.length" class="h-10"></div>
      <img $for="pokemon in getPokemon()" class="h-10 w-10 mx-2 rounded-full" 
        src="/sprites/front/{{pokemon.spriteName}}.png" alt:="pokemon.name" />
    </div>
  `
  getPokemon() {
    return this.props.team.map(name => buildPokemon(name))
  }
}

class GridNavComponent extends BaseComponent<{
  f: ()=>void,
  df: ()=>void,
  b: ()=>void,
  db: ()=>void,
  start: boolean,
  end: boolean
}>{
  template = /*html*/ `
    <div class="flex flex-row justify-between px-12 mb-3 mt-6">
      <div class="flex flex-row">
        <span class="mr-5">
          <double-back-arrow-component $if="!props.start" :action="props.db"></double-back-arrow-component>
        </span>
        <span>
          <back-arrow-component $if="!props.start" :action="props.b"></back-arrow-component>
        </span>
      </div>
      <div class="flex flex-row">
        <span>
          <forward-arrow-component $if="!props.end" :action="props.f"></forward-arrow-component>
        </span>
        <span class="ml-5">
          <double-forward-arrow-component $if="!props.end" :action="props.df"></double-forward-arrow-component>
        </span>
      </div>
    </div>
  `
  includes = {
    DoubleBackArrowComponent,
    BackArrowComponent,
    ForwardArrowComponent,
    DoubleForwardArrowComponent,
  }
}