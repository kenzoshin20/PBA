import { NonVolatileStatusCondition } from "../model/status-conditions"
import { getUserSettings } from "./user-settings-controller"

export const miscAudioFiles = [
  'faint.mp3',
  'switch.mp3',
  'click.wav',
]

export const moveAudioFiles = [

  // Damaging moves
  'attack_beam.mp3',
  'attack_blast.mp3',
  'attack_bug.mp3',
  'attack_double_punch.mp3',
  'attack_electric_long.mp3',
  'attack_electric.mp3',
  'attack_explosion.mp3',
  'attack_fire_long.mp3',
  'attack_fire.mp3',
  'attack_generic_long.mp3',
  'attack_generic.mp3',
  'attack_ghost.mp3',
  'attack_grass_long.mp3',
  'attack_ground.mp3',
  'attack_ground_long.mp3',
  'attack_guillotine.mp3',
  'attack_howling_wind.mp3',
  'attack_ice_crash.mp3',
  'attack_ice_shards.mp3',
  'attack_ice.mp3',
  'attack_jolt.mp3',
  'attack_pre_explosion.mp3',
  'attack_psychic_special.mp3',
  'attack_rapid_spin.mp3',
  'attack_ripple.mp3',
  'attack_rock.mp3',
  'attack_sand.mp3',
  'attack_scratch.mp3',
  'attack_slap.mp3',
  'attack_slash_special.mp3',
  'attack_slash.mp3',
  'attack_water_long_crash.mp3',
  'attack_water_long.mp3',
  'attack_water.mp3',
  'attack_precipice_blades.mp3',
  'attack_dragon_pulse.mp3',
  'attack_flamethrower.mp3',

  // Status moves
  'status_asleep.mp3',
  'status_buff.mp3',
  'status_burned.mp3',
  'status_confused.mp3',
  'status_copycat.mp3',
  'status_debuff.mp3',
  'status_entry_hazard.mp3',
  'status_frozen.mp3',
  'status_heal.mp3',
  'status_leech_seed.mp3',
  'status_metronome.mp3',
  'status_mirror_move.mp3',
  'status_paralyzed.mp3',
  'status_poisoned.mp3',
  'status_protect.mp3',
  'status_reflect.mp3',
  'status_shell_smash.mp3',
  'status_stealth_rock.mp3',
  'status_swords_dance.mp3',
  'status_transform.mp3',
  'status_belly_drum.mp3',
  'status_confuse_ray.mp3',

  // Effects
  'effect_heal.mp3',
  'effect_stance_change_shield.mp3',
  'effect_stance_change_blade.mp3',
]

export const audioFiles = [
  ...miscAudioFiles,
  ...moveAudioFiles,
] as const

export type MoveAudioFile = typeof moveAudioFiles[number]



export const AUDIO_FOLDER = 'audio'

const musicAudio = new Audio()
musicAudio.volume = .05
musicAudio.loop = true
musicAudio.src = `/${AUDIO_FOLDER}/music/battle.mp3`

const moveAudio = new Audio()
moveAudio.volume = .2

const effectAudio = new Audio()
effectAudio.volume = .2

const cryAudio = new Audio()
cryAudio.volume = .05

// const clickAudio = new Audio()
// clickAudio.volume = .05

const switchAndFaintAudio = new Audio()
switchAndFaintAudio.volume = .075

export function playMoveSound(fileName: string) {
  if (getUserSettings().soundEffects) {
    moveAudio.src = `/${AUDIO_FOLDER}/moves/${fileName}`
    moveAudio.play()
  }
}

export function playEffectSound(fileName: string) {
  if (getUserSettings().soundEffects) {
    effectAudio.src = `/${AUDIO_FOLDER}/moves/${fileName}`
    effectAudio.play()
  }
}

export function playStatusSound(status: NonVolatileStatusCondition) {
  if (getUserSettings().soundEffects) {
    const statusSounds: Record<NonVolatileStatusCondition, string> = {
      'BURNED': 'status_burned.mp3',
      'ASLEEP': 'status_asleep.mp3',
      'FROZEN': 'status_frozen.mp3',
      'PARALYZED': 'status_paralyzed.mp3',
      'POISONED': 'status_poisoned.mp3',
      'BADLY POISONED': 'status_poisoned.mp3',
    }
    effectAudio.src = `/${AUDIO_FOLDER}/moves/${statusSounds[status]}`
    effectAudio.play()
  }
}

export function playCry(fileName: string) {
  if (getUserSettings().soundEffects) {
    cryAudio.src = `/${AUDIO_FOLDER}/${fileName}`
    cryAudio.play()
  }
}

export function playMusic(fileName: string) {
  if (getUserSettings().music) {
    musicAudio.muted = false
    musicAudio.src = `/${AUDIO_FOLDER}/music/${fileName}`
    musicAudio.play()
  }
}

export function stopMusic() {
  if (getUserSettings().music) {
    musicAudio.muted = true
  }
}

export function playClickSound() {
  // if (getUserSettings().soundEffects) {
  //   clickAudio.src = `/${AUDIO_FOLDER}/click.wav`
  //   clickAudio.play()
  // }
}

export function playFaintSound() {
  if (getUserSettings().soundEffects) {
    switchAndFaintAudio.src = `/${AUDIO_FOLDER}/faint.mp3`
    switchAndFaintAudio.play()
  }
}

export function playSwitchSound() {
  if (getUserSettings().soundEffects) {
    switchAndFaintAudio.src = `/${AUDIO_FOLDER}/switch.mp3`
    switchAndFaintAudio.play()
  }
}
