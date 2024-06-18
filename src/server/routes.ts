import { Express, NextFunction, Request, Response, Router } from 'express'
import { PlayerActionEvent } from '../model/battle-event.js'
import { ErrorResponse } from '../model/error-response.js'
import { logDebug, logInfo, logError, configureLogger } from '../util/logger.js'
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { CreateBattleRequest, createMultiPlayerBattle, createRematch, createPracticeBattle as createPracticeBattle, createLeagueBattle, createArenaBattle } from '../model/create-battle.js'
import { getDAO } from '../dao/dao-factory.js'
import { LoginRequest } from '../model/login.js'
import passport from 'passport'
import crypto from 'crypto'
import { DAO } from '../dao/dao.js'
import { validatePassword, validateUsername } from '../model/signup-validation.js'
import { Challenge, ChallengeRequest, createChallenge } from '../model/challenge.js'
import { Battle } from '../model/battle.js';
import { User } from '../model/user.js';
import { Player } from '../model/player.js';
import { defaultUnlockedPokemon } from '../data/default-pokemon-data.js';
import { speciesList } from '../data/pokemon-data.js';
import { allAvatars, avatarList } from '../model/avatar.js';
import { leagueTrainers } from '../model/league.js';

export async function setupRoutes(server: Express, router: Router) {

  const dao = await getDAO()

  router.get('/api/user', async (request: Request, response: Response) => {
    try {
      const user = await getLoggedInUser(request, dao)
      if (user) {
        response.json(user)
      } else {
        sendUnauthenticatedResponse(response)
      }
    } catch (ex) {
      sendErrorResponse(response, ex)
    }
  })

  router.get('/api/users', async (request: Request, response: Response) => {
    try {
      const user = await getLoggedInUser(request, dao)
      if (!user?.isAdmin) {
        sendForbiddenResponse(response) 
      } else {
        const users = await dao.findAllUsers()
        response.json(users)
      }
    } catch (ex) {
      sendErrorResponse(response, ex)
    }
  })

  router.get('/api/user/:userName', async (request: Request, response: Response) => {
    try {
      const userName = request.params.userName
      const user = await dao.findUser(userName)
      if (user) {
        response.json(user)
      } else {
        throw new Error('No user with userName: ' + userName)
      }
    } catch (ex) {
      sendErrorResponse(response, ex)
    }
  })

  router.put('/api/user/:userName', async (request: Request, response: Response) => {
    try {
      logInfo(`PUT user`)
      const userName = request.params.userName
      const user = await getLoggedInUser(request, dao)
      if (user && user.username === userName) {
        const newProperties = request.body
        const newUser = { ...user, ...newProperties }
        await dao.saveUser(newUser)
        response.json(newUser)
      } else {
        throw new Error(`User doesn't exist or update not allowed`)
      }
    } catch (ex) {
      sendErrorResponse(response, ex)
    }
  })

  router.get('/api/battle/:battleId', async (request: Request, response: Response) => {
    try {
      const battleId = request.params.battleId
      const savedBattle = await dao.findBattle(battleId)
      if (savedBattle) {
        response.json(savedBattle)
      } else {
        throw new Error('No battle with battleId: ' + battleId)
      }
    } catch (ex) {
        sendErrorResponse(response, ex)
    }
  })

  router.post('/api/battle/:battleId/action', async (request: Request, response: Response) => {
    try {
      logInfo(`POST battle action ${request.params.battleId}`)
      logDebug(`Body: ${JSON.stringify(request.body)}`)
      if (!isPlayerActionEvent(request.body)) {
        throw new Error('Invalid player action event')
      }
      const playerAction = request.body
      const user = await getLoggedInUser(request, dao)
      if (!user) {
        sendUnauthenticatedResponse(response)
      } else if (user?.username !== playerAction.playerName) {
        sendForbiddenResponse(response)
      } else {
        const battleId = request.params.battleId
        const battle = await dao.findBattle(battleId)
        if (battle) {
          await battle.receivePlayerAction(playerAction)
          if (battle.battleState === 'GAME_OVER') {
            await handleGameOver(dao, battle)
          }
          if (battle.rematchRequested) {
            const rematchBattle = createRematch(battle)
            logInfo(`Created rematch with battleId=${rematchBattle.battleId}`)
            battle.events.push({
              type: 'REMATCH_CREATED',
              newBattleId: rematchBattle.battleId
            })
            await dao.saveBattle(rematchBattle)
          }
          await dao.saveBattle(battle)
          response.json(battle)
        } else {
          throw new Error('Unknown battleId: ' + battleId)
        }
      }
    } catch (ex) {
        sendErrorResponse(response, ex)
    }
  })
  /*
  async function handleGameOver(dao: DAO, battle: Battle) {
    battle.events.push({
      type: 'GAME_OVER',
      winnerName: battle.winnerName as string
    })
    for (const player of battle.players) {
      if (player.type === 'HUMAN') {
        const user = await dao.findUser(player.name)
        if (user) {
          if (battle.battleType === 'SINGLE_PLAYER') {
            if (user.singlePlayerBattleId === battle.battleId) {
              delete user.singlePlayerBattleId
            }
            if (battle.battleSubType === 'LEAGUE' && battle.leagueLevel != null) {
              if (!user.leagueLevel) {
                user.leagueLevel = 0
              }
              if (battle.winnerName === user.username) {
                if (battle.leagueLevel >= user.leagueLevel) {
                  user.leagueLevel++
                  handleRewards(user, battle)
                }
              }
            }
          } else {
            user.multiPlayerBattleIds = user.multiPlayerBattleIds.filter(i => i !== battle.battleId)
          }
          await dao.saveUser(user)
        }
      }
    }
  }
*/
async function handleGameOver(dao: DAO, battle: Battle) {
  battle.events.push({
    type: 'GAME_OVER',
    winnerName: battle.winnerName as string
  });

  for (const player of battle.players) {
    if (player.type === 'HUMAN') {
      const user = await dao.findUser(player.name);
      if (user) {
        if (battle.battleType === 'SINGLE_PLAYER') {
          if (user.singlePlayerBattleId === battle.battleId) {
            delete user.singlePlayerBattleId;
          }
          if (battle.battleSubType === 'LEAGUE' && battle.leagueLevel != null) {
            if (!user.leagueLevel) {
              user.leagueLevel = 0;
            }
            if (battle.winnerName === user.username) {
              if (battle.leagueLevel >= user.leagueLevel) {
                user.leagueLevel++;
                handleRewards(user, battle);
              }
            }
          }
        } else {
          user.multiPlayerBattleIds = user.multiPlayerBattleIds.filter(i => i !== battle.battleId);
          if (battle.winnerName === user.username) {
            user.wins = (user.wins || 0) + 1;
            user.points = (user.points || 0) + 10;  // Example point system
          } else {
            user.losses = (user.losses || 0) + 1;
          }
        }
        await dao.saveUser(user);
      }
    }
  }
}

function handleRewards(user: User, battle: Battle) {
  const newUnlocks = [];
  for (const rewardNumber of battle.rewards) {
    if (!user.unlockedPokemon.includes(rewardNumber)) {
      user.unlockedPokemon.push(rewardNumber);
      newUnlocks.push(rewardNumber);
    }
  }

  if (newUnlocks.length) {
    const isLastPokemon = user.unlockedPokemon.length >= speciesList.length;
    battle.events.push({
      type: 'UNLOCK_POKEMON',
      dexNumbers: newUnlocks,
      isLastPokemon: isLastPokemon,
    });
  }
}
//****edbd
  router.post('/api/battle/end-all', async (request: Request, response: Response) => {
    try {
      logInfo(`POST battle END ALL`)
      const loggedInUser = await getLoggedInUser(request, dao)
      if (loggedInUser?.isAdmin) {
        const users = await dao.findAllUsers()
        for (const user of users) {
          delete user.leagueBattleId 
          delete user.singlePlayerBattleId
          user.multiPlayerBattleIds = []
          dao.saveUser(user)
        }
        await dao.deleteAllBattles()
        response.json({
          "success": true
        })
      } else {
        sendForbiddenResponse(response)
      }
    } catch (ex) {
        sendErrorResponse(response, ex)
    }
  })

  router.post('/api/battle', async (request: Request, response: Response) => {
    try {
      logInfo(`POST battle`)
      logDebug(`Body: ${JSON.stringify(request.body)}`)
      if (!isCreateBattleRequest(request.body)) {
        throw new Error('Invalid create battle request')
      }
      const user = await getLoggedInUser(request, dao)
      if (!user) {
        throw new Error('User does not exist')
      }
      let battle!: Battle
      if (request.body.battleSubType === 'PRACTICE') {
        battle = createPracticeBattle(user)
      } if (request.body.battleSubType === 'ARENA') {
        battle = createArenaBattle(user)
      } else if (request.body.battleSubType === 'LEAGUE') {
        if (request.body.leagueLevel != null) {
          battle = createLeagueBattle(user, request.body.leagueLevel)
        } else {
          throw new Error('Missing data for Arena battle')
        }
      }
      await dao.saveBattle(battle)
      user.singlePlayerBattleId = battle.battleId
      await dao.saveUser(user)
      response.json(battle)
    } catch (ex) {
        sendErrorResponse(response, ex)
    }
  })

  router.post('/api/login', 
    passport.authenticate('local', { failWithError: true }),
    function(req, res, next) {
      logDebug('Login successful');
      res.json({})
    })

  router.post('/api/signup', async (request: any, response: Response, next: NextFunction) => {
    try {
      logInfo(`POST signup`)
      logDebug(`Body: ${JSON.stringify(request.body)}`)

      const usernameValidationResult = validateUsername(request.body.username)
      const passwordValidationResult = validatePassword(request.body.password)
      if (!usernameValidationResult.isValid) {
        throw new Error(usernameValidationResult.errorText)
      } else if (!passwordValidationResult.isValid) {
        throw new Error(passwordValidationResult.errorText)
      }

      const username = request.body.username

      const existingUser = await dao.findUser(username)
      if (existingUser) {
        throw new Error('User already exists')
      }

      for (const avatar of allAvatars) {
        if (avatar.name === username || avatar.desc === username) {
          throw new Error('User already exists')
        }
      }

      for (const leagueTrainer of leagueTrainers) {
        if (leagueTrainer.name === username) {
          throw new Error('User already exists')
        }
      }

      var salt = crypto.randomBytes(16);

      crypto.pbkdf2(request.body.password, salt, 10000, 32, 'sha256', async function(err, hashedPassword) {
        if (err) { 
          return next(err)
        }

        await dao.saveUser({
          username: request.body.username,
          avatar: request.body.avatar,
          multiPlayerBattleIds: [],
          hashed_password: hashedPassword,
          salt: salt,
          unlockedPokemon: defaultUnlockedPokemon,
          settings: {
            music: request.body.music,
            soundEffects: request.body.soundEffects
          }
        })

        var user = {
          username: request.body.username
        }

        request.login(user, function(err: Error) {
          if (err) { return next(err); }
          // response.redirect('/') ;
          response.json({
            
          })
        });

      })
    } catch (ex) {
        sendErrorResponse(response, ex)
    }
  })

  router.get('/logout', (request: Request, response: Response) => {
    request.logout()
    response.redirect('/')
  })

  router.post('/api/challenge', async (request: Request, response: Response) => {
    try {
      logInfo(`POST challenge`)
      const challenger = await getLoggedInUser(request, dao)
      if (challenger) {
        const challenge = createChallenge(challenger.username, challenger.avatar)
        await dao.saveChallenge(challenge)
        response.json(challenge)
      } else {
        sendUnauthenticatedResponse(response)
        return
      }
    } catch (ex) {
      sendErrorResponse(response, ex)
    }
  })

  router.post('/api/challenge/:challengeId/accept', async (request: Request, response: Response) => {
    try {
      logInfo(`POST challenge/accept id=${request.params.challengeId}`)

      const user = await getLoggedInUser(request, dao)
  
      if (!user) {
        sendUnauthenticatedResponse(response)
        return
      }

      const challenge = await acceptChallenge(user, request.params.challengeId)

      response.json(challenge)
      
    } catch (ex) {
      sendErrorResponse(response, ex)
    }
  })

  router.get('/challenge/:challengeId/accept', async (request: Request, response: Response) => {
    try {
      const user = await getLoggedInUser(request, dao)
  
      if (!user) {
        response.redirect(`/signup?from="/challenge/${request.params.challengeId}/accept"`)
        return
      }

      const challenge = await acceptChallenge(user, request.params.challengeId)

      response.redirect(`/battle/${challenge.battleId}`)
      
    } catch (ex) {
      sendErrorResponse(response, ex)
    }
  })

  async function acceptChallenge(user: User, challengeId: string): Promise<Challenge> {
    const challenge = await dao.findChallenge(challengeId)
    if (!challenge) {
      throw new Error('No challenge found with id ' + challengeId)
    }
    if (challenge.state !== 'OPEN') {
      throw new Error('Challenge already accepted')
    }

    const challengerUser = await dao.findUser(challenge.challengerName)
    if (!challengerUser) {
      throw new Error('Challenger not in DB')
    }

    const battle = createMultiPlayerBattle(user, challengerUser)
    await dao.saveBattle(battle)

    user.multiPlayerBattleIds.push(battle.battleId)
    await dao.saveUser(user)
    challengerUser.multiPlayerBattleIds.push(battle.battleId)
    await dao.saveUser(challengerUser)

    challenge.acceptedByName = user.username
    challenge.state = 'ACCEPTED'
    challenge.battleId = battle.battleId
    await dao.saveChallenge(challenge)

    return challenge
  }

  router.get('/api/challenge/:challengeId', async (request: Request, response: Response) => {
    try {
      const challenge = await dao.findChallenge(request.params.challengeId)
      if (challenge) {
        response.json(challenge)
      } else {
        throw new Error('No challenge found with id ' + request.params.challengeId)
      }
    } catch (ex) {
      sendErrorResponse(response, ex)
    }
  })

  // If no API routes are hit, send the front-end app
  router.get('*', (request: Request, response: Response) => {
    let platformAgnosticDirname 
    if (typeof __dirname === "undefined") {
      // @ts-ignore import.meta.url
      platformAgnosticDirname = dirname(fileURLToPath(import.meta.url))
    } else {
      platformAgnosticDirname = path.resolve(__dirname)
    }
    response.sendFile(path.join(platformAgnosticDirname as string, "../../static/index.html"))
  });

  server.use('/', router)
}

