import { BaseComponent } from "./base-component";
import { MoveDefinition } from "../model/move-definition";
import { buildMove, Move } from "../model/move";
import { moves } from "../data/move-data";
import { getMoveDescription } from "../model/move-description";

export class MoveTableComponent extends BaseComponent<{}>{

  moveList: Move[] = []

  constructor() {
    super({})
    this.moveList = Array.prototype.map.call(Object.values(moves), (move: MoveDefinition) => {
      return buildMove(move)
    }).sort((a: any, b: any) => {
      return a.type.localeCompare(b.type) || 
        a.category.localeCompare(b.category) ||
        b.power - a.power
    }) as any
  }

  // Inspired by: https://tailwindui.com/components/application-ui/lists/tables
  template = /*html*/ `
    <div class="flex flex-col">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div class="shadow overflow-hidden border-b border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-blue-900 text-white">
                <tr>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Power
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    PP
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr $for="move, i in moveList" class="{{getStripe(i)}}">
                  
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    <div class="font-medium text-gray-900">
                      {{move.name}}
                    </div>
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.type}}
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.category}}
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.power || ''}}
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{Math.floor(move.accuracy * 100)}}%
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.pp}}
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.priority}}
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm ">
                    {{move.description}}
                  </td>
                
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `

  getStripe(index: number) {
    return index % 2 === 0 ? '' : 'bg-gray-100'
  }
}