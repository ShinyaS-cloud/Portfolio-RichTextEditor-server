import 'reflect-metadata'
// import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { createConnection, getConnection, getRepository } from 'typeorm'
import session from 'express-session'
import { useExpressServer } from 'routing-controllers'

import csrf from 'csurf'
import bcrypt from 'bcrypt'
import Google from 'passport-google-oauth20'
import Local from 'passport-local'
import { keys } from '../config/keys'
import { AuthUser } from './entity/AuthUser'
import { UserController } from './controllers/userController'
import { ArticleController } from './controllers/articleController'
import { MyMiddleware } from './middlewares/MyMiddleware'
const MysqlDBStore = require('express-mysql-session')(session)
// import aws from 'aws-sdk'
// const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY
// const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY
// const BUCKET = process.env.BUCKET

// aws.config.update({
//   accessKeyId: AWS_ACCESS_KEY,
//   secretAccessKey: AWS_SECRET_KEY
// })
// const upload = (file: any) => {
//   const s3 = new aws.S3()
//   const params = {
//     Bucket: BUCKET,
//     Key: file.filename,
//     Expires: 60,
//     ContentType: file.filetype
//   }

//   return new Promise((resolve, reject) => {
//     s3.getSignedUrl('putObject', params, (err: any, url: any) => {
//       if (err) {
//         reject(err)
//       }
//       resolve(url)
//     })
//   })
// }

// interface Error {
//   status?: number
//   message?: string
// }
const app = express()
const secret = 'fherafhukfsrhgbnsgukrvbkakrekgfk'
const csrfProtection = csrf({ cookie: true })
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))
app.use(csrfProtection)

createConnection()
  .then(async () => {
    const ormConnection: any = getConnection().driver
    const store = new MysqlDBStore({}, ormConnection.pool)
    const authUserRepository = getRepository(AuthUser)
    // const EntityManager = getManager()

    const GoogleStrategy = Google.Strategy
    const LocalStrategy = Local.Strategy

    app.use(
      session({
        secret: secret,
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
              const user = new AuthUser()
              user.googleId = profile.id
              user.loginGoogle = true
              await authUserRepository.save(user)
              return done(undefined, user)
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

    // app.get('/upload', (req, res) => {
    //   if (process.env.NODE_ENV === 'production') {
    //     upload(req.query)
    //       .then((url) => {
    //         res.json({ url: url })
    //       })
    //       .catch((e) => {
    //         console.log(e)
    //       })
    //   } else {
    //     res.json({ url: 'ok' })
    //   }
    // })

    const PORT = process.env.PORT || 5000
    app.listen(PORT)
  })
  .catch((error) => console.log('Data Access Error : ', error))
