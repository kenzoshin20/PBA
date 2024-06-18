import { buildPokemon, speciesList } from "../data/pokemon-data";
import { Pokemon } from "../model/pokemon";
import { playAnimation, sleep } from "../util/async-utils";
import { AnimationContext, defaultAnimationContext } from "./animation-context";
import { BaseComponent } from "./base-component";
import { BattleZoneComponent } from "./battle-zone-component";
import { setUserName } from "./client-api";

export class SceneTestComponent extends BaseComponent<{}> {

  $element!: HTMLElement;

  names = speciesList.map(s => s.name)
  userPokemonName = localStorage.getItem('sceneTest:user') || 'Venusaur'
  enemyPokemonName = localStorage.getItem('sceneTest:enemy') || 'Charizard'

  user: Pokemon = buildPokemon(this.userPokemonName)
  user_animation_ctx: AnimationContext = defaultAnimationContext()
  enemy: Pokemon = buildPokemon(this.enemyPokemonName)
  enemy_animation_ctx: AnimationContext = defaultAnimationContext()

  template = /*html*/ `
    <div style="max-width: 500px;" class="font-mono mx-auto">
      <div class="mt-5 flex flex-row">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
            User
          </label>
          <input $bind="userPokemonName" list="names" class="shadow appearance-none border rounded w-36 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text">
        </div>
        <div class="mb-4 ml-5">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
            Enemy
          </label>
          <input $bind="enemyPokemonName" list="names" class="shadow appearance-none border rounded w-36 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text">
        </div>
        <datalist id="names">
          <option $for="name in names" :value="name"></option>
        </datalist>
      </div>
      <div class="flex flex-row">
        <button @click="update" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
          Update
        </button>
        <button @click="clear" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
          Clear
        </button>
        <button @click="()=>$router.goTo('/')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
          Home
        </button>
      </div>
      <battle-zone-component 
        :user="user" 
        :user_player="{}" 
        :user_animation_ctx="user_animation_ctx"
        :enemy="enemy"
        :enemy_player="{}" 
        :enemy_animation_ctx="enemy_animation_ctx"
      ></battle-zone-component>
    </div>
  `
  includes = {
    BattleZoneComponent
  }

  update() {
    localStorage.setItem('sceneTest:enemy', this.enemyPokemonName)
    if (this.userPokemonName) {
      localStorage.setItem('sceneTest:user', this.userPokemonName)
      this.user = buildPokemon(this.userPokemonName)
    }
    if (this.enemyPokemonName) {
      this.enemy = buildPokemon(this.enemyPokemonName)
    }
  }
  
  clear() {
    this.userPokemonName = ''
    this.enemyPokemonName = ''
  }

  afterMount() {
    setUserName('foo')
    setTimeout(() => {
      this.$controller.publish({
        type: 'TAKE_DAMAGE_ANIMATION',
        playerName: 'John',
        directAttack: true
      })
    }, 500)
  }
  
}