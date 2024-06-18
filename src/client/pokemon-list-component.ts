import { PokemonSpecies } from "../model/pokemon-species";
import { BaseComponent } from "./base-component";
import { getUnlockedSpecies, speciesList } from '../data/pokemon-data.js'
import { MoveDefinition } from "../model/move-definition";
import { PokemonCardComponent } from "./pokemon-card-component";
import { preloadPokemonSprites } from "./preload-images";
import { tryToGetUser } from "./client-api";
import { defaultUnlockedPokemon } from "../data/default-pokemon-data";
import { MoveCardComponent } from "./move-card-component";

export class PokemonListComponent extends BaseComponent<{}>{

  speciesList: PokemonSpecies[] = []
  totalCount: number = 0
  unlockedCount: number = 0

  moveInModal: MoveDefinition | null = null

  constructor() {
    super({})
    preloadPokemonSprites()
  }

  template = /*html*/ `
    <div class="container mx-auto font-mono">
      <modal-component $if="moveInModal" :close="closeMoveModal">
        <div style="max-width: 300px;" class="bg-white p-5 mx-auto">
          <move-card-component :move="moveInModal"></move-card-component>
        </div>
      </modal-component>
      <h1 class="main-menu text-center text-2xl mt-8 px-4">
        POKEDEX
      </h1>
      <div class="flex flex-row">
        <a class="main-menu mx-auto my-8 px-4" href="/">
          Home
        </a>
      </div>
      <div $if="unlockedCount && unlockedCount">
        <div class="flex flex-row justify-center mb-3">
          <h2 class="text-lg">{{unlockedCount}} / {{totalCount}} Pokémon unlocked</h2>
        </div>
        <progress-bar-component :percent="getPercentUnlocked()">
      </div>
      </progress-bar-component>
      <div class="mt-10 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div $for="species in speciesList" class="bg-white rounded-xl px-5 pt-5 mx-auto md:mx-3 my-3" style="max-width: 300px;">
          <pokemon-card-component :species="species" :click_move="openMoveModal"></pokemon-card-component>
          <br>
        </div>
      </div>
    </div>
  `
  includes = {
    PokemonCardComponent,
    ProgressBarComponent,
    MoveCardComponent
  }

  async afterMount() {
    let unlockedPokemon = defaultUnlockedPokemon
    const user = await tryToGetUser()
    if (user) {
      unlockedPokemon = user.unlockedPokemon
    }
    this.speciesList = getUnlockedSpecies(unlockedPokemon, user?.isAdmin).sort((a, b) => {
      return a.pokedexNumber - b.pokedexNumber
    })
    this.unlockedCount = unlockedPokemon.length
    this.totalCount = speciesList.length
  }

  getPercentUnlocked(): number {
    if (this.unlockedCount && this.totalCount) {
      return Math.floor(this.unlockedCount / this.totalCount * 100)
    } else {
      return 0
    }
  }

  openMoveModal(move: MoveDefinition) {
    this.moveInModal = move
  }

  closeMoveModal() {
    this.moveInModal = null
  }

}


class ProgressBarComponent extends BaseComponent<{
  percent: number
}> {
  template = /*html*/`
    <div class="flex flex-row justify-end items-center h-4">
      <div class="w-full h-2 mb-3 mx-8">
        <div class="rounded-lg h-8 bg-gray-600">
          <div style="width: {{props.percent}}%;" class="rounded-l-lg h-8 bg-green-300"></div>
        </div>
      </div>
    </div>
  `

}