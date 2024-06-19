import { CreateBattleRequest } from "../model/create-battle"
import { BaseComponent } from "./base-component"
import { getUser, getUserName, postBattle, postChallengeRequest, tryToGetUser } from "./client-api"
import { preloadMiscImages } from "./preload-images"

export class MainMenuComponent extends BaseComponent<{}> {

  loading = true
  loggedIn = false

  constructor(props: any) {
    super(props)
    preloadMiscImages()
  }

  template = /*html*/ `
    <div class="main-menu">
      <div class="container mx-auto px-4">
        <img class="h-28 mx-auto mt-10" src="/img/pokemon_logo.png" alt="pokemon"/>
        <h1 class="text-center text-2xl mt-8 px-4">
          PUKEv1.0
        </h1>
        <div $if="!loading" class="mt-10">
          <div $if="nestedRoute('/')">
            <main-menu-button-component text="PLAY" route="/play"></main-menu-button-component>
            <main-menu-button-component text="POKEDEX" route="/pokedex"></main-menu-button-component>
            <main-menu-button-component $if="!loggedIn" text="LOG IN" route="/login"></main-menu-button-component>
            <main-menu-button-component $if="loggedIn" text="SETTINGS" route="/settings"></main-menu-button-component>
            <main-menu-button-component text="JOIN CHAT" isExternal="true" route="https://m.me/j/AbaX1xsn4_O14atW/"></main-menu-button-component> 
             <main-menu-button-component text="LEADERBOARD" isExternal="true" route="http://158.101.198.227:8268/"></main-menu-button-component> 
          </div>
          <div $if="nestedRoute('/play')">
            <main-menu-button-component text="SINGLE PLAYER" :action="selectSinglePlayer"></main-menu-button-component>
            <main-menu-button-component text="MULTI PLAYER" route="/multiplayer"></main-menu-button-component>
            <main-menu-button-component text="CANCEL" route="/"></main-menu-button-component>
          </div>
          <div $if="nestedRoute('/singleplayer')">
            <main-menu-button-component text="ARENA" :action="selectArena"></main-menu-button-component>
            <main-menu-button-component text="LEAGUE" route="/league"></main-menu-button-component>
            <main-menu-button-component text="PRACTICE" :action="selectPractice"></main-menu-button-component>
            <main-menu-button-component text="CANCEL" route="/"></main-menu-button-component>
          </div>
          <div $if="nestedRoute('/multiplayer')">
            <!--<main-menu-button-component text="RESUME" route="/multiplayer/resume"></main-menu-button-component>-->
            <main-menu-button-component text="CHALLENGE" :action="createChallenge"></main-menu-button-component>
            <main-menu-button-component text="CANCEL" route="/"></main-menu-button-component>
          </div>
          <multi-player-resume-component $if="nestedRoute('/multiplayer/resume')">
          </multi-player-resume-component>
        </div>
      </div>
    </div>
  `
  includes = {
    MainMenuButtonComponent,
    MultiPlayerResumeComponent
  }

  async beforeMount() {
    const user = await tryToGetUser()
    if (user) {
      this.loggedIn = true
    } else {
      this.loggedIn = false
    }
    this.loading = false
  }

  nestedRoute(route: string) {
    return window.location.pathname === route
  }

  async selectSinglePlayer() {
    const user = await getUser()
    if (user.singlePlayerBattleId) {
      // User is already in a single player battle
      this.$router.goTo(`/battle/${user.singlePlayerBattleId}`)
    } else {
      this.$router.goTo(`/singleplayer`)
    }
  }

  async selectArena() {
    const user = await getUser()
    if (user.singlePlayerBattleId) {
      // User is already in a single player battle
      this.$router.goTo(`/battle/${user.singlePlayerBattleId}`)
    } else {
      // User is not in a single player battle
      const createBattleRequest: CreateBattleRequest = {
        battleType: 'SINGLE_PLAYER',
        battleSubType: 'ARENA'
      }
      const battle = await postBattle(createBattleRequest)
      this.$router.goTo(`/battle/${battle.battleId}`)
    }
  }

  async selectPractice() {
    const user = await getUser()
    if (user.singlePlayerBattleId) {
      // User is already in a single player battle
      this.$router.goTo(`/battle/${user.singlePlayerBattleId}`)
    } else {
      // User is not in a single player battle
      const createBattleRequest: CreateBattleRequest = {
        battleType: 'SINGLE_PLAYER',
        battleSubType: 'PRACTICE'
      }
      const battle = await postBattle(createBattleRequest)
      this.$router.goTo(`/battle/${battle.battleId}`)
    }
  }

  async createChallenge() {
    await getUser()
    const challenge = await postChallengeRequest()
    this.$router.goTo(`/challenge/${challenge.challengeId}`)
  }

}

class MultiPlayerResumeComponent extends BaseComponent<{}> {
  battles: string[] = []
  template = /*html*/ `
    <ul>
      <li $for="battle in battles">
        <a href="/battle/{{battle}}">{{battle}}</a>
      </li>
    </ul>
  `
  async beforeMount() {
    const user = await getUser()
    this.battles = user.multiPlayerBattleIds
  }
}

class MainMenuButtonComponent extends BaseComponent<{
  route?: string,
  isExternal?: boolean,
  action?: () => void,
  text: string
}> {
  template = /*html*/ `
    <div class="flex flex-row justify-center mt-6">
      <button @click="props.action || handleClick" class="w-72 h-14 rounded-lg bg-red-500 border border-black py-3 px-8 text-white">
        {{props.text}}
      </button>
    </div>
  `
  handleClick() {
    if (this.props.isExternal) {
      window.open(this.props.route, '_blank')
    } else if (this.props.route) {
      this.$router.goTo(this.props.route)
    }
  }
  }
