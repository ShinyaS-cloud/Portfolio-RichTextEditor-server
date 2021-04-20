import 'reflect-metadata'
// import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { createConnection, getConnection, getRepository } from 'typeorm'
import session from 'express-session'
import * as expressSession from 'express-session'
import { useExpressServer } from 'routing-controllers'

import csrf from 'csurf'
import bcrypt from 'bcrypt'
import Google from 'passport-google-oauth20'
import Local from 'passport-local'
import { keys } from './config/keys'
import { AuthUser, User } from './entity/Index'
import { UserController } from './controllers/userController'
import { ArticleController } from './controllers/articleController'
import { MyMiddleware } from './middlewares/MyMiddleware'

import cors from 'cors'
import mysqlFunc from 'express-mysql-session'
const MysqlDBStore = mysqlFunc(expressSession)

// interface Error {
//   status?: number
//   message?: string
// }
const app = express()
const secret = 'fherafhukfsrhgbnsgukrvbkakrekgfk'
const csrfProtection = csrf({ cookie: true })
app.use(cors({ credentials: true, origin: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.set('trust proxy', true)

app.use(csrfProtection)

createConnection()
  .then(async () => {
    const ormConnection: any = getConnection().driver
    const store = new MysqlDBStore({}, ormConnection.pool)
    const authUserRepository = getRepository(AuthUser)
    const userRepository = getRepository(User)
    // const EntityManager = getManager()

    const GoogleStrategy = Google.Strategy
    const LocalStrategy = Local.Strategy

    app.use(
      session({
        secret: secret,
        resave: false,
        saveUninitialized: false,
        store: store,
        proxy: true,
        cookie: {
          secure: true,
          maxAge: 1000 * 60 * 60 * 24 * 30
        }
      })
    )

    // passportとセッションの紐づけ
    // ユーザーデータからユニークユーザー識別子を取り出す
    passport.serializeUser((user, done) => {
      done(null, user)
    })

    // ユニークユーザー識別子からユーザーデータを取り出す
    passport.deserializeUser(async (serializeUser: AuthUser, done) => {
      try {
        const user = await authUserRepository.findOne({ where: { id: serializeUser.id } })
        done(null, user)
      } catch (error) {
        console.log(error)
      }
    })
    // passportとStrategyの紐づけ

    passport.use(
      new GoogleStrategy(
        {
          clientID: keys.googleClientId,
          clientSecret: keys.googleClientSecret,
          callbackURL: '/auth/google/callback',
          proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const existingUser = await authUserRepository.findOne({
              where: { googleId: profile.id }
            })
            if (existingUser !== undefined) {
              console.log('we already have a record with the given profile ID')
              return done(undefined, existingUser)
            } else {
              console.log('We dont have a recode with this ID,make a new record!')
              const newAuthUser = new AuthUser()
              newAuthUser.googleId = profile.id
              const doneAuthUser = await authUserRepository.save(newAuthUser)
              const newUser = new User()
              newUser.authUser = newAuthUser
              newUser.codename = '' + doneAuthUser.id
              await userRepository.save(newUser)
              return done(undefined, newAuthUser)
            }
          } catch (error) {
            console.log(error)
          }
        }
      )
    )

    passport.use(
      new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
          try {
            const existingUser = await authUserRepository.findOne({ where: { email } })
            if (!existingUser || !existingUser.password) {
              return done(null, false)
            }
            if (!bcrypt.compareSync(password, existingUser.password)) {
              return done(null, false)
            }
            return done(null, existingUser)
          } catch (error) {
            console.log('LocalERROR', error)
            done(error)
          }
        }
      )
    )

    app.use(passport.initialize())
    app.use(passport.session())

    useExpressServer(app, {
      controllers: [UserController, ArticleController],
      middlewares: [MyMiddleware]
    })

    app.post(
      '/api/login',
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        passport.authenticate('local', (err, user, info) => {
          if (err) {
            return next(err)
          }
          if (!user) {
            return res.send(info)
          }
          req.logIn(user, (err) => {
            if (err) {
              return next(err)
            }
            return res.send('OK')
          })
        })(req, res, next)
      }
    )

    const PORT = process.env.PORT || 8080
    app.listen(PORT)
  })
  .catch((error) => console.log('Data Access Error : ', error))
