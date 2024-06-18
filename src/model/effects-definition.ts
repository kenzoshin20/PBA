import { MoveName } from "../data/move-data";
import { PokemonSize } from "./pokemon-size";
import { StageStat } from "./stages";
import { NonVolatileStatusCondition } from "./status-conditions";
import { Type } from "./type";
import { Weather } from "./weather";

type StagesCount = 1 | 2 | 3 | 4 | 5 | 6 | -1 | -2 | -3 | -4 | -5 | -6

export interface EffectsDefinition {
  readonly modifyStages?: {
    modifiers: {
      userOrTarget: 'USER' | 'TARGET'
      stageStat: StageStat
      stages: StagesCount
      chance: number
    }[]
  }
  readonly applyNonVolatileStatusConditions?: {
    conditions: {
      type: NonVolatileStatusCondition
      chance: number
    }[]
  }
  readonly applyConfusion?: {
    chance: number
  }
  readonly halfRemainingHP?: boolean
  readonly multipleHits?: {
    additionalHits: {
      chance: number
    }[]
  }
  readonly flinchTarget?: {
    chance: number
  }
  readonly protectUser?: boolean
  readonly recoil?: {
    percent: number
  }
  readonly recoilBasedOnUserHP?: {
    percent: number
    showRecoilText: boolean
  }
  readonly maximizeAttack?: boolean
  readonly drain?: {
    percent: number
  }
  readonly increaseCritical?: {
    percent: number
  }
  readonly ignoreAccuracyAndEvasion?: boolean
  readonly constantDamage?: {
    damage: number
  }
  readonly healUser?: {
    percent: number,
    modifiedByWeather?: true
  }
  readonly powerBasedOnTargetSize?: {
    powers: Record<PokemonSize, number>
  }
  readonly doublePowerIfTargetHasStatus?: {
    statuses: NonVolatileStatusCondition[] | 'ANY'
  }
  readonly lastResort?: boolean
  readonly applyBind?: boolean
  readonly removeUserBindAndEntryHazards?: boolean
  readonly copyTargetLastMove?: boolean
  readonly randomMove?: {
    moveNames: MoveName[]
  }
  readonly doublePowerIfDamagedFirst?: boolean
  readonly doubleDamageTaken?: {
    categoryRestriction: 'PHYSICAL' | 'SPECIAL'
  }
  readonly setStickyWeb?: boolean
  readonly setStealthRock?: boolean
  readonly setSpikes?: boolean
  readonly setToxicSpikes?: boolean
  readonly removeUserType?: {
    type: Type
  }
  readonly replaceTargetTypes?: {
    type: Type
  }
  readonly forceTargetSwitch?: boolean
  readonly replaceUserTypesBasedOnTargetLastMove?: boolean
  readonly swapStats?: {
    stats: StageStat[]
  }
  readonly transformIntoTarget?: boolean
  readonly doNothing?: boolean
  readonly oneHitKnockout?: boolean
  readonly noEffectOnType?: {
    type: Type
  }
  readonly useDefenseForDamageCalc?: boolean
  readonly reflect?: boolean
  readonly lightScreen?: boolean
  readonly breakScreens?: boolean
  readonly failIfTargetDoesntHaveStatus?: {
    statuses: NonVolatileStatusCondition[]
  }
  readonly failIfUserDoesntHaveStatus?: {
    statuses: NonVolatileStatusCondition[]
  }
  readonly setLeechSeed?: boolean
  readonly roost?: boolean
  readonly selfDestruct?: boolean
  readonly targetLastMoveLosesPP?: boolean
  readonly powerMultipliedByHpPercent?: boolean
  readonly powerHigherWhenHpLower?: boolean
  readonly powerHigherWhenSpeedLower?: boolean
  readonly powerDoublesWhenTargeHpIsLow?: boolean
  readonly useTargetAttack?: boolean
  readonly suckerPunch?: boolean
  readonly rest?: boolean
  readonly kingsShield?: true
  readonly applyWeather?: Weather
}