import { TransformAnimationState } from "./transform-animation";

export interface AnimationContext {
  isDeploying: boolean
  transformAnimationState: TransformAnimationState
}

export function defaultAnimationContext(): AnimationContext {
  return {
    isDeploying: false,
    transformAnimationState: 'normal'
  }
}