function isPlayerActionEvent(requestBody: any): requestBody is PlayerActionEvent {
  return requestBody.type === 'PLAYER_ACTION' && requestBody.playerName && requestBody.details
}

function isCreateBattleRequest(requestBody: any): requestBody is CreateBattleRequest {
  return requestBody.battleType != null
}

async function getLoggedInUser(request: any, dao: DAO) {
  logDebug(`getLoggedInUser() request.user=${request.user?.username}`);
  if (request.user && request.user.username) {
    const user = await dao.findUser(request.user.username)
    return user
  }
}

function sendErrorResponse(response: Response, error: string | Error) {
  if (typeof error === 'string') {
    logError(error)
  } else {
    logError(error.stack) 
  }
  const details = typeof error === 'string' ? error : error + ''
  const errorResponse: ErrorResponse = {
    result: 'ERROR',
    details: details
  }
  response.status(500).json(errorResponse)
}

function sendUnauthenticatedResponse(response: Response) {
  const errorResponse: ErrorResponse = {
    result: 'ERROR',
    details: 'User is not logged in'
  }
  response.status(401).json(errorResponse)
}

function sendForbiddenResponse(response: Response) {
  const errorResponse: ErrorResponse = {
    result: 'ERROR',
    details: 'User is not authorized to perform this action'
  }
  response.status(403).json(errorResponse)
}
/*
function handleRewards(user: User, battle: Battle) {
  const newUnlocks = []
  for (const rewardNumber of battle.rewards) {
    if (!user.unlockedPokemon.includes(rewardNumber)) {
      user.unlockedPokemon.push(rewardNumber)
      newUnlocks.push(rewardNumber)
    }
  }
  
  if (newUnlocks.length) {
    const isLastPokemon = user.unlockedPokemon.length >= speciesList.length
    battle.events.push({
      type: 'UNLOCK_POKEMON',
      dexNumbers: newUnlocks,
      isLastPokemon: isLastPokemon,
    })
  }
}
*/
router.get('/api/leaderboard', async (request: Request, response: Response) => {
  try {
    const users = await dao.findAllUsers();
    users.sort((a, b) => (b.points || 0) - (a.points || 0));  // Sort by points in descending order
    response.json(users.slice(0, 10));  // Return top 10 users
  } catch (ex) {
    sendErrorResponse(response, ex);
  }
});