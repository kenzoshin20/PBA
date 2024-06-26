import { Battle, BattleState } from "../model/battle";
import { getCry, Pokemon } from "../model/pokemon";
import { BaseComponent } from "./base-component";
import { BattleZoneComponent } from './battle-zone-component';
import { clientError, getBattle, getPlayers, getUser, getUserName, postPlayerAction } from "./client-api";
import { TerminalComponent } from './terminal-component';
import { GameOverButtonsComponent } from './game-over-buttons-component';
import { MoveButtonsComponent } from './move-buttons-component';
import { Player } from "../model/player";
import { PokemonButtonsComponent } from './pokemon-buttons-component';
import { ClientState } from "./client-state";
import { BattleStateChangeEvent, BindChangeEvent, ClientStateChangeEvent, DeployEvent, FaintEvent, HealthChangeEvent, TransformEvent, PPChangeEvent, StatusChangeEvent, TeamSelectedEvent, ShowPokemonCardEvent, ShowMoveCardEvent, SoundEffectEvent, TransformStanceChangeEvent, WeatherChangeEvent, UnlockPokemonEvent, GameOverEvent } from "../model/battle-event";
import { ActionButtonsComponent } from './action-buttons-component';
import { WideButtonComponent } from "./wide-button-component";
import { getTransformAnimationSequence, TransformAnimationState } from "./transform-animation";
import { AnimationContext, defaultAnimationContext } from "./animation-context";
import { playAnimation, sleep } from "../util/async-utils";
import { TeamSelectionComponent } from "./team-selection-component";
import { PokemonSpecies } from "../model/pokemon-species";
import { PokemonCardComponent } from "./pokemon-card-component";
import { ReactiveTextboxComponent } from "./reactive-textbox-component";
import { BackArrowComponent, MenuIconComponent } from "./icons-component";
import { MoveDefinition } from "../model/move-definition";
import { MoveCardComponent } from "./move-card-component";
import { MoveName } from "../data/move-data";
import { playCry, playFaintSound, playMoveSound, playMusic, stopMusic } from "./audio";
import { getUserSettings } from "./user-settings-controller";
import { EnemyPreviewComponent } from "./enemy-preview-component";
import { Weather, weatherDescriptions } from "../model/weather";
import { NewUnlocksComponent } from "./new-unlocks-component";
import confetti from "canvas-confetti";

interface Props {
  battle: Battle;
  unlocked_species: PokemonSpecies[];
}

export class BattleComponent extends BaseComponent<Props> {

  battleState: BattleState;
  clientState: ClientState;

  user: Player;
  userPokemon: Pokemon;
  userAnimationContext: AnimationContext;

  enemy: Player;
  enemyPokemon: Pokemon;
  enemyAnimationContext: AnimationContext;

  pokemonInModal: PokemonSpecies | undefined = undefined;
  pokemonModalForUser: boolean = false;
  moveInModal: MoveDefinition | undefined = undefined;

  newUnlocks: number[] | undefined;
  winnerName: string | null = null;

  constructor(props: Props) {
    super(props);
    this.battleState = props.battle.battleState;
    this.clientState = 'PLAYING_ANIMATIONS';
    const { user, enemy } = getPlayers(props.battle);
    this.user = user;
    this.userPokemon = user.team[user.activePokemonIndex];
    this.userAnimationContext = defaultAnimationContext();
    this.enemy = enemy;
    this.enemyPokemon = enemy.team[enemy.activePokemonIndex];
    this.enemyAnimationContext = defaultAnimationContext();
    this.winnerName = props.battle.winnerName ? props.battle.winnerName : null;
  }

