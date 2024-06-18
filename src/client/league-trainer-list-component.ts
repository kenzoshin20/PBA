import { buildPokemon, speciesList } from "../data/pokemon-data.js";
import { leagueTrainers } from "../model/league.js";
import { BaseComponent } from "./base-component.js";


export class LeagueTrainerListComponent extends BaseComponent<{}> {
    trainers = leagueTrainers
    template = /*html*/`
        <div>
            <div $for="leagueTrainer, index in trainers">
                <div class="my-8">
                    <div class="flex flex-row justify-center">
                        <div class="grid grid-cols-2 mt-10">
                            <img $for="pokemon in leagueTrainer.team" class="h-12" src="/sprites/front/{{getSprite(pokemon)}}.png">
                        </div>
                        <img class="h-36 block" src="/sprites/trainers/{{leagueTrainer.avatar}}.png">
                        <div class="grid grid-cols-2 mt-10">
                            <img $for="rewardNumber in leagueTrainer.rewards" class="h-12" src="/sprites/front/{{getSprite(getPokemon(rewardNumber))}}.png">
                        </div>
                    </div>
                    <div class="flex flex-row justify-center">
                        <h2 class="mt-5 text-lg">{{leagueTrainer.name}} ({{index}})</h2>
                    </div>
                </div>
            </div>
        </div>
    `
    getPokemon(dexNumber: number) {
        return speciesList.find(s => s.pokedexNumber === dexNumber)
    }
}