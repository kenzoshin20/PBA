import { Battle } from "../model/battle.js";
import { User } from "../model/user.js";
import { DAO } from "./dao.js";
import Postgres from "pg"
import { logDAO } from "../util/logger.js";
import { Challenge } from "../model/challenge.js";
import { defaultUnlockedPokemon } from "../data/default-pokemon-data.js";

const connectionString = process.env.DATABASE_URL
const useSSL = 'false' !== process.env.DATABASE_USE_SSL?.toLowerCase()
const clean = 'true' === process.env.CLEAN_DB?.toLowerCase()

const poolConfig: Postgres.PoolConfig = {
  connectionString
}

if (useSSL) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  }
}

const pool = new Postgres.Pool(poolConfig)

export class PostgresDAO implements DAO {

  async init() {
    logDAO('PostgreSQL init()')
    if (clean) {
      logDAO('Cleaning database')
      await pool.query(`
        DROP SCHEMA IF EXISTS pmba CASCADE
      `)
    }
    await pool.query(`
      CREATE SCHEMA IF NOT EXISTS pmba
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pmba.user (
        username varchar PRIMARY KEY,
        hashed_password bytea,
        salt bytea,
        json varchar,
        wins integer DEFAULT 0,
        losses integer DEFAULT 0,
        points integer DEFAULT 0
      )
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pmba.battle (
        battle_id varchar PRIMARY KEY,
        json varchar
      )
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pmba.challenge (
        challenge_id varchar PRIMARY KEY,
        json varchar
      )
    `)
    if (clean) {
      // logDAO('Creating test user')
      // await this.saveUser({
      //   username: 'Ash',
      //   password: 'password'
      // })
    }
    logDAO('Database schema and tables initialized')
  }

  async saveUser(user: User) {
    logDAO(user);
    const userWithoutSecrets: User = {
      username: user.username,
      avatar: user.avatar,
      singlePlayerBattleId: user.singlePlayerBattleId,
      multiPlayerBattleIds: user.multiPlayerBattleIds,
      leagueLevel: user.leagueLevel,
      unlockedPokemon: user.unlockedPokemon,
      isAdmin: user.isAdmin,
      settings: user.settings,
      previousArenaTrainers: user.previousArenaTrainers,
      wins: user.wins,
      losses: user.losses,
      points: user.points
    };
    const userJson = JSON.stringify(userWithoutSecrets);
    logDAO(`PostgreSQL saveUser() user=${userJson}`);
    if (!user.username) {
      throw new Error('username is required');
    }
    await pool.query(`
      INSERT INTO pmba.user
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username)
      DO UPDATE SET json=$4, wins=$5, losses=$6, points=$7
    `, [
      user.username,
      user.hashed_password,
      user.salt,
      userJson,
      user.wins,
      user.losses,
      user.points
    ]);
  }

  async findUser(username: string, includeSecrets: boolean = false) {
    logDAO(`PostgreSQL findUser() username=${username}`);
    if (!username) {
      throw new Error('Username is null');
    }
    const res = await pool.query(`
      SELECT json, salt, hashed_password, wins, losses, points
      FROM pmba.user
      WHERE upper(username) = $1
    `, [
      username.toUpperCase()
    ]);
    if (res.rowCount > 0) {
      const row = res.rows[0];
      const user: User = JSON.parse(row.json);
      if (!user.unlockedPokemon?.length) {
        user.unlockedPokemon = defaultUnlockedPokemon;
      }
      user.wins = row.wins;
      user.losses = row.losses;
      user.points = row.points;
      if (includeSecrets) {
        user.salt = row.salt;
        user.hashed_password = row.hashed_password;
      }
      return user;
    } else {
      logDAO('No user found with username ' + username);
    }
  }

  async findAllUsers(): Promise<User[]> {
    logDAO(`Find PostgreSQL findAllUsers()`);
    const res = await pool.query(`
      SELECT json
      FROM pmba.user
    `);
    return res.rows.map(row => {
      const user: User = JSON.parse(row.json);
      user.wins = row.wins;
      user.losses = row.losses;
      user.points = row.points;
      return user;
    });
  }

  async saveBattle(battle: Battle) {
    const battleJson = JSON.stringify(battle.getData());
    logDAO(`PostgreSQL saveBattle() battleId=${battle.battleId}`);
    if (!battle.battleId) {
      throw new Error('battleId is required');
    }

    await pool.query(`
      INSERT INTO pmba.battle
      VALUES ($1, $2)
      ON CONFLICT (battle_id)
      DO UPDATE SET json=$2
    `, [
      battle.battleId,
      battleJson
    ]);
  }

  async findBattle(battleId: string): Promise<Battle | undefined> {
    logDAO(`PostgreSQL findBattle() battleId=${battleId}`);
    const res = await pool.query(`
      SELECT json
      FROM pmba.battle
      WHERE battle_id = $1
    `, [
      battleId
    ]);
    if (res.rowCount > 0) {
      const row = res.rows[0];
      const data = JSON.parse(row.json);
      return new Battle(data);
    } else {
      logDAO('No battle found with battleId ' + battleId);
    }
  }

  async deleteAllBattles() {
    await pool.query(`
      DELETE
      FROM pmba.battle
    `);
  }

  async saveChallenge(challenge: Challenge) {
    logDAO(`PostgreSQL saveChallenge() challengeId=${challenge.challengeId}`);
    const challengeJson = JSON.stringify(challenge);
    await pool.query(`
      INSERT INTO pmba.challenge
      VALUES ($1, $2)
      ON CONFLICT (challenge_id)
      DO UPDATE SET json=$2
    `, [
      challenge.challengeId,
      challengeJson
    ]);
  }

  async findChallenge(challengeId: string) {
    logDAO(`PostgreSQL findChallenge() challengeId=${challengeId}`);
    const res = await pool.query(`
      SELECT json
      FROM pmba.challenge
      WHERE challenge_id = $1
    `, [
      challengeId
    ]);
    if (res.rowCount > 0) {
      const row = res.rows[0];
      const challenge = JSON.parse(row.json);
      return challenge;
    } else {
      logDAO('No challenge found with challengeId ' + challengeId);
    }
  }
}