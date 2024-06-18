// Should always be imported first
import './env.js'

import express from 'express'
import { configureLogger, logInfo } from '../util/logger.js'
import { setupRoutes } from './routes.js'
import passport from 'passport'
import { setupAuthentication } from './auth.js'
import expressSession from 'express-session'

configureLogger({ enabled: true })

const PORT = process.env.PORT || 10000
const CODE_CACHE_LENGTH = process.env.CODE_CACHE_LENGTH || '3m'
const SESSION_SECRET = process.env.SESSION_SECRET || 'pikachu'
 
const server = express()

server.use(express.urlencoded({ extended: true }))
server.use(express.json())

// Passport config
server.use(expressSession({ 
  secret: SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false,
  cookie: {
    maxAge: 1_000 * 60 * 60 * 500 // 500 hours 
  }
}));
server.use(function(req: any, res, next) {
  const msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});
server.use(passport.initialize())
server.use(passport.authenticate('session'))

// Static assets such as images
server.use(express.static('assets/', {
  maxAge: '1d',
  immutable: true
}))

// Static code such as JS and CSS
if (CODE_CACHE_LENGTH !== '0') {
  server.use(express.static('static/', {
    maxAge: CODE_CACHE_LENGTH,
    immutable: true
  }))
} else {
  server.use(express.static('static/'))
}

setupRoutes(server, express.Router())
setupAuthentication()

server.listen(PORT, async () => {
  logInfo(`\n`)
  logInfo(`Server started: http://localhost:${PORT}`)
})
