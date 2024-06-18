import crypto from 'crypto'

export interface ChallengeRequest {
  challengerName: string
}

export interface Challenge {
  acceptedByName?: string
  state: 'OPEN' | 'ACCEPTED'
  challengerName: string
  challengerAvatar: string
  challengeId: string
  battleId?: string
}

export function createChallenge(challengerName: string, challengerSprite: string): Challenge {
  return {
    state: 'OPEN',
    challengeId: crypto.randomBytes(3).toString('hex'),
    challengerName: challengerName,
    challengerAvatar: challengerSprite,
  }
}