  template = /*html*/ `
    <div>
      <div $if="battleState!=='SELECTING_TEAM'" class="mt-5 flex flex-row justify-between">
        <back-arrow-component :action="handleBack"></back-arrow-component>
        <menu-icon-component :action="handleMenu"></menu-icon-component>
      </div>

      <modal-component $if="pokemonInModal" :close="closePokemonModal">
        <div style="max-width: 300px;" class="bg-white p-5 mx-auto">
          <pokemon-card-component :species="pokemonInModal" :click_move="(move)=>showMoveCard(move)" :league="props.battle.battleSubType === 'LEAGUE' && !pokemonModalForUser"></pokemon-card-component>
        </div>
      </modal-component>
      <modal-component $if="moveInModal" :close="closeMoveModal">
        <div style="max-width: 300px;" class="bg-white p-5 mx-auto">
          <move-card-component :move="moveInModal"></move-card-component>
        </div>
      </modal-component>
    
      <team-selection-component $if="battleState==='SELECTING_TEAM'" 
        :type="props.battle.battleType" :sub_type="props.battle.battleSubType" 
        :select_team="selectTeam" :client_state="clientState"
        :unlocked_species="props.unlocked_species">
      </team-selection-component>

      <div $if="battleState!=='SELECTING_TEAM' && this.userPokemon && this.enemyPokemon">
        <enemy-preview-component $if="showEnemyPreview()" :user="user" :enemy="enemy">
        </enemy-preview-component>
        <battle-zone-component $if="showBattleZone()" 
          :user="userPokemon" :user_player="user" :user_animation_ctx="userAnimationContext"
          :enemy="enemyPokemon" :enemy_player="enemy" :enemy_animation_ctx="enemyAnimationContext"
          >
        </battle-zone-component>
        <new-unlocks-component $if="clientState==='SHOWING_NEW_UNLOCKS'" :unlocks="newUnlocks">
        </new-unlocks-component>
        <terminal-component>
        </terminal-component>
        <action-buttons-component $if="showActionButtons()" :battle_id="props.battle.battleId" :user_pokemon="userPokemon" :enemy_pokemon="enemyPokemon">
        </action-buttons-component>
        <pokemon-buttons-component $if="showPokemonButtons()" :team="user.team" :cancellable="isCancellable()" :current="user.activePokemonIndex">
        </pokemon-buttons-component>
        <move-buttons-component $if="showMoveButtons()" :moves="userPokemon.moves">
        </move-buttons-component>
        <game-over-buttons-component $if="showGameOverButtons()" :battle="props.battle" :won="user.name === winnerName">
        </game-over-buttons-component>
      </div>

      <!-- Floating Chat Button -->
      <button id="myButton" class="floating-btn">💬</button>

      <!-- Chat Modal -->
      <div id="myModal" class="modal">
        <span class="close">&times;</span>
        <div class="modal-content">
          <iframe src="http://158.101.198.227:8534/chat?chatroom_id=${props.battle.battleId}&user_name=${this.getUser()}" frameborder="0"></iframe>
        </div>
      </div>
    </div>
  `

  includes = {
    NewUnlocksComponent,
    TeamSelectionComponent,
    TerminalComponent,
    BattleZoneComponent,
    EnemyPreviewComponent,
    MoveButtonsComponent,
    PokemonButtonsComponent,
    ActionButtonsComponent,
    WideButtonComponent,
    GameOverButtonsComponent,
    PokemonCardComponent,
    MoveCardComponent,
    BackArrowComponent,
    MenuIconComponent,
  }

  beforeMount() {
    this.$controller.subscribe('BATTLE_STATE_CHANGE', this.handleBattleStateChange);
    this.$controller.subscribe('CLIENT_STATE_CHANGE', this.handleClientStateChange);
    this.$controller.subscribe('HEALTH_CHANGE', this.handleHealthChange);
    this.$controller.subscribe('SOUND_EFFECT', this.handleSoundEffect);
    this.$controller.subscribe('DEPLOY', this.handleDeploy);
    this.$controller.subscribe('PP_CHANGE', this.handlePPChange);
    this.$controller.subscribe('FAINT', this.handleFaint);
    this.$controller.subscribe('STATUS_CHANGE', this.handleStatusChange);
    this.$controller.subscribe('BIND_CHANGE', this.handleBindChange);
    this.$controller.subscribe('TRANSFORM', this.handleTransform);
    this.$controller.subscribe('TRANSFORM_STANCE_CHANGE', this.handleTransformStanceChange);
    this.$controller.subscribe('TEAM_SELECTED', this.handleTeamSelected);
    this.$controller.subscribe('SHOW_POKEMON_CARD', this.handleShowPokemonCard);
    this.$controller.subscribe('SHOW_MOVE_CARD', this.handleShowMoveCard);
    this.$controller.subscribe('WEATHER_CHANGE', this.handleWeatherChange);
    this.$controller.subscribe('UNLOCK_POKEMON', this.handleUnlockPokemon);
    this.$controller.subscribe('GAME_OVER', this.handleGameOver);

    this.setWeather(this.props.battle.weather);
    
    // Adding event listeners for chat modal
    this.addChatModalListeners();
  }

