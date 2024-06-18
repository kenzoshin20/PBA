import { speciesList } from "../data/pokemon-data";
import { allAvatars } from "../model/avatar";
import { getSpriteName } from "../model/pokemon-species";
import { logInfo } from "../util/logger";

function preloadImages(imageUrls: string[]) {
  imageUrls.forEach(url => {
    new Image().src = url
  })
}

export function preloadMiscImages() {
  const startTime = performance.now()
  preloadImages([
    '/img/category-phsyical.png',
    '/img/category-special.png',
    '/img/category-status.png',
  ])
  const miscTime = performance.now() - startTime
  logInfo(`Cached misc images in ${miscTime} millis`)
}

export function preloadPokemonSprites() {
  const startTime = performance.now()
  preloadImages(speciesList.map(s => `/sprites/front/${getSpriteName(s)}.png`))
  preloadImages(speciesList.map(s => `/sprites/back/${getSpriteName(s)}.png`))
  preloadImages(speciesList.map(s => `/sprites/front-ani/${getSpriteName(s)}.gif`))
  preloadImages(speciesList.map(s => `/sprites/back-ani/${getSpriteName(s)}.gif`))
  const time = performance.now() - startTime
  logInfo(`Cached Pokemon images in ${time} millis`)
}

export function preloadTrainerSprites() {
  const startTime = performance.now()
  preloadImages(allAvatars.map(avatar => `/sprites/trainers/${avatar.file}.png`))
  const time = performance.now() - startTime
  logInfo(`Cached trainer images in ${time} millis`)
}