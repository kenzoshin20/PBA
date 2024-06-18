import { Battle } from "../model/battle";
import { Challenge, ChallengeRequest } from "../model/challenge";
import { User } from "../model/user";

export interface DAO {
  init: () => void
  saveUser: (user: User) => void
  findUser: (userName: string, includeSecrets?: boolean) => Promise<User | undefined>
  findAllUsers: () => Promise<User[]>
  saveBattle: (battle: Battle) => void
  findBattle: (battleId: string) => Promise<Battle | undefined>
  deleteAllBattles: () => Promise<void>
  saveChallenge: (challenge: Challenge) => void
  findChallenge: (challengeId: string) => Promise<Challenge | undefined>
}