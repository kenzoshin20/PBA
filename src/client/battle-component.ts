import { Battle, BattleState } from "../model/battle";
import { getCry, Pokemon } from "../model/pokemon";
import { BaseComponent } from "./base-component";
import { BattleZoneComponent } from './battle-zone-component'
import { clientError, getBattle, getPlayers, getUser, getUserName, postPlayerAction } from "./client-api";
import { TerminalComponent } from './terminal-component'
import { GameOverButtonsComponent } from './game-over-buttons-component'
import { MoveButtonsComponent } from './move-buttons-component'
import { Player } from "../model/player";
import { PokemonButtonsComponent } from './pokemon-buttons-component'
import { ClientState } from "./client-state";
import { BattleStateChangeEvent, BindChangeEvent, ClientStateChangeEvent, DeployEvent, FaintEvent, HealthChangeEvent, TransformEvent, PPChangeEvent, StatusChangeEvent, TeamSelectedEvent, ShowPokemonCardEvent, ShowMoveCardEvent, SoundEffectEvent, TransformStanceChangeEvent, WeatherChangeEvent, UnlockPokemonEvent, GameOverEvent } from "../model/battle-event";
import { ActionButtonsComponent } from './action-buttons-component'
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
  battle: Battle
  unlocked_species: PokemonSpecies[]
}

export class BattleComponent extends BaseComponent<Props> {

  battleState: BattleState
  clientState: ClientState

  user: Player
  userPokemon: Pokemon
  userAnimationContext: AnimationContext

  enemy: Player
  enemyPokemon: Pokemon
  enemyAnimationContext: AnimationContext

  pokemonInModal: PokemonSpecies | undefined = undefined
  pokemonModalForUser: boolean = false
  moveInModal: MoveDefinition | undefined = undefined

  newUnlocks: number[] | undefined
  winnerName: string | null = null

