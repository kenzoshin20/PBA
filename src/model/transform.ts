import { BattleEvent } from "./battle-event"
import { Player } from "./player"
import { Pokemon } from "./pokemon"

export function transform(transformUser: Pokemon, transformUserPlayer: Player, transformTarget: Pokemon, battleEvents: BattleEvent[]) {
  transformUser.attack = transformTarget.attack
  transformUser.specialAttack = transformTarget.specialAttack
  transformUser.defense = transformTarget.defense
  transformUser.specialDefense = transformTarget.specialDefense
  transformUser.speed = transformTarget.speed
  transformUser.spriteName = transformTarget.spriteName
  transformUser.moves = transformTarget.moves
  transformUser.stages = transformTarget.stages
  transformUser.types = transformTarget.types
  transformUser.size = transformTarget.size
  transformUser.imgHeight = transformTarget.imgHeight
  transformUser.ability = transformTarget.ability

  battleEvents.push({
    type: 'SOUND_EFFECT',
    fileName: 'status_transform.mp3',
    soundType: 'MOVE'
  })
  battleEvents.push({
    type: 'TRANSFORM',
    newPlayer: transformUserPlayer,
    playerName: transformUserPlayer.name,
    newPokemon: {...transformUser}
  })
  battleEvents.push({
    type: 'DISPLAY_MESSAGE',
    message: `${transformUser.name} transformed into ${transformTarget.name}!`,
    referencedPlayerName: transformUserPlayer.name
  })
}

export function transformIntoBladeForm(transformUser: Pokemon, transformUserPlayer: Player, battleEvents: BattleEvent[]) {
  transformUser.attack += 90
  transformUser.specialAttack += 90
  transformUser.defense -= 90
  transformUser.specialDefense -= 90
  transformUser.spriteName = 'aegislash-blade'
  transformUser.isBladeForm = true

  battleEvents.push({
    type: 'DISPLAY_MESSAGE',
    message: `${transformUser.name} transformed into Blade Form!`,
    referencedPlayerName: transformUserPlayer.name,
    lengthOfPause: 'SHORTER'
  })
  battleEvents.push({
    type: 'SOUND_EFFECT',
    fileName: 'effect_stance_change_blade.mp3',
    soundType: 'MOVE'
  })
  battleEvents.push({
    type: 'TRANSFORM_STANCE_CHANGE',
    form: 'BLADE',
    player: transformUserPlayer,
    newPokemon: {...transformUser}
  })
}

export function transformIntoShieldForm(transformUser: Pokemon, transformUserPlayer: Player, battleEvents: BattleEvent[]) {
  transformUser.attack = transformUser.startingAttack
  transformUser.specialAttack = transformUser.startingSpecialAttack
  transformUser.defense = transformUser.startingDefense
  transformUser.specialDefense = transformUser.startingSpecialDefense
  transformUser.spriteName = transformUser.startingSpriteName
  
  battleEvents.push({
    type: 'DISPLAY_MESSAGE',
    message: `${transformUser.name} transformed into Shield Form!`,
    referencedPlayerName: transformUserPlayer.name,
    lengthOfPause: 'SHORTER'
  })
  battleEvents.push({
    type: 'SOUND_EFFECT',
    fileName: 'effect_stance_change_shield.mp3',
    soundType: 'MOVE'
  })
  battleEvents.push({
    type: 'TRANSFORM_STANCE_CHANGE',
    form: 'SHIELD',
    player: transformUserPlayer,
    newPokemon: {...transformUser}
  })
  transformUser.isBladeForm = false
}