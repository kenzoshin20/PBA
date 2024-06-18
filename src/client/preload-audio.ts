import { speciesList } from "../data/pokemon-data";
import { getCry, Pokemon } from "../model/pokemon";
import { logInfo } from "../util/logger";
import { moveAudioFiles, miscAudioFiles, AUDIO_FOLDER } from "./audio";

export function preloadAudio() {
  var audio = new Audio()
  const startTime = performance.now()
  for (const file of miscAudioFiles) {
    audio.src = `/${AUDIO_FOLDER}/${file}`
  }
  const miscTime = performance.now() - startTime
  logInfo(`Cached misc audio in ${miscTime} millis`)
  for (const file of moveAudioFiles) {
    audio.src = `/${AUDIO_FOLDER}/moves/${file}`
  }
  const movesTime = performance.now() - miscTime
  logInfo(`Cached move audio in ${movesTime} millis`)
  for (const pokemon of speciesList) {
    const cry = getCry(pokemon as any)
    audio.src = `/${AUDIO_FOLDER}/${cry}`
  }
  const cryTime = performance.now() - movesTime
  logInfo(`Cached cry audio in ${cryTime} millis`)
}