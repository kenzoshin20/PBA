import { Nuro } from 'nuro'
import { NuroRouter } from 'nuro-router'
import { AppComponent } from './app-component'
import { configureLogger } from '../util/logger'
import { Controller } from './controller'
import { getSpriteName } from '../model/pokemon-species'
import { ModalComponent } from './modal-component'
import { getMoveDescription } from '../model/move-description'

configureLogger({ enabled: true })

Nuro.mixin({
  $controller: new Controller(),
  getSprite: getSpriteName,
  getMoveDescription: getMoveDescription
})

Nuro.install(NuroRouter)

Nuro.register('modal-component', ModalComponent)

const element = document.createElement('div')
document.body.appendChild(element)
Nuro.mount(AppComponent, element)

// const pokemon = document.createElement('img')
// pokemon.src = '/sprites/front/alakazam.png'
// pokemon.style.position = 'absolute'
// pokemon.style.top = '50px'
// pokemon.style.left = '50px'
// document.body.appendChild(pokemon)



// const particle = document.createElement('img')
// particle.src = '/particles/fireball.png'
// // particle.style.position = 'absolute'
// particle.style.top = '50px'
// particle.style.left = '50px'
// document.body.appendChild(particle)

// executeAnimation(particle, particle)


// const img = new Image();
// img.onload = function() {
//   alert(this.width + 'x' + this.height);
// }
// img.src = '/sprites/front-ani/jolteon.gif'; //47x49
// img.src = '/sprites/front-ani/snorlax.gif'; //74x75