import { StageStat } from "./stages";
import { NonVolatileStatusCondition } from "./status-conditions";
import { Type } from "./type";
import { Weather } from "./weather";

export interface AbilityDefinition {
  name: string
  desc: string
  transformIntoTarget?: boolean
  increaseUserAccuracy?: { percent: number }
  multiHitMax?: boolean
  preventFlinching?: boolean
  preventOHKO?: boolean
  raised?: boolean
  receivingContactInflictsStatus?: { status: NonVolatileStatusCondition }
  receivingContactDoesDamage?: { percent: number }
  receivingContactGivesAbility?: boolean
  attackingWithContactInflictsStatus?: { status: NonVolatileStatusCondition }
  preventRecoil?: boolean
  preventStatus?: { statuses: ReadonlyArray<NonVolatileStatusCondition> | 'ANY' }
  preventRecievingCrit?: boolean
  boostLowPowerMoves?: boolean
  reduceDamageFromReceivingSuperEffective?: boolean
  preventIndirectDamage?: boolean
  buffFromAttackType?: { type: Type }
  healFromAttackType?: { type: Type }
  removeStatusOnSwitch?: boolean
  healOnSwitch?: boolean
  lowerEnemyStatOnSwitchIn?: { stat: StageStat }
  pinchBoostForType?: { type: Type }
  preventLoweringStats?: { stats: ReadonlyArray<StageStat> | 'ANY' }
  enemyUsesExtraPP?: boolean
  boostAttackWhenHavingStatus?: boolean
  boostDefenseWhenHavingStatus?: boolean
  syncStatus?: boolean
  preventNonRaisedEnemySwitching?: boolean
  preventNonGhostEnemySwitching?: boolean
  wakeUpEarly?: boolean
  doubleAttack?: boolean
  increasePriorityOfStatusMoves?: boolean
  chanceToRemoveUserStatusAtEndOfTurn?: boolean
  truant?: boolean
  weakArmor?: boolean
  reduceDamageWhenHpIsFull?: boolean
  boostPunches?: boolean
  wonderGuard?: boolean
  sheerForce?: boolean
  soundProof?: boolean
  stanceChange?: boolean
  healDuringWeather?: Weather
  doubleSpeedDuringWeather?: Weather
  raiseEvasionDuringWeather?: Weather
  applyWeatherOnSwitchIn?: Weather
  raiseAttackOrSpecialAttackOnSwitchIn?: boolean
  damageSleepingEnemy?: boolean
  sandForce?: boolean
  doubleChanceOfSecondaryEffects?: boolean
  speedBoost?: boolean
  thickFat?: boolean
  suppressWeather?: boolean
  pixilate?: boolean
}