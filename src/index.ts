import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

import { createConnection, getConnection, getRepository } from 'typeorm'
import session from 'express-session'
import { useExpressServer } from 'routing-controllers'
import bcrypt from 'bcrypt'
import flash from 'connect-flash'
import csrf from 'csurf'
import { User } from './entity/User'
import { UserController } from './controllers/userController'
const MysqlDBStore = require('express-mysql-session')(session)

interface Error {
  status?: number
  message?: string
}
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const csrfProtection = csrf()

createConnection().then(async () => {
  const ormConnection: any = getConnection().driver
  const store = new MysqlDBStore({}, ormConnection.pool)
  app.use(session({ secret: 'mySecret', resave: false, saveUninitialized: false, store: store }))
  app.use(csrfProtection)
  app.use(flash())
  const userRepositry = getRepository(User)
  useExpressServer(app, {
    controllers: [UserController],
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
        const update = userRepositry.create({
          password: password,
          email: 'test@test.com',
          loginGoogle: false
        })

        await userRepositry.save(update)
      }
      return await userRepositry.findOne(1)
    } catch (err) {
      console.log(err)
    }
  }
  const user = await userfind()
  await userCreate(user)

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404))
  })

  // error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
  })

  const PORT = process.env.PORT || 5000
  app.listen(PORT)
})
