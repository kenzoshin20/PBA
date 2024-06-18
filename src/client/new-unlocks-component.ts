import { speciesList } from "../data/pokemon-data";
import { RevealUnlockedPokemonEvent } from "../model/battle-event";
import { getCry, Pokemon } from "../model/pokemon";
import { PokemonSpecies } from "../model/pokemon-species";
import { sleep } from "../util/async-utils";
import { playCry } from "./audio";
import { BaseComponent } from "./base-component";

type Props = {
    unlocks: number[]
}

type Unlock = {
    species: PokemonSpecies,
    revealed: boolean
}

export class NewUnlocksComponent extends BaseComponent<Props> {

    unlocks: Unlock[]

    constructor(props: Props) {
        super(props)
        this.unlocks = props.unlocks.map(n => {
            const species = speciesList.find(s => s.pokedexNumber === n)
            return {
                species,
                revealed: false
            }
        }) as Unlock[]
    }

    //grid grid-cols-2 place-items-center mt-10
    template = /*html*/`
        <div class="flex flex-row justify-center flex-wrap">
            <div $for="unlock in unlocks">
                <img @click="()=>handleClick(unlock)" $class="{silhouette: !unlock.revealed}" class="h-32 w-32 cursor-pointer mx-8" src="/sprites/front/{{getSprite(unlock.species)}}.png">
            </div>
        </div>
    `

    beforeMount() {
        this.$controller.subscribe('REVEAL_UNLOCKED_POKEMON', this.handleRevealUnlockedPokemon)
    }

    beforeUnmount() {
        this.$controller.unsubscribe('REVEAL_UNLOCKED_POKEMON', this.handleRevealUnlockedPokemon)
    }

    async handleRevealUnlockedPokemon(event: RevealUnlockedPokemonEvent) {
        const unlock = this.unlocks[event.index]
        unlock.revealed = true
        const cry = getCry(unlock.species as Pokemon)
        playCry(cry)
    }

    handleClick(unlock: Unlock) {
        if (unlock.revealed) {
            this.$controller.publish({
                type: 'SHOW_POKEMON_CARD',
                pokemon: unlock.species,
                isUser: true,
            })
        }
    }
}