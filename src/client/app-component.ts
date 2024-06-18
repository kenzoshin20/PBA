import { BattleLoaderComponent } from './battle-loader-component'
import { MainMenuComponent } from './main-menu-component'
import { PokemonListComponent } from './pokemon-list-component'
import { LoginComponent } from './login-component'
import { SignupComponent } from './signup-component'
import { ChallengeComponent } from './challenge-component'
import { PokemonTableComponent } from './pokemon-table-component'
import { MoveTableComponent } from './move-table-component'
import { MoveListComponent } from './move-list-component'
import { SceneTestComponent } from './scene-test-component'
import { SettingsComponent } from './settings-component'
import { LeagueComponent } from './league-component'
import { LeagueTrainerListComponent } from './league-trainer-list-component'
import { ArenaTrainerListComponent } from './arena-trainer-list-component'

export class AppComponent {
  routes: any
  template = /*html*/ `
    <div>
      <router-switch :routes="routes"></router-switch>
    </div>
  `

  beforeInit() {
    this.routes = [
      { path: '/battle/:battleId', component: BattleLoaderComponent },
      { path: '/pokedex', component: PokemonListComponent },
      { path: '/pokemon-table', component: PokemonTableComponent },
      { path: '/moves', component: MoveListComponent },
      { path: '/move-table', component: MoveTableComponent },
      { path: '/signup', component: SignupComponent },
      { path: '/login', component: LoginComponent },
      { path: '/play', component: MainMenuComponent },
      { path: '/singleplayer', component: MainMenuComponent },
      { path: '/league', component: LeagueComponent },
      { path: '/multiplayer', component: MainMenuComponent },
      { path: '/multiplayer/resume', component: MainMenuComponent },
      { path: '/challenge/:challengeId', component: ChallengeComponent },
      { path: '/test', component: SceneTestComponent },
      { path: '/settings', component: SettingsComponent },
      { path: '/league-trainers', component: LeagueTrainerListComponent },
      { path: '/arena-trainers', component: ArenaTrainerListComponent },
      { path: '/', component: MainMenuComponent },
    ]
  }
  
}