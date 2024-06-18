import { BaseComponent } from './base-component'
import { EnemyPokemonComponent } from './enemy-pokemon-component'
import { UserPokemonComponent } from './user-pokemon-component'
import { Pokemon } from '../model/pokemon'
import { AnimationContext } from './animation-context'
import { Player } from '../model/player'

export class BattleZoneComponent extends BaseComponent<{
  user: Pokemon
  user_player?: Player
  user_animation_ctx: AnimationContext
  enemy: Pokemon
  enemy_player?: Player
  enemy_animation_ctx: AnimationContext
}> {

  template = /*html*/ `
    <div class="w-full">
      <enemy-pokemon-component :pokemon="props.enemy" :player="props.enemy_player" :animation_ctx="props.enemy_animation_ctx"></enemy-pokemon-component>
      <user-pokemon-component :pokemon="props.user" :player="props.user_player" :animation_ctx="props.user_animation_ctx"></user-pokemon-component>
    </div>
  `

  includes = {
    EnemyPokemonComponent,
    UserPokemonComponent
  }

}