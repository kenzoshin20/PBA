import { buildPokemon } from "../data/pokemon-data.js";
import { Random } from "../util/random.js";
import { LeagueTrainer, leagueTrainers } from "./league.js";
import { avatarList, npcOnlyAvatarList } from "./avatar.js";
import { Battle, BattleSubType, BattleType } from "./battle.js";
import { Player } from "./player.js";
import { Pokemon } from "./pokemon.js";
import { addPreviousArenaTrainer, User } from "./user.js";
import { DEFAULT_WEATHER } from "./weather.js"
import { arenaTrainers, getRandomArenaTrainer } from "./arena.js";

export interface CreateBattleRequest {
  battleType: BattleType
  battleSubType: BattleSubType
  leagueLevel?: number
}

export function createMultiPlayerBattle(user1: User, user2: User) {

  const user1Player: Player = {
    name: user1.username,
    avatar: user1.avatar,
    type: 'HUMAN',
    activePokemonIndex: 0,
    team: [],
    spikeLayerCount: 0,
    toxicSpikeLayerCount: 0,
    remainingLightScreenTurns: 0,
    remainingReflectTurns: 0,
  }

  const user2Player: Player = {
    name: user2.username,
    avatar: user2.avatar,
    type: 'HUMAN',
    activePokemonIndex: 0,
    team: [],
    spikeLayerCount: 0,
    toxicSpikeLayerCount: 0,
    remainingLightScreenTurns: 0,
    remainingReflectTurns: 0,
  }

  const players = [user1Player, user2Player]

  return new Battle({
    players: players,
    weather: DEFAULT_WEATHER,
    remainingWeatherTurns: 0,
    battleType: 'MULTI_PLAYER',
    battleSubType: 'LEAGUE',
    rewards: [],
    turnCount: 0
  })

}

export function createRematch(battle: Battle): Battle {
  if (battle.battleType === 'SINGLE_PLAYER') {
    const humanPlayer = battle.players.find(p => p.type === 'HUMAN') 
    if (!humanPlayer) {
      throw new Error('Unable to find user player')
    }
    const user = {
      username: humanPlayer.name,
      avatar: humanPlayer.avatar,
    } as User
    if (battle.battleSubType === 'LEAGUE' && battle.leagueLevel != null) {
      return createLeagueBattle(user, battle.leagueLevel)
    } else if (battle.battleSubType === 'ARENA') {
      return createArenaBattle(user)
    } else {
      return createPracticeBattle(user)
    }
  } else {
    const user1 = {
      username: battle.players[0].name,
      avatar: battle.players[0].avatar,
    } as User
    const user2 = {
      username: battle.players[1].name,
      avatar: battle.players[1].avatar,
    } as User
    return createMultiPlayerBattle(user1, user2)
  }
}

export function createPracticeBattle(user: User): Battle {

  const userPlayer: Player = {
    name: user.username,
    avatar: user.avatar,
    type: 'HUMAN',
    activePokemonIndex: 0,
    team: [],
    spikeLayerCount: 0,
    toxicSpikeLayerCount: 0,
    remainingLightScreenTurns: 0,
    remainingReflectTurns: 0,
  }

  const enemyAvatar = new Random().randomPick(avatarList.concat(npcOnlyAvatarList))

  const cpuPlayer: Player = {
    name: enemyAvatar.name ? enemyAvatar.name : enemyAvatar.desc,
    avatar: enemyAvatar.file,
    type: 'COMPUTER',
    activePokemonIndex: 0,
    team: [],
    spikeLayerCount: 0,
    toxicSpikeLayerCount: 0,
    remainingLightScreenTurns: 0,
    remainingReflectTurns: 0,
  }

  const players = [userPlayer, cpuPlayer]

  return new Battle({
    players: players,
    weather: DEFAULT_WEATHER,
    remainingWeatherTurns: 0,
    battleType: 'SINGLE_PLAYER',
    battleSubType: 'PRACTICE',
    rewards: [],
    turnCount: 0
  })
}

export function createArenaBattle(user: User): Battle {

  const userPlayer: Player = {
    name: user.username,
    avatar: user.avatar,
    type: 'HUMAN',
    activePokemonIndex: 0,
    team: [],
    spikeLayerCount: 0,
    toxicSpikeLayerCount: 0,
    remainingLightScreenTurns: 0,
    remainingReflectTurns: 0,
  }

  const arenaTrainer = getRandomArenaTrainer(user.previousArenaTrainers, user.leagueLevel, user.isAdmin)
  addPreviousArenaTrainer(user, arenaTrainer.name)

  const cpuPlayer: Player = {
    name: arenaTrainer.name,
    avatar: arenaTrainer.avatar,
    type: 'COMPUTER',
    activePokemonIndex: 0,
    team: [],
    spikeLayerCount: 0,
    toxicSpikeLayerCount: 0,
    remainingLightScreenTurns: 0,
    remainingReflectTurns: 0,
  }

  const players = [userPlayer, cpuPlayer]

  return new Battle({
    players: players,
    weather: DEFAULT_WEATHER,
    remainingWeatherTurns: 0,
    battleType: 'SINGLE_PLAYER',
    battleSubType: 'ARENA',
    rewards: [],
    turnCount: 0
  })
}

export function createLeagueBattle(user: User, leagueLevel: number) {
  const leagueTrainer = leagueTrainers[leagueLevel]
  const userPlayer: Player = {
    name: user.username,
    avatar: user.avatar,
    type: 'HUMAN',
    activePokemonIndex: 0,
    team: [],
    spikeLayerCount: 0,
    toxicSpikeLayerCount: 0,
    remainingLightScreenTurns: 0,
    remainingReflectTurns: 0,
  }
  const cpuPlayer: Player = {
    name: leagueTrainer.name,
    avatar: leagueTrainer.avatar,
    type: 'COMPUTER',
    activePokemonIndex: 0,
    team: [],
    spikeLayerCount: 0,
    toxicSpikeLayerCount: 0,
    remainingLightScreenTurns: 0,
    remainingReflectTurns: 0,
  }
  const players = [userPlayer, cpuPlayer]

  return new Battle({
    players: players,
    weather: DEFAULT_WEATHER,
    remainingWeatherTurns: 0,
    battleType: 'SINGLE_PLAYER',
    battleSubType: 'LEAGUE',
    leagueLevel: leagueLevel,
    rewards: leagueTrainer.rewards,
    turnCount: 0
  })
}