import { MoveAudioFile } from "../client/audio"
import { EffectsDefinition } from "./effects-definition"
import { MoveCategory } from "./move-category"
import { Type } from "./type"

export type MovePriority = -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface MoveDefinition {
  readonly name: string
  readonly startingPP: number
  readonly type: Type
  readonly power?: number
  readonly category: MoveCategory
  readonly accuracy?: number
  readonly priority?: MovePriority
  readonly effects?: EffectsDefinition
  readonly description?: string
  readonly soundEffect?: MoveAudioFile
  readonly makesContact?: false
  readonly soundBased?: true
  readonly stormRelated?: true
}