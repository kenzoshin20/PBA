export interface User {
  username: string
  avatar: string
  singlePlayerBattleId?: string
  leagueBattleId?: string
  multiPlayerBattleIds: string[]
  password?: string
  salt?: Buffer
  hashed_password?: NodeJS.ArrayBufferView
  settings?: UserSettings
  unlockedPokemon: number[]
  leagueLevel?: number
  isAdmin?: boolean
  previousArenaTrainers?: string[]
  wins?: number        // New field for wins
  losses?: number      // New field for losses
  points?: number      // New field for points
}

export interface UserSettings {
  soundEffects?: boolean,
  music?: boolean
}

export function addPreviousArenaTrainer(user: User, arenaTrainerName: string) {
  if (!user.previousArenaTrainers) {
    user.previousArenaTrainers = []
  }
  if (user.previousArenaTrainers.length >= 7) {
    user.previousArenaTrainers.shift()
  }
  user.previousArenaTrainers.push(arenaTrainerName)
}