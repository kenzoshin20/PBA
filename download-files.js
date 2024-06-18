import https from 'https'
import fs from 'fs'
import { speciesList } from './build/data/pokemon-data.js'
import { getSpriteName } from './build/model/pokemon-species.js'

const SPRITE_HOST_URL = 'https://play.pokemonshowdown.com/sprites/'
const SPRITES_DIR = 'assets/sprites/'

const CRIES_HOST_URL = 'https://play.pokemonshowdown.com/audio/cries/'
const CRIES_DIR = 'assets/audio/cries'

downloadSprites('front', 'gen5', '.png')
downloadSprites('back', 'gen5-back', '.png')
downloadSprites('front-ani', 'gen5ani', '.gif')
downloadSprites('back-ani', 'gen5ani-back', '.gif')
downloadCries()

async function downloadSprites(side, hostFolder, fileExtension) {
  for (const species of speciesList) {
    const name = getSpriteName(species).replace(`'`, '')
    downloadSprite(name, side, hostFolder, fileExtension)
    if (species.altSpriteName) {
      downloadSprite(species.altSpriteName, side, hostFolder, fileExtension)
    }
  }
}

async function downloadSprite(name, side, hostFolder, fileExtension) {
  const filePath = SPRITES_DIR + side + '/' + name + fileExtension
  if (!fs.existsSync(filePath)) {
    console.log('File path ' + filePath);
    const spriteUrl = SPRITE_HOST_URL + hostFolder + '/' + name + fileExtension
    console.log('Sprite URL ' + spriteUrl);
    await download(spriteUrl, filePath)
  }
}

async function downloadCries() {
  for (const species of speciesList) {
    const name = getSpriteName(species).replace(`'`, '')
    const filePath = CRIES_DIR + '/' + name + '.mp3'
    if (!fs.existsSync(filePath)) {
      console.log('File path ' + filePath);
      const spriteUrl = CRIES_HOST_URL + name + '.mp3'
      console.log('Cry URL ' + spriteUrl);
      await download(spriteUrl, filePath)
    }
  }
}

async function download(url, filePath) {
  return new Promise(resolve => {
    const fileStream = fs.createWriteStream(filePath)
    https.get(url, response => {
      response.pipe(fileStream)
      console.log('Downloadeded ' + url)
      response.on('end', () => resolve())
    })
  })
}

