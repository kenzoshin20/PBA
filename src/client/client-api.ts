import { Battle } from "../model/battle"
import { PlayerActionEvent } from "../model/battle-event"
import { Challenge, ChallengeRequest } from "../model/challenge"
import { CreateBattleRequest } from "../model/create-battle"
import { LoginRequest } from "../model/login"
import { Player } from "../model/player"
import { SignupRequest } from "../model/signup"
import { User } from "../model/user"
import { logError } from "../util/logger"
import { saveUserSettings } from "./user-settings-controller"

const API_URL = '/api'

let cachedUserName: string | null = null

export async function getBattle(battleId: string): Promise<Battle> {
  const response = await fetch(`${API_URL}/battle/${battleId}`)
  const data = await response.json()
  if (data.result === 'ERROR') {
    throw new Error(data.details)
  }
  return data
}

export async function postPlayerAction(battleId: string, playerActionEvent: PlayerActionEvent): Promise<Battle> {
  const response = await fetch(`${API_URL}/battle/${battleId}/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(playerActionEvent)
  })
  const data = await response.json()
  if (data.result === 'ERROR') {
    if (response.status === 401) {
      redirectToLogin()
    }
    throw new Error(data.details)
  }
  return data
}

export async function getUser(): Promise<User> {
  const response = await fetch(`${API_URL}/user`)
  const data = await response.json()
  if (data.result === 'ERROR') {
    if (response.status === 401) {
      redirectToLogin()
    }
    throw new Error(data.details)
  }
  cachedUserName = data.username
  saveUserSettings({
    music: data.settings?.music,
    soundEffects: data.settings?.soundEffects
  })
  return data
}

export async function tryToGetExistingUser(username: string): Promise<User | undefined> {
  const response = await fetch(`${API_URL}/user/${username}`)
  const data = await response.json()
  if (data.result !== 'ERROR') {
    return data
  }
}

export async function tryToGetUser(): Promise<User | undefined> {
  const response = await fetch(`${API_URL}/user`)
  const data = await response.json()
  if (data.result !== 'ERROR') {
    return data
  }
}

export function setUserName(userName: string) {
  cachedUserName = userName
}

export function getUserName() {
  if (!cachedUserName) {
    throw new Error('No cached username. Make sure getUser() is called first.')
  }
  return cachedUserName
}

export function getPlayers(battle: Battle): {
  user: Player
  enemy: Player
} {
  const userName = getUserName()
  const userPlayer = battle.players.find(p => p.name === userName)
  const enemyPlayer = battle.players.find(p => p.name !== userName)
  if (userPlayer && enemyPlayer) {
    return {
      user: userPlayer,
      enemy: enemyPlayer
    }
  } else {
    clientError(`Unable to find players inside battle`)
    throw new Error()
  }
}

export async function postBattle(createBattleRequest: CreateBattleRequest): Promise<Battle> {
  const response = await fetch(`${API_URL}/battle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createBattleRequest)
  })
  const data = await response.json()
  if (data.result === 'ERROR') {
    if (response.status === 401) {
      redirectToLogin()
    }
    throw new Error(data.details)
  }
  return data
}

export async function postSignupRequest(signupRequest: SignupRequest) {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(signupRequest)
  })
  const data = await response.json()
  if (data.result === 'ERROR') {
    throw new Error(data.details)
  }
  return data
}

export async function postLoginRequest(loginRequest: LoginRequest) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginRequest)
  })
  if (response.status === 401) {
    clientError('Invalid login credentials')
    throw new Error()
  }
  const data = await response.json()
  if (data.result === 'ERROR') {
    throw new Error(data.details)
  }
  return data
}

export async function postChallengeRequest(): Promise<Challenge> {
  const response = await fetch(`${API_URL}/challenge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const data = await response.json()
  if (data.result === 'ERROR') {
    if (response.status === 401) {
      redirectToLogin()
    }
    throw new Error(data.details)
  }
  return data
}

export async function postChallengeAccept(challengeId: string): Promise<Challenge> {
  const response = await fetch(`${API_URL}/challenge/${challengeId}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const data = await response.json()
  if (data.result === 'ERROR') {
    if (response.status === 401) {
      redirectToLogin(`/challenge/${challengeId}/accept`)
    }
    throw new Error(data.details)
  }
  return data
}

export async function getChallenge(challengeId: string): Promise<Challenge> {
  const response = await fetch(`${API_URL}/challenge/${challengeId}`)
  const data = await response.json()
  if (data.result === 'ERROR') {
    throw new Error(data.details)
  }
  return data
}

export async function putUser(username: string, newUserData: Partial<User>) {
  const response = await fetch(`${API_URL}/user/${username}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newUserData)
  })
  const data = await response.json()
  if (data.result === 'ERROR') {
    throw new Error(data.details)
  }
  return data
}

export function clientError(message: string) {
  logError(message)
  alert(message)
}
//new
export async function getLeaderboard() {
  const response = await fetch('/api/leaderboard');
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  return await response.json();
}


function redirectToLogin(postLoginRedirect?: string) {
  const fromParam = postLoginRedirect ? postLoginRedirect : window.location.pathname
  window.location.href = '/login?from=' + fromParam
}