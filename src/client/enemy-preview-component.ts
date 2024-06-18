import { Player } from "../model/player";
import { Pokemon } from "../model/pokemon";
import { BaseComponent } from "./base-component";

export class EnemyPreviewComponent extends BaseComponent<{
  user: Player
  enemy: Player
}> {
  constructor(props: any) {
    super(props)
  }
  template = /*html*/ `
    <div>
      <div class="my-8">
        <div class="flex flex-row justify-center">
            <div class="grid grid-cols-2 {{props.enemy.team.length == 5 || props.enemy.team.length == 6 ? '' : 'mt-10'}}">
              <span $for="pokemon, i in props.enemy.team">
                <img $if="props.enemy.team.length<8 || i < 4" @click="()=>showPokemon(pokemon)" class="h-12 cursor-pointer" src="/sprites/front/{{getSprite(pokemon)}}.png">
              </span>
            </div>
            <img class="h-36 block" src="/sprites/trainers/{{props.enemy.avatar}}.png">
              <div $if="props.enemy.team.length==8" class="grid grid-cols-2 mt-10">
                <span $for="pokemon, i in props.enemy.team">
                  <img $if="i > 3" @click="()=>showPokemon(pokemon)" class="h-12 cursor-pointer" src="/sprites/front/{{getSprite(pokemon)}}.png">
                </span>
              </div>
        </div>
      </div>
    </div>
  `
  showPokemon(pokemon: Pokemon) {
    this.$controller.publish({
      type: 'SHOW_POKEMON_CARD',
      pokemon: pokemon,
      isUser: false,
    })
  }
}