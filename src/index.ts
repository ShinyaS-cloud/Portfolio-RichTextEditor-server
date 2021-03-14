import 'reflect-metadata'
// import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { createConnection, getConnection, getManager, getRepository } from 'typeorm'
import session from 'express-session'
import { useExpressServer } from 'routing-controllers'
import bcrypt from 'bcrypt'
import flash from 'connect-flash'

import Google from 'passport-google-oauth20'
import { keys } from '../config/keys'
import { Users } from './entity/Users'
import { UserController } from './controllers/userController'
import { PostController } from './controllers/postController'
const MysqlDBStore = require('express-mysql-session')(session)

// interface Error {
//   status?: number
//   message?: string
// }
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

createConnection()
  .then(async () => {
    const ormConnection: any = getConnection().driver
    const store = new MysqlDBStore({}, ormConnection.pool)
    const userRepositry = getRepository(Users)
    const EntityManager = getManager()

    const GoogleStrategy = Google.Strategy

    app.use(
      session({
        secret: 'falerjfaerargfaaerhgaejfafaafrega',
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
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
    passport.deserializeUser(async (serializeUser: Users, done) => {
      try {
        const user = await userRepositry.findOne({ where: { id: serializeUser.id } })
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
            const existingUser = await userRepositry.findOne({ where: { googleId: profile.id } })
            if (existingUser !== undefined) {
              console.log('we already have a record with the given profile ID')
              done(undefined, existingUser)
            } else {
              console.log('We dont have a recode with this ID,make a new record!')
              const user = new Users()
              user.googleId = profile.id
              user.loginGoogle = true
              await userRepositry.save(user)
              done(undefined, user)
            }
          } catch (error) {
            console.log(error)
          }
        }
      )
    )

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())
    useExpressServer(app, {
      controllers: [UserController, PostController],
      authorizationChecker: async (action, roles: string[]) => {
        action.response.locals.isAuthenticated = action.request.session.isLoggedIn
        action.response.locals.csrfToken = action.request.csrfToken()
        const isAuthed = action.response.locals.isAuthenticated
        const isCsrf = action.response.locals.csrfToken
        let message = action.request.flash('error')
        if (message.length > 0) {
          message = message[0]
        } else {
          message = null
        }
        action.response.locals.errorMessage = message
        return isAuthed && isCsrf
      }
    })

    const userfind = async () => {
      try {
        return await userRepositry.findOne(1)
      } catch (err) {
        console.log('ERROR REPOSITRY')
      }
    }

    const userCreate = async (user: any) => {
      try {
        if (!user) {
          const password = await bcrypt.hash('Max', 12)
          const update = new Users()
          update.password = password
          update.email = 'test@test.com'
          update.loginGoogle = false
          await EntityManager.save(update)
        }
        return await userRepositry.findOne(1)
      } catch (err) {
        console.log(err)
      }
    }
    const user = await userfind()
    await userCreate(user)

    // app.get('/', function (req, res) {
    //   console.log(1)
    //   res.send('ok')
    // })

    // // catch 404 and forward to error handler
    // app.use((req, res, next) => {
    //   next(createError(404))
    // })

    // // error handler
    // app.use(
    //   (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    //     // set locals, only providing error in development
    //     res.locals.message = err.message
    //     res.locals.error = req.app.get('env') === 'development' ? err : {}

    //     // render the error page
    //     res.status(err.status || 500)
    //     // res.json('error')
    //   }
    // )

    const PORT = process.env.PORT || 5000
    app.listen(PORT)
  })
  .catch((error) => console.log('Data Access Error : ', error))
