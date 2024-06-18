import { buildPokemon } from "../data/pokemon-data.js";
import { Battle } from "../model/battle.js";
import { Player } from "../model/player.js";
import { DEFAULT_WEATHER } from "../model/weather.js";

export function setupBattle() {
  const player1 = {
    name: 'Player1',
    activePokemonIndex: 0,
    team: [
      buildPokemon('Charizard'),
      buildPokemon('Venusaur'),
      buildPokemon('Pidgeot')
    ]
  } as Player
  const player2 = {
    name: 'Player2',
    activePokemonIndex: 0,
    team: [
      buildPokemon('Blastoise'),
      buildPokemon('Venusaur'),
      buildPokemon('Venusaur')
    ]
  } as Player
  const battle = new Battle({
    battleType: 'MULTI_PLAYER',
    battleSubType: 'CHALLENGE',
    players: [player1, player2],
    weather: DEFAULT_WEATHER,
    remainingWeatherTurns: 0,
    battleState: 'SELECTING_FIRST_POKEMON',
    rewards: [],
    turnCount: 0
  })
  return battle
}