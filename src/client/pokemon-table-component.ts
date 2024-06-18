import { speciesList } from "../data/pokemon-data";
import { MoveDefinition } from "../model/move-definition";
import { PokemonSpecies } from "../model/pokemon-species";
import { Type } from "../model/type";
import { BaseComponent } from "./base-component";
import { TypeCardComponent } from "./type-card-component";
import { TYPE_COLORS } from "./type-colors";

export class PokemonTableComponent extends BaseComponent<{}> {

  speciesList: PokemonSpecies[] = []

  constructor() {
    super({})
    this.speciesList = speciesList.sort((a, b) => {
      return a.pokedexNumber - b.pokedexNumber
    }).map(species => {
      // Add blank moves to fill out columns in table
      const movesToPad = 4 - species.moves.length
      for (let i = 0; i < movesToPad; i++) {
        species.moves.push({} as MoveDefinition)
      }
      return species
    })
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
                      Pokemon
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      HP
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Atk
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Sp Atk
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Def
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Sp Def
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Speed
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Move 1
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Move 2
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Move 3
                    </th>
                    <th scope="col" class="px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider">
                      Move 4
                    </th>
                  </tr>
                </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr $for="pokemon, i in speciesList" class="{{getStripe(i)}}">
                      <td class="px-6 py-3 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-10 w-10">
                            <img class="transform scale-150 mr-2" src="/sprites/front/{{getSprite(pokemon)}}.png" alt:="pokemon.name" />
                          </div>
                        <div class="ml-4">
                          <div class="text-lg font-medium text-gray-900">
                            {{pokemon.name}}
                          </div>
                          <types-row :types="pokemon.types"></types-row>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm font-medium">
                      {{pokemon.hp + pokemon.attack + pokemon.defense + pokemon.specialAttack + pokemon.specialDefense + pokemon.speed}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.hp}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.attack}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.specialAttack}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.defense}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.specialDefense}}
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm ">
                      {{pokemon.speed}}
                    </td>
                    <td $for="move in pokemon.moves" class="px-6 py-3 whitespace-nowrap">
                      <div class="flex items-center">
                        <div $if="move.name">
                          <div class="text-sm font-medium">
                            {{move.name}}
                          </div>
                          <div class="text-sm text-gray-500">
                            {{move.power || ''}} {{move.type}} {{move.startingPP}} 
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `
    includes = {
      TypesRow
    }

    getStripe(index: number) {
      return index % 2 === 0 ? '' : 'bg-gray-100'
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