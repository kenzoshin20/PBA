import { moves } from "../data/move-data";
import { DeployAnimationEvent, FaintAnimationEvent, HazardsChangeEvent, HealAnimationEvent, StatusChangeEvent, TakeDamageAnimationEvent, WithdrawEvent } from "../model/battle-event";
import { getSoundEffect } from "../model/move";
import { Pokemon } from "../model/pokemon";
import { NonVolatileStatusCondition } from "../model/status-conditions";
import { playAnimation, sleep } from "../util/async-utils";
import { AnimationContext } from "./animation-context";
import { BaseComponent } from "./base-component";
import { getUserName } from "./client-api";
import { getUserSettings } from "./user-settings-controller";
import { playEffectSound, playMoveSound, playStatusSound, playSwitchSound } from "./audio";
import { Player } from "../model/player";

interface Props {
  pokemon: Pokemon
  player?: Player
  animation_ctx: AnimationContext
}

export class BasePokemonComponent extends BaseComponent<Props> {

  deploying: boolean = false
  withdrawing: boolean = false

  visible: boolean
  hudVisible: boolean

  status: NonVolatileStatusCondition | null | undefined

  isUser: boolean

  spikes: number = 0
  toxic_spikes: number = 0
  rocks: boolean | undefined = false
  web: boolean | undefined = false
  reflect: boolean = false
  light_screen: boolean = false

  constructor(props: Props, isUser: boolean) {
    super(props)
    this.isUser = isUser
    this.status = props.pokemon.nonVolatileStatusCondition
    if (props.animation_ctx.isDeploying || props.pokemon.hp <= 0) {
      this.visible = false
      this.hudVisible = false
    } else {
      this.visible = true
      this.hudVisible = true
    }
    if (this.props.player) {
      this.spikes = this.props.player.spikeLayerCount
      this.toxic_spikes = this.props.player.toxicSpikeLayerCount
      this.rocks = this.props.player.hasStealthRock
      this.web = this.props.player.hasStickyWeb
      this.reflect = this.props.player.remainingReflectTurns > 0
      this.light_screen = this.props.player.remainingLightScreenTurns > 0
    }
  }

  beforeMount() {
    // Binds are needed because this is a base component class
    this.handleTakeDamageAnimation = this.handleTakeDamageAnimation.bind(this)
    this.handleHealAnimation = this.handleHealAnimation.bind(this)
    this.handleDeploy = this.handleDeploy.bind(this)
    this.handleWithdraw = this.handleWithdraw.bind(this)
    this.handleFaint = this.handleFaint.bind(this)
    this.handleStatusChange = this.handleStatusChange.bind(this)
    this.handleHazardsChange = this.handleHazardsChange.bind(this)

    this.$controller.subscribe('TAKE_DAMAGE_ANIMATION', this.handleTakeDamageAnimation)
    this.$controller.subscribe('HEAL_ANIMATION', this.handleHealAnimation)
    this.$controller.subscribe('DEPLOY_ANIMATION', this.handleDeploy)
    this.$controller.subscribe('WITHDRAW', this.handleWithdraw)
    this.$controller.subscribe('FAINT_ANIMATION', this.handleFaint)
    this.$controller.subscribe('STATUS_CHANGE', this.handleStatusChange)
    this.$controller.subscribe('HAZARDS_CHANGE', this.handleHazardsChange)
  }

  beforeUnmount() {
    this.$controller.unsubscribe('TAKE_DAMAGE_ANIMATION', this.handleTakeDamageAnimation)
    this.$controller.subscribe('HEAL_ANIMATION', this.handleHealAnimation)
    this.$controller.unsubscribe('DEPLOY_ANIMATION', this.handleDeploy)
    this.$controller.unsubscribe('WITHDRAW', this.handleWithdraw)
    this.$controller.unsubscribe('FAINT_ANIMATION', this.handleFaint)
    this.$controller.unsubscribe('STATUS_CHANGE', this.handleStatusChange)
    this.$controller.unsubscribe('HAZARDS_CHANGE', this.handleHazardsChange)
  }

