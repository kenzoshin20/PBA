import passport from 'passport'
import { Strategy } from 'passport-local'
import crypto from 'crypto'
import { logInfo } from '../util/logger.js';
import { getDAO } from '../dao/dao-factory.js';
import { User } from '../model/user.js';

export function setupAuthentication() {

  logInfo('setupAuthentication()');

  // Configure the local strategy for use by Passport.
  //
  // The local strategy requires a `verify` function which receives the credentials
  // (`username` and `password`) submitted by the user.  The function must verify
  // that the password is correct and then invoke `cb` with a user object, which
  // will be set at `req.user` in route handlers after authentication.
  passport.use(new Strategy(async function(username, password, cb) {

    const dao = await getDAO()

    const dbUser = await dao.findUser(username, true)
    if (dbUser) {
      crypto.pbkdf2(password, dbUser.salt as Buffer, 10000, 32, 'sha256', function(err, hashedPassword) {
        if (err) { return cb(err); }
        if (!crypto.timingSafeEqual(dbUser.hashed_password as NodeJS.ArrayBufferView, hashedPassword)) {
          return cb(null, false, { message: 'Incorrect username or password.' });
        }
        var user: User = {
          username: dbUser.username,
          avatar: dbUser.avatar,
          unlockedPokemon: [],
          multiPlayerBattleIds: []
        };
        return cb(null, user);
      });

    } else {
      logInfo('No user found while authenticating')
      return cb(null, false, { message: 'User does not exist.' });
    }
  }));


  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  The
  // typical implementation of this is as simple as supplying the user ID when
  // serializing, and querying the user record by ID from the database when
  // deserializing.
  passport.serializeUser(function(user: any, cb) {
    process.nextTick(function() {
      cb(null, { username: user.username });
    });
  });

  passport.deserializeUser(function(user: any, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

};