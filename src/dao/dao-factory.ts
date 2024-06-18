import { logInfo } from "../util/logger.js";
import { DAO } from "./dao.js";
import { PostgresDAO } from "./postgres-dao.js";

const PERSISTANCE_TYPE = process.env.PERSISTANCE_TYPE || 'POSTGRES'

let dao: DAO | null = null

export async function getDAO() {
  if (!dao) {
    dao = buildDAO()
    await dao.init()
  }
  return dao
}

function buildDAO() {
  if (PERSISTANCE_TYPE === 'POSTGRES') {
    logInfo('Creating Postgres DAO')
    return new PostgresDAO()
  } else {
    logInfo('Defaulting to Postgres DAO')
    return new PostgresDAO()
  }
}