  beforeUnmount() {
    this.$controller.unsubscribe('BATTLE_STATE_CHANGE', this.handleBattleStateChange);
    this.$controller.unsubscribe('CLIENT_STATE_CHANGE', this.handleClientStateChange);
    this.$controller.unsubscribe('HEALTH_CHANGE', this.handleHealthChange);
    this.$controller.unsubscribe('SOUND_EFFECT', this.handleSoundEffect);
    this.$controller.unsubscribe('DEPLOY', this.handleDeploy);
    this.$controller.unsubscribe('PP_CHANGE', this.handlePPChange);
    this.$controller.unsubscribe('FAINT', this.handleFaint);
    this.$controller.unsubscribe('STATUS_CHANGE', this.handleStatusChange);
    this.$controller.unsubscribe('BIND_CHANGE', this.handleBindChange);
    this.$controller.unsubscribe('TRANSFORM', this.handleTransform);
    this.$controller.unsubscribe('TRANSFORM_STANCE_CHANGE', this.handleTransformStanceChange);
    this.$controller.unsubscribe('TEAM_SELECTED', this.handleTeamSelected);
    this.$controller.unsubscribe('SHOW_POKEMON_CARD', this.handleShowPokemonCard);
    this.$controller.unsubscribe('SHOW_MOVE_CARD', this.handleShowMoveCard);
    this.$controller.unsubscribe('WEATHER_CHANGE', this.handleWeatherChange);
    this.$controller.unsubscribe('UNLOCK_POKEMON', this.handleUnlockPokemon);
    this.$controller.unsubscribe('GAME_OVER', this.handleGameOver);

    // Removing event listeners for chat modal
    this.removeChatModalListeners();
  }

  handleBattleStateChange = (event: BattleStateChangeEvent) => {
    this.battleState = event.newState;
    this.$render();
  }

  handleClientStateChange = (event: ClientStateChangeEvent) => {
    this.clientState = event.newState;
    this.$render();
  }

  handleHealthChange = (event: HealthChangeEvent) => {
    const { player, newHealth } = event;
    const pokemon = player === 'USER' ? this.userPokemon : this.enemyPokemon;
    pokemon.health = newHealth;
    this.$render();
  }

  handleSoundEffect = (event: SoundEffectEvent) => {
    const { sound } = event;
    if (sound === 'CRY') {
      playCry(this.userPokemon);
    } else if (sound === 'FAINT') {
      playFaintSound();
    } else {
      playMoveSound(sound);
    }
  }

  handleDeploy = (event: DeployEvent) => {
    const { player, pokemon } = event;
    if (player === 'USER') {
      this.userPokemon = pokemon;
      this.userAnimationContext = defaultAnimationContext();
    } else {
      this.enemyPokemon = pokemon;
      this.enemyAnimationContext = defaultAnimationContext();
    }
    this.$render();
  }

  handlePPChange = (event: PPChangeEvent) => {
    const { player, move, newPP } = event;
    const pokemon = player === 'USER' ? this.userPokemon : this.enemyPokemon;
    const moveToUpdate = pokemon.moves.find(m => m.name === move);
    if (moveToUpdate) {
      moveToUpdate.pp = newPP;
    }
    this.$render();
  }

