import { Player } from "../model/player";
import { BaseComponent } from "./base-component";

/*
  Not currently used as it was replaced by EnemyPreviewComponent
*/
export class TrainersComponent extends BaseComponent<{
  user: Player
  enemy: Player
}> {
  constructor(props: any) {
    super(props)
  }
  template = /*html*/ `
    <div>
      <div class="flex flex-row justify-end items-end h-32">
        <img class="mr-12 h-28 block" src="/sprites/trainers/{{props.enemy.avatar?.toLowerCase()}}.png">
      </div>
      <div class="flex flex-row justify-start items-end h-32">
        <img class="ml-10 h-32 block" src="/sprites/trainers/{{props.user.avatar?.toLowerCase()}}.png">
      </div>
    </div>
  `
}