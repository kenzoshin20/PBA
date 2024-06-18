import { moves } from "../data/move-data";
import { buildMove } from "../model/move";
import { MoveDefinition } from "../model/move-definition";
import { BaseComponent } from "./base-component";
import { MoveCardComponent } from "./move-card-component";

export class MoveListComponent extends BaseComponent<{}> {

  moveList: MoveDefinition[]

  constructor(props: {}) {
    super(props)
    this.moveList = Array.prototype.map.call(Object.values(moves), (move: MoveDefinition) => {
      return buildMove(move)
    }).sort((a: any, b: any) => {
      return a.type.localeCompare(b.type) || 
        a.category.localeCompare(b.category) ||
        b.power - a.power
    }) as any
  }

  template = /*html*/ `
    <div class="container mx-auto font-mono">
      <h1 class="main-menu text-center text-2xl mt-8 px-4">
        MOVE LIST
      </h1>
      <div class="flex flex-row">
        <a class="main-menu mx-auto my-8 px-4" href="/">
          Home
        </a>
      </div>
      <div class="mt-5 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div $for="move in moveList" class="bg-white rounded-xl p-5 mx-auto md:mx-3 my-3" style="max-width: 300px;">
          <move-card-component :move="move"></move-card-component>
          <br>
        </div>
      </div>
    </div>
  `
  includes = {
    MoveCardComponent
  }
}