  async handleHealAnimation(event: HealAnimationEvent) {
    if (this.isForThisPokemon(event.playerName)) {
      playEffectSound('effect_heal.mp3')
      const sprite: HTMLImageElement = this.$element.querySelector('[data-pokemon-img]') as HTMLImageElement
      const speed = 70
      const totalToggles = 6
      let toggleCount = 0
      let flashing = false
      const toggleFlashing = () => {
        flashing = !flashing
        if (flashing) {
          sprite.style.opacity = '0.2'
        } else {
          sprite.style.opacity = '1'
        }
        toggleCount++
      }
      const whileCondition = () => toggleCount < totalToggles
      await playAnimation(toggleFlashing, whileCondition, speed)
    }
  }

  async handleTakeDamageAnimation(event: TakeDamageAnimationEvent) {
    if (this.isForThisPokemon(event.playerName)) {
      if (event.directAttack) {
        await this.doDirectAttackDamageAnimation(event)
      } else {
        await this.doIndirectDamageAnimation(event)
      }
    }
  }

  private async doDirectAttackDamageAnimation(event: TakeDamageAnimationEvent) {
    const sprite: HTMLImageElement = this.$element.querySelector('[data-pokemon-img]') as HTMLImageElement
    const isUser = event.playerName === getUserName()
    const startPaddingLeft = parseInt(sprite.style.paddingLeft.replace('px', ''))
    const userAdjustPosition = (offset: number) => sprite.style.paddingLeft = startPaddingLeft - offset + 'px'
    const enemyAdjustPostiion = (offset: number) => sprite.style.marginLeft = offset + 'px'
    const adjustPosition = isUser ? userAdjustPosition : enemyAdjustPostiion

    // Hit
    sprite.style.opacity = '0.5'
    await sleep(80)
    adjustPosition(15)
    await sleep(100)

    // Slide back
    sprite.style.opacity = '1'
    adjustPosition(10)
    await sleep(20)
    adjustPosition(5)
    await sleep(20)
    adjustPosition(0)
  }

  private async doIndirectDamageAnimation(event: TakeDamageAnimationEvent) {
    if (getUserSettings().soundEffects && event.playSound) {
      playMoveSound('attack_generic.mp3')
      await sleep(200)
    }
    const sprite: HTMLImageElement = this.$element.querySelector('[data-pokemon-img]') as HTMLImageElement
    sprite.style.opacity = '0.2'
    await sleep(100)
    sprite.style.opacity = '1'
  }

  private isForThisPokemon(playerName: string) {
    return ((this.isUser && playerName === getUserName()) || 
      (!this.isUser && playerName !== getUserName()))
  }

  async handleDeploy(event: DeployAnimationEvent) {
    if (this.isForThisPokemon(event.playerName)) {
      await this.$controller.publish({
        type: 'HEALTH_BAR_ANIMATION',
        newHP: this.props.pokemon.hp,
        oldHP: this.props.pokemon.hp,
        playerName: event.playerName,
        totalHP: this.props.pokemon.startingHP
      })
      this.withdrawing = false
      this.deploying = true
      this.visible = true
      this.status = this.props.pokemon.nonVolatileStatusCondition
      await sleep(270) // Animation is playing
      this.hudVisible = true
      this.deploying = false
      await sleep(450) // Pause after deploy
    }
  }

  async handleWithdraw(event: WithdrawEvent) {
    if (this.isForThisPokemon(event.playerName)) {
      playSwitchSound()
      this.withdrawing = true
      this.props.pokemon.imgHeight = this.props.pokemon.startingImgHeight
      this.props.pokemon.spriteName = this.props.pokemon.startingSpriteName
      await sleep(200)
      this.hudVisible = false
      this.status = null
    }

  }

  async handleFaint(event: FaintAnimationEvent) {
    if (this.isForThisPokemon(event.playerName)) {
      this.withdrawing = true
      await sleep(200)
      this.hudVisible = false
    }
  }

  async handleStatusChange(event: StatusChangeEvent) {
    if (this.isForThisPokemon(event.playerName)) {
      if (event.newStatus) {
        playStatusSound(event.newStatus)
      }
      this.status = event.newStatus
      await sleep(600)
    }
  }

  async handleHazardsChange(event: HazardsChangeEvent) {
    if (this.isForThisPokemon(event.playerName)) {
      this.spikes = event.spikeLayerCount
      this.toxic_spikes = event.toxicSpikeLayerCount
      this.web = event.hasStickyWeb
      this.rocks = event.hasStealthRock
      this.reflect = event.hasReflect
      this.light_screen = event.hasLightScreen
    }
  }

}