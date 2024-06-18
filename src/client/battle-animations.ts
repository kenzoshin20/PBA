/*

Animation primitives:

Pokemon visible/invisible
Pokemon move left, right, etc
Pokemon grow/shrink
Pokemon fade (maybe for ghost move?)

Create particle
movement
grow/shrink
fade


*/

interface EffectPosition {
	x: number
	y: number
	z: number
}

function showEffect(effect: string, start: EffectPosition, end: EffectPosition) {
  
}

export async function executeAnimation(user: HTMLElement, target: HTMLElement) {
  const speed = 500
  let size = 10
  let opacity = 9
  const animation = () => {
    opacity -= 1
    size += 20
    user.style.height = size + 'px'
    user.style.width = size + 'px'
    user.style.opacity = '0.' + opacity
    return opacity > 0
  }
  playAnimation(animation, speed)
}

export async function playAnimation(animation: ()=>boolean, speed: number): Promise<void> {
  return new Promise(resolve => {
    let frameCount = 0
    let lastFrameTime = Date.now()
    let continuePlaying = true
    const callback = () => {
      let currentTime = Date.now()
      if (currentTime - lastFrameTime >= speed) {
        if (continuePlaying) {
          continuePlaying = animation()
          frameCount++
          lastFrameTime = currentTime
          requestAnimationFrame(callback)
        } else {
          // Animation is done so resolve the Promise
          resolve()
        }
      } else {
        requestAnimationFrame(callback)
      }
    }
    // Start the animation
    requestAnimationFrame(callback)
  })
} 