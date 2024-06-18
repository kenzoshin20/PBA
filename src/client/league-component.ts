import { LeagueTrainer, leagueTrainers } from "../model/league";
import { CreateBattleRequest } from "../model/create-battle";
import { PokemonSpecies } from "../model/pokemon-species";
import { logInfo } from "../util/logger";
import { getRequestParam } from "../util/url-utils";
import { BaseComponent } from "./base-component";
import { clientError, getUser, postBattle } from "./client-api";
import { PokemonCardComponent } from "./pokemon-card-component";
import { TerminalComponent } from "./terminal-component";

export class LeagueComponent extends BaseComponent<{}> {

    leagueLevel: number = 0
    maxLeagueLevel: number = 0
    leagueTrainer: LeagueTrainer | null = null

    pokemonInModal: PokemonSpecies | null = null

    template = /*html*/ `
        <div style="max-width: 500px;" class="font-mono container mx-auto px-4">

            <modal-component $if="pokemonInModal" :close="closePokemonModal">
                <div style="max-width: 300px;" class="bg-white p-5 mx-auto">
                    <pokemon-card-component :species="pokemonInModal" :league="true"></pokemon-card-component>
                </div>
            </modal-component>

            <img class="h-28 mx-auto mt-10" src="/img/pokemon_logo.png" alt="pokemon"/>
            <h1 class="main-menu text-center text-2xl mt-8 px-4">
                LEAGUE MODE
            </h1>
            <div $if="leagueTrainer">
                <div class="my-8">
                    <div class="flex flex-row justify-center">
                        <div class="grid grid-cols-2 mt-10">
                            <span $for="pokemon, i in leagueTrainer.team">
                                <img $if="i < 4" @click="()=>showPokemonModal(pokemon.species)" class="cursor-pointer h-12" src="/sprites/front/{{getSprite(pokemon)}}.png">
                            </span>
                        </div>
                        <img class="h-36 block" src="/sprites/trainers/{{leagueTrainer.avatar}}.png">
                        <div class="grid grid-cols-2 mt-10">
                            <span $for="pokemon, i in leagueTrainer.team">
                                <img $if="i > 3" @click="()=>showPokemonModal(pokemon.species)" class="cursor-pointer h-12" src="/sprites/front/{{getSprite(pokemon)}}.png">
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-row justify-center">
                        <h2 class="mt-5 text-lg">{{leagueTrainer.name}}</h2>
                    </div>
                </div>
                <terminal-component>
                </terminal-component>
                <div class="grid grid-cols-2 gap-1">
                    <div @click="selectBattle" class="ml-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
                        Battle
                    </div>
                    <div @click="()=>$router.goTo('/')" class="mr-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
                        Cancel
                    </div>
                    <div @click="prev" class="{{showPrev() ? 'cursor-pointer' : 'cursor-not-allowed'}} {{showPrev() ? 'bg-gray-100' : 'bg-gray-400'}} select-none ml-1 h-16 text-center text-lg pt-3 rounded border-2 border-solid border-black">
                        Prev
                    </div>
                    <div @click="next" class="{{showNext() ? 'cursor-pointer' : 'cursor-not-allowed'}} {{showNext() ? 'bg-gray-100' : 'bg-gray-400'}} select-none mr-1 h-16 text-center text-lg pt-3 rounded border-2 border-solid border-black">
                        Next
                    </div>
                </div>
            </div>
        </div>
    `
    includes = {
        TerminalComponent,
        PokemonCardComponent
    }

    setLeagueTrainer() {
        if (leagueTrainers.length > this.leagueLevel) {
            this.leagueTrainer = leagueTrainers[this.leagueLevel]
        } else {
            this.leagueTrainer = leagueTrainers[leagueTrainers.length-1]
        }
    }

    async afterMount() {
        const user = await getUser()
        let leagueLevel = user.leagueLevel ? user.leagueLevel : 0
        let leagueLevelFromUrl = getRequestParam('lvl')
        if (leagueLevelFromUrl != null) {
            leagueLevel = parseInt(leagueLevelFromUrl)
        }
        this.maxLeagueLevel = leagueLevel
        this.leagueLevel = leagueLevel
        this.setLeagueTrainer()

        this.$controller.publish({
            type: 'DISPLAY_MESSAGE',
            message: `Defeat other trainers in the League to unlock new Pokémon!`
        })
    }

    showPokemonModal(pokemon: PokemonSpecies) {
        this.pokemonInModal = pokemon
    }

    closePokemonModal() {
        this.pokemonInModal = null
    }

    async selectBattle() {
        const user = await getUser()
        if (user.leagueBattleId) {
          // User is already in a League battle
          this.$router.goTo(`/battle/${user.singlePlayerBattleId}`)
        } else {
          // User is not in a League battle
          if (this.leagueTrainer) {
            const createBattleRequest: CreateBattleRequest = {
              battleType: 'SINGLE_PLAYER',
              battleSubType: 'LEAGUE',
              leagueLevel: this.leagueLevel
            }
            const battle = await postBattle(createBattleRequest)
            this.$router.goTo(`/battle/${battle.battleId}`)
          } else {
              logInfo('Unable to create battle: leagueTrainer is null in league-component')
          }
        }
      }

      showPrev() {
          return this.leagueLevel > 0
      }

      showNext() {
          return this.leagueLevel < (leagueTrainers.length - 1) && this.leagueLevel < this.maxLeagueLevel
      }

      prev() {
          if (this.showPrev()) {
            this.leagueLevel--
            this.setLeagueTrainer()
          }
      }

      next() {
          if (this.showNext()) {
            this.leagueLevel++
            this.setLeagueTrainer()
          }
      }

}