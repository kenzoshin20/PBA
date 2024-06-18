import { moves } from "../data/move-data";
import { makesContact, Move } from "../model/move";
import { MoveCategory } from "../model/move-category";
import { MoveDefinition } from "../model/move-definition";
import { Type } from "../model/type";
import { BaseComponent } from "./base-component";
import { TypeCardComponent } from "./type-card-component";
import { TYPE_COLORS } from "./type-colors";

const the_move = moves['Flamethrower']

export class MoveCardTester {
  the_move = the_move
  template = '<div><move-card-component :move="the_move"></move-card-component></div>'
  includes = {
    MoveCardComponent
  }
}

export class MoveCardComponent extends BaseComponent<{
  move: MoveDefinition
}> {
  template = /*html*/ `
  <div class="mt-3" style="min-width: 250px;">
      <div class="grid justify-items-center">
        <span class="text-lg mb-5">
          {{props.move.name.toUpperCase()}}
        </span>

        <div class="grid grid-cols-2 gap-1">
          <div class="text-right mr-1 text-gray-600">Type:</div>
          <type-card-component :type="props.move.type"></type-card-component>
          <div class="text-right mr-1 text-gray-600">Category:</div>
          <div class="flex flex-row">
            <img class="h-5 mr-2" src="/img/category-{{props.move.category.toLowerCase()}}.png" :alt="props.move.category" />
            <span>{{getCategoryDesc(props.move.category)}}</span>
          </div>
          <div class="text-right mr-1 text-gray-600">Power:</div>
          <div>{{props.move.power ? props.move.power : '-'}}</div>
          <div class="text-right mr-1 text-gray-600">Accuracy:</div>
          <div $if="props.move.effects?.ignoreAccuracyAndEvasion">-</div>
          <div $if="!props.move.effects?.ignoreAccuracyAndEvasion">{{props.move.accuracy ? Math.floor(props.move.accuracy * 100) : 100}}%</div>
          <div class="text-right mr-1 text-gray-600">PP:</div>
          <div>{{props.move.startingPP}}</div>
          <div $if="props.move.category !== 'STATUS'" class="text-right mr-1 text-gray-600">Contact:</div>
          <div $if="props.move.category !== 'STATUS'">{{makesContact(props.move) ? 'Yes' : 'No'}}</div>
          <div $if="props.move.priority" class="text-right mr-1 text-gray-600">Priority:</div>
          <div $if="props.move.priority">{{props.move.priority > 0 ? '+' : ''}}{{props.move.priority}}</div>
        </div>
        <hr>
        <div class="mt-3 p-3">
          <p>{{getMoveDescription(props.move) ? getMoveDescription(props.move) : 'Deals damage with no additional effect.'}}</p>
        </div>
      </div>
    </div>
  `
  includes = {
    TypeCardComponent
  }
  getBgColor(type: Type) {
    return TYPE_COLORS[type]
  }
  getCategoryDesc(category: MoveCategory) {
    const lower = category.toLowerCase()
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  }
  makesContact(move: Move): boolean {
    return makesContact(move)
  }
}