import { BattleEvent } from "./battle-event.js"
import { Player } from "./player.js"
import { modifyStage, Pokemon } from "./pokemon.js"
import { getStageChangeMsg, StageStat, stageStatDisplayTexts } from "./stages.js"


export function handleStageChange(pokemon: Pokemon, player: Player, stageStat: StageStat, numberOfStages: number, battleEvents: BattleEvent[]) {
  if (pokemon.ability?.preventLoweringStats && numberOfStages < 1 && (pokemon.ability.preventLoweringStats.stats.includes(stageStat) || pokemon.ability.preventLoweringStats.stats === 'ANY')) {
    battleEvents.push({
      type: 'DISPLAY_MESSAGE',
      message: `${pokemon.name}'s ${pokemon.ability.name} prevented it from losing ${stageStatDisplayTexts[stageStat]}!`,
      referencedPlayerName: player.name
    })
  } else {
    const actualChange = modifyStage(pokemon, stageStat, numberOfStages)
    const message = getStageChangeMsg(pokemon, stageStat, numberOfStages, actualChange)
    battleEvents.push({
      type: 'DISPLAY_MESSAGE',
      message: message,
      referencedPlayerName: player.name
    })
  }
}