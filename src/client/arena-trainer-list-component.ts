import { buildPokemon, speciesList } from "../data/pokemon-data.js";
import { arenaTrainers } from "../model/arena.js";
import { BaseComponent } from "./base-component.js";


export class ArenaTrainerListComponent extends BaseComponent<{}> {
    trainers = arenaTrainers.sort((a, b) => {
        return a.rank - b.rank
    })
    template = /*html*/`
        <div>
            <div $for="arenaTrainer, index in trainers">
                <div class="my-8">
                    <div class="flex flex-row justify-center">
                        <div class="grid grid-cols-2 mt-10">
                            <img $for="pokemon in arenaTrainer.team" class="h-12" src="/sprites/front/{{getSprite(pokemon)}}.png">
                        </div>
                        <img class="h-36 block" src="/sprites/trainers/{{arenaTrainer.avatar}}.png">
                    </div>
                    <div class="flex flex-row justify-center">
                        <h2 class="mt-5 text-lg">{{arenaTrainer.name}} ({{arenaTrainer.rank}})</h2>
                    </div>
                </div>
            </div>
        </div>
    `
    getPokemon(dexNumber: number) {
        return speciesList.find(s => s.pokedexNumber === dexNumber)
    }
}