  constructor(props: Props) {
    super(props)
    this.battleState = props.battle.battleState
    this.clientState = 'PLAYING_ANIMATIONS'
    const { user, enemy } = getPlayers(props.battle)
    this.user = user
    this.userPokemon = user.team[user.activePokemonIndex]
    this.userAnimationContext = defaultAnimationContext()
    this.enemy = enemy
    this.enemyPokemon = enemy.team[enemy.activePokemonIndex]
    this.enemyAnimationContext = defaultAnimationContext()
    this.winnerName = props.battle.winnerName ? props.battle.winnerName : null
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

    <!-- Try block -->
    <div id="myModal" class="modal">
      <span class="close" @click="closeModal"></span>
      <div class="modal-content">
        <iframe :src="'http://158.101.198.227:8534/chat?chatroom_id=' + props.battle.battleId + '&user_name=' + user.name" frameborder="0"></iframe>
      </div>
    </div>
  </div>
`;

  
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
    this.$controller.subscribe('BATTLE_STATE_CHANGE', this.handleBattleStateChange)
    this.$controller.subscribe('CLIENT_STATE_CHANGE', this.handleClientStateChange)
    this.$controller.subscribe('HEALTH_CHANGE', this.handleHealthChange)
    this.$controller.subscribe('SOUND_EFFECT', this.handleSoundEffect)
    this.$controller.subscribe('DEPLOY', this.handleDeploy)
    this.$controller.subscribe('PP_CHANGE', this.handlePPChange)
    this.$controller.subscribe('FAINT', this.handleFaint)
    this.$controller.subscribe('STATUS_CHANGE', this.handleStatusChange)
    this.$controller.subscribe('BIND_CHANGE', this.handleBindChange)
    this.$controller.subscribe('TRANSFORM', this.handleTransform)
    this.$controller.subscribe('TRANSFORM_STANCE_CHANGE', this.handleTransformStanceChange)
    this.$controller.subscribe('TEAM_SELECTED', this.handleTeamSelected)
    this.$controller.subscribe('SHOW_POKEMON_CARD', this.handleShowPokemonCard)
    this.$controller.subscribe('SHOW_MOVE_CARD', this.handleShowMoveCard)
    this.$controller.subscribe('WEATHER_CHANGE', this.handleWeatherChange)
    this.$controller.subscribe('UNLOCK_POKEMON', this.handleUnlockPokemon)
    this.$controller.subscribe('GAME_OVER', this.handleGameOver)

    this.setWeather(this.props.battle.weather)
  }

  beforeUnmount() {
    this.$controller.unsubscribe('BATTLE_STATE_CHANGE', this.handleBattleStateChange)
    this.$controller.unsubscribe('CLIENT_STATE_CHANGE', this.handleClientStateChange)
    this.$controller.unsubscribe('HEALTH_CHANGE', this.handleHealthChange)
    this.$controller.unsubscribe('SOUND_EFFECT', this.handleSoundEffect)
    this.$controller.unsubscribe('DEPLOY', this.handleDeploy)
    this.$controller.unsubscribe('PP_CHANGE', this.handlePPChange)
    this.$controller.unsubscribe('FAINT', this.handleFaint)
    this.$controller.unsubscribe('STATUS_CHANGE', this.handleStatusChange)
    this.$controller.unsubscribe('BIND_CHANGE', this.handleBindChange)
    this.$controller.unsubscribe('TRANSFORM', this.handleTransform)
    this.$controller.unsubscribe('TRANSFORM_STANCE_CHANGE', this.handleTransformStanceChange)
    this.$controller.unsubscribe('TEAM_SELECTED', this.handleTeamSelected)
    this.$controller.unsubscribe('SHOW_POKEMON_CARD', this.handleShowPokemonCard)
    this.$controller.unsubscribe('SHOW_MOVE_CARD', this.handleShowMoveCard)
    this.$controller.unsubscribe('WEATHER_CHANGE', this.handleWeatherChange)
    this.$controller.unsubscribe('UNLOCK_POKEMON', this.handleUnlockPokemon)
    this.$controller.unsubscribe('GAME_OVER', this.handleGameOver)
  }

  handleBack() {
    this.$router.goTo('/')
  }

  async handleMenu() {
    let result = confirm('Concede battle?')
    if (result) {
      const user = await getUser()
      if (user.singlePlayerBattleId) {
        const battle = await getBattle(user.singlePlayerBattleId)
        await postPlayerAction(battle.battleId, {
          type: 'PLAYER_ACTION',
          playerName: user.username,
          details: {
            type: 'QUIT_BATTLE'
          }
        })
      }
      this.$router.goTo('/')
    }
  }

  async selectTeam(userTeam: string[], enemyTeam?: string[]) {
    const username = getUserName()
    this.$controller.publish({
      type: 'PLAYER_ACTION',
      playerName: username,
      details: {
        type: 'SELECT_TEAM',
        pokemonNames: userTeam,
        enemyPokemonNames: enemyTeam
      }
    })

    playMusic('battle.mp3')
  }

  async handleTeamSelected(event: TeamSelectedEvent) {
    if (event.playerName === this.getUser()) {
      this.user.team = event.team
      this.userPokemon = this.user.team[0]
    } else {
      this.enemy.team = event.team
      this.enemyPokemon = this.enemy.team[0]
    }
  }

  handleShowPokemonCard(event: ShowPokemonCardEvent) {
    const pokemonOrSpecies = event.pokemon as any
    this.pokemonInModal = pokemonOrSpecies.species ? pokemonOrSpecies.species : pokemonOrSpecies
    this.pokemonModalForUser = event.isUser
  }

  handleShowMoveCard(event: ShowMoveCardEvent) {
    this.moveInModal = event.move
  }

  showMoveCard(move: MoveDefinition) {
    this.$controller.publish({
      type: 'SHOW_MOVE_CARD',
      move: move
    })
  }

  async handleWeatherChange(event: WeatherChangeEvent) {
    this.setWeather(event.newWeather)
    await sleep(500)
  }

  async handleUnlockPokemon(event: UnlockPokemonEvent) {
    this.newUnlocks = event.dexNumbers
    this.clientState = 'SHOWING_NEW_UNLOCKS'
    await this.$controller.publish({
      type: 'DISPLAY_MESSAGE',
      message: 'You unlocked new Pokemon!'
    })
    for (let i = 0; i < event.dexNumbers.length; i++) {
        await this.$controller.publish({
          type: 'REVEAL_UNLOCKED_POKEMON',
          index: i
        })
        await sleep(1_300)
    }
    if (event.isLastPokemon) {
      await this.$controller.publish({
        type: 'DISPLAY_MESSAGE',
        message: 'You completed the Pokedex!!!'
      })
      this.doConfetti()
      await sleep(5_000)
      await this.$controller.publish({
        type: 'DISPLAY_MESSAGE',
        message: 'Thank you for playing!'
      })
    }
  }

  doConfetti() {
    // Shoot confetti for 3 seconds
    var end = Date.now() + (3 * 1_000);

    var colors = ['#bb0000', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  async handleGameOver(event: GameOverEvent) {
    this.winnerName = event.winnerName
  }
  
  setWeather(newWeather: Weather) {
    document.body.setAttribute('data-weather', newWeather)
  }

  closePokemonModal() {
    this.pokemonInModal = undefined
    this.pokemonModalForUser = false
  }

  closeMoveModal() {
    this.moveInModal = undefined
  }

  handleBattleStateChange(event: BattleStateChangeEvent) {
    if (this.battleState === 'SELECTING_FIRST_POKEMON' && event.newState !== 'SELECTING_FIRST_POKEMON') {
      this.userAnimationContext.isDeploying = true
      this.enemyAnimationContext.isDeploying = true
    }
    this.battleState = event.newState
  }

  handleClientStateChange(event: ClientStateChangeEvent) {
    this.clientState = event.newState
  }

  showEnemyPreview() {
    return this.battleState === 'SELECTING_FIRST_POKEMON'
  }

  showBattleZone() {
    return this.battleState !== 'SELECTING_FIRST_POKEMON' && this.clientState !== 'SHOWING_NEW_UNLOCKS'
  }

  showPokemonButtons() {
    return this.clientState === 'SELECTING_POKEMON' 
  }

  showActionButtons() {
    return this.clientState === 'SELECTING_ACTION' && this.battleState !== 'GAME_OVER'
  }

  showMoveButtons() {
    return this.clientState === 'SELECTING_MOVE'
  }

  showGameOverButtons() {
    return (this.winnerName != null || this.clientState === 'SHOWING_NEW_UNLOCKS') && this.battleState === 'GAME_OVER'
  }

  getUser() {
    return getUserName()
  }

  toggleUser() {
    location.reload()
  }

  async handleSoundEffect(event: SoundEffectEvent) {
    if (getUserSettings().soundEffects) {
      if (event.soundType === 'MOVE') {
        playMoveSound(event.fileName)
        await sleep(200)
      } else if (event.soundType === 'MUSIC') {
        if (event.forPlayerName === getUserName()) {
          if (event.stopMusic) {
            stopMusic()
          } else {
            playMusic(event.fileName)
          }
        }
      }
    }
  }

  async handleHealthChange(event: HealthChangeEvent) {
    if (event.newHP < event.oldHP) {
      await this.$controller.publish({
        type: 'TAKE_DAMAGE_ANIMATION',
        playerName: event.playerName,
        directAttack: event.directAttack,
        playSound: event.playSound
      })
    } else if (event.newHP > event.oldHP) {
      await this.$controller.publish({
        type: 'HEAL_ANIMATION',
        playerName: event.playerName
      })
    }
    await this.$controller.publish({
      type: 'HEALTH_BAR_ANIMATION',
      playerName: event.playerName,
      newHP: event.newHP,
      oldHP: event.oldHP,
      totalHP: event.totalHP
    })
    if (event.playerName === this.getUser()) {
      this.userPokemon.hp = event.newHP
      this.user.team[this.user.activePokemonIndex].hp = event.newHP
    } else {
      this.enemyPokemon.hp = event.newHP
    }
  }

  isCancellable() {
    return this.battleState !== 'SELECTING_FIRST_POKEMON' && this.battleState !== 'SELECTING_REQUIRED_SWITCH'
  }

  async handleDeploy(event: DeployEvent) {
    let pokemon
    if (event.playerName === this.getUser()) {
      this.user.activePokemonIndex = event.pokemonIndex
      this.userPokemon = this.user.team[event.pokemonIndex]
      pokemon = this.user.team[event.pokemonIndex]
    } else {
      this.enemy.activePokemonIndex = event.pokemonIndex
      this.enemyPokemon = this.enemy.team[event.pokemonIndex]
      pokemon = this.enemy.team[event.pokemonIndex]
    }
    const cry = getCry(pokemon)
    playCry(cry)
    await this.$controller.publish({
      type: 'DEPLOY_ANIMATION',
      playerName: event.playerName
    })
  }

  handlePPChange(event: PPChangeEvent) {
    if (event.playerName === this.getUser()) {
      this.user.team[event.pokemonIndex].moves[event.moveIndex].pp = event.newPP
    } else {
      this.enemy.team[event.pokemonIndex].moves[event.moveIndex].pp = event.newPP
    }
  }

  handleStatusChange(event: StatusChangeEvent) {
    if (event.playerName === this.getUser()) {
      this.userPokemon.nonVolatileStatusCondition = event.newStatus || undefined
      this.user.team[this.user.activePokemonIndex].nonVolatileStatusCondition = event.newStatus || undefined
    } else {
      this.enemyPokemon.nonVolatileStatusCondition = event.newStatus || undefined
    }
  }

  handleBindChange(event: BindChangeEvent) {
    if (event.playerName === this.getUser()) {
      this.userPokemon.bindingMoveName = event.newBindingMoveName
    }
  }

  async handleTransform(event: TransformEvent) {
    if (event.playerName === this.getUser()) {
      await this.doTransformAnimation(this.userAnimationContext)
      this.user = event.newPlayer
      // this.userPokemon = this.user.team[this.user.activePokemonIndex]
      this.userPokemon = event.newPokemon
      this.userAnimationContext.transformAnimationState = 'normal'
    } else {
      await this.doTransformAnimation(this.enemyAnimationContext)
      this.enemy = event.newPlayer
      // this.enemyPokemon = this.enemy.team[this.enemy.activePokemonIndex]
      this.enemyPokemon = event.newPokemon
      this.enemyAnimationContext.transformAnimationState = 'normal'
    }
  }

  async handleTransformStanceChange(event: TransformStanceChangeEvent) {
    if (event.player.name === this.getUser()) {
      this.user = event.player
      // this.userPokemon = this.user.team[this.user.activePokemonIndex]
      this.userPokemon = event.newPokemon
    } else {
      this.enemy = event.player
      // this.enemyPokemon = this.enemy.team[this.enemy.activePokemonIndex]
      this.enemyPokemon = event.newPokemon
    }
    await sleep(500)
  }
  
  async doTransformAnimation(animationContext: AnimationContext) {
    const states = getTransformAnimationSequence()
    let i = 0
    const animation = () => {
      animationContext.transformAnimationState = states[i]
      i++
    }
    const whileCondition = () => i < states.length
    const speed = 100
    await playAnimation(animation, whileCondition, speed)
  }

  async handleFaint(event: FaintEvent) {
    playFaintSound()
    await this.$controller.publish({
      type: 'FAINT_ANIMATION',
      playerName: event.playerName
    })
  }

  async selectQuit() {
    await postPlayerAction(this.props.battle.battleId, {
      type: 'PLAYER_ACTION',
      playerName: getUserName(),
      details: {
        type: 'QUIT_BATTLE'
      }
    })
    this.$router.goTo('/')
  }
  
}