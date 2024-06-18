export async function sleep(millis: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, millis))
}

export async function playAnimation(animation: ()=>void, whileCondition: ()=>boolean, speed: number): Promise<void> {
  return new Promise(resolve => {
    let frameCount = 0
    let lastFrameTime = Date.now()
    const callback = () => {
      let currentTime = Date.now()
      if (currentTime - lastFrameTime >= speed) {
        if (whileCondition()) {
          animation()
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