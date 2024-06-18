import { HealthBarAnimationEvent, HealthChangeEvent } from "../model/battle-event"
import { Pokemon } from "../model/pokemon"
import { playAnimation, sleep } from "../util/async-utils"
import { BaseComponent } from "./base-component"
import { getUserName } from "./client-api"

interface Props {
  is_user: boolean
  pokemon: Pokemon
}

export class HpComponent extends BaseComponent<Props> {

  percent: number
  color: string

  constructor(props: Props) {
    super(props)
    this.percent = getPercent(props.pokemon.hp, props.pokemon.startingHP)
    this.color = getColor(this.percent)
  }

  template = /*html*/ `
    <div>
      <hp-bar-component :percent="percent" :color="color"></hp-bar-component>
    </div>
  `
  includes = {
    HpBarComponent
  }

  beforeMount() {
    this.$controller.subscribe('HEALTH_BAR_ANIMATION', this.changeHealth)
  }

  beforeUnmount() {
    this.$controller.unsubscribe('HEALTH_BAR_ANIMATION', this.changeHealth)
  }

  async changeHealth(event: HealthBarAnimationEvent): Promise<void> {
    if ((this.props.is_user && event.playerName === getUserName()) || 
        (!this.props.is_user && event.playerName !== getUserName())) {
          if (event.newHP === event.oldHP) {
            // Handle case where a Pokemon switches in and we just want to update HP bar
            this.percent = getPercent(event.newHP, event.totalHP)
            this.color = getColor(this.percent)
          } else {
            // Do taking damage animation
            this.percent = getPercent(event.oldHP, event.totalHP)
            const targetPercent = getPercent(event.newHP, event.totalHP)
            this.color = getColor(targetPercent)
            const animation = () => {
              const plusOrMinus = this.percent < targetPercent ? 1 : -1
              this.percent += plusOrMinus
            }
            const whileCondition = () => this.percent > 0 && this.percent <= 100 && this.percent !== targetPercent
            const speed = 12
            await playAnimation(animation, whileCondition, speed)
          }
    }
  }

}

export class HpBarComponent extends BaseComponent<{
  percent: number,
  color: string
}> {
  template = /*html*/ `
    <div class="flex flex-row justify-end items-center h-4">
      <div class="rounded w-full h-2 border mx-2 mb-3 ">
        <div class="h-2.5 pt-0.5 pb-0.5 px-1 rounded-lg bg-gray-600">
          <div style="width: {{props.percent}}%;" class="h-1 rounded-lg {{props.color}}"></div>
        </div>
      </div>
    </div>
  `

}

export function getPercent(current: number, total: number) {
  const totalOrZero = total > 0 ? total : 0
  const result = (current / totalOrZero) * 100
  return result >= 0 ? Math.ceil(result) : 0
}

export function getColor(percent: number): string {
  if (percent > 50) {
    return 'bg-green-200'
  } else if (percent > 20) {
    return 'bg-yellow-300'
  } else {
    return 'bg-red-500'
  }
}