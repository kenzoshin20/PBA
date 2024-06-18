import { Battle } from "../model/battle"
import { BaseComponent } from "./base-component"
import { BattleComponent } from "./battle-component"
import { BattleLoopHandler } from "./battle-loop-handler"
import { getBattle, getUser, postPlayerAction } from "./client-api"
import { preloadPokemonSprites, preloadTrainerSprites } from "./preload-images"
import { preloadAudio } from "./preload-audio"
import { PokemonSpecies } from "../model/pokemon-species"
import { getUnlockedSpecies } from "../data/pokemon-data"

export class BattleLoaderComponent extends BaseComponent<{
  routeParams: {
    battleId: string
  }
}> {
  started: boolean = false
  battle?: Battle
  unlockedPokemonSpecies: PokemonSpecies[] = []

  constructor(props: any) {
    super(props)
    preloadPokemonSprites()
    preloadTrainerSprites()
    preloadAudio()
  }

  template = /*html*/ `
    <div style="max-width: 500px;" class="font-mono mx-auto">
      <battle-component $if="started" :battle="battle" :unlocked_species="unlockedPokemonSpecies"></battle-component>
    </div>
  `
  includes = {
    BattleComponent,
  }

  async beforeMount() {
    const user = await getUser()
    let battle!: Battle
    try {
      battle = await getBattle(this.props.routeParams.battleId)
    } catch (error) {
      this.$router.goTo('/')
    }
    this.battle = battle
    this.unlockedPokemonSpecies = getUnlockedSpecies(user.unlockedPokemon, user.isAdmin)
    const battleLoopHandler = new BattleLoopHandler(battle.battleId, this.$controller)
    battleLoopHandler.start(battle)
    this.started = true
    this.beforeUnmount = () => {
      battleLoopHandler.stop()
    }
  }


}