  handleFaint = (event: FaintEvent) => {
    const { player } = event;
    if (player === 'USER') {
      this.userPokemon.fainted = true;
    } else {
      this.enemyPokemon.fainted = true;
    }
    this.$render();
  }

  handleStatusChange = (event: StatusChangeEvent) => {
    const { player, newStatus } = event;
    const pokemon = player === 'USER' ? this.userPokemon : this.enemyPokemon;
    pokemon.status = newStatus;
    this.$render();
  }

  handleBindChange = (event: BindChangeEvent) => {
    const { player, newBind } = event;
    const pokemon = player === 'USER' ? this.userPokemon : this.enemyPokemon;
    pokemon.bind = newBind;
    this.$render();
  }

  handleTransform = (event: TransformEvent) => {
    const { player, newSpecies } = event;
    const pokemon = player === 'USER' ? this.userPokemon : this.enemyPokemon;
    pokemon.species = newSpecies;
    this.$render();
  }

  handleTransformStanceChange = (event: TransformStanceChangeEvent) => {
    const { player, newStance } = event;
    const pokemon = player === 'USER' ? this.userPokemon : this.enemyPokemon;
    pokemon.stance = newStance;
    this.$render();
  }

  handleTeamSelected = (event: TeamSelectedEvent) => {
    const { player, newTeam } = event;
    if (player === 'USER') {
      this.user.team = newTeam;
      this.userPokemon = newTeam[this.user.activePokemonIndex];
    } else {
      this.enemy.team = newTeam;
      this.enemyPokemon = newTeam[this.enemy.activePokemonIndex];
    }
    this.$render();
  }

  handleShowPokemonCard = (event: ShowPokemonCardEvent) => {
    const { pokemonSpecies, forUser } = event;
    this.pokemonInModal = pokemonSpecies;
    this.pokemonModalForUser = forUser;
    this.$render();
  }

  handleShowMoveCard = (event: ShowMoveCardEvent) => {
    const { move } = event;
    this.moveInModal = move;
    this.$render();
  }

  handleWeatherChange = (event: WeatherChangeEvent) => {
    const { newWeather } = event;
    this.setWeather(newWeather);
    this.$render();
  }

  handleUnlockPokemon = (event: UnlockPokemonEvent) => {
    this.newUnlocks = event.newUnlocks;
    this.$render();
  }

  handleGameOver = (event: GameOverEvent) => {
    this.winnerName = event.winnerName;
    this.$render();
  }

  setWeather(weather: Weather) {
    this.props.battle.weather = weather;
    document.body.className = weatherDescriptions[weather].cssClass;
  }

  showEnemyPreview() {
    return this.clientState === 'SHOWING_NEW_UNLOCKS' || this.battleState === 'PRE_BATTLE';
  }

  showBattleZone() {
    return this.clientState !== 'SHOWING_NEW_UNLOCKS' && this.battleState !== 'PRE_BATTLE';
  }

  showActionButtons() {
    return this.clientState === 'SHOWING_ACTIONS' && !this.userPokemon.fainted && this.battleState === 'ACTIVE';
  }

  showPokemonButtons() {
    return this.clientState === 'SHOWING_ACTIONS' && this.userPokemon.fainted && this.battleState === 'ACTIVE';
  }

  showMoveButtons() {
    return this.clientState === 'SELECTING_MOVE' && this.battleState === 'ACTIVE';
  }

  showGameOverButtons() {
    return this.battleState === 'GAME_OVER';
  }

  getUser() {
    const user = getUser();
    return getUserName(user);
  }

  addChatModalListeners() {
    const modal = document.getElementById("myModal");
    const btn = document.getElementById("myButton");
    const span = document.getElementsByClassName("close")[0] as HTMLElement;

    btn.onclick = function() {
      modal.style.display = "block";
    }
    span.onclick = function() {
      modal.style.display = "none";
    }
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }

  removeChatModalListeners() {
    const btn = document.getElementById("myButton");
    const span = document.getElementsByClassName("close")[0] as HTMLElement;

    if (btn) {
      btn.onclick = null;
    }
    if (span) {
      span.onclick = null;
    }
    window.onclick = null;
  }

}