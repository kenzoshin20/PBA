export type TransformAnimationState = 'normal' | 'transform-dark1' | 'transform-dark2' | 'transform-flash'

export function getTransformAnimationSequence(): TransformAnimationState[] {
  return [
    'transform-dark1', 
    'transform-dark2', 
    'transform-flash',
    'transform-dark2', 
    'transform-flash',
    'transform-dark2', 
    'transform-flash',
  ]
}