/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import { Get, JsonController, UseBefore, Redirect } from 'routing-controllers'
import express from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'

const jwtSecret = 'alirghareglaernfa'
@JsonController()
export class UserController {
  @Get('/auth/google')
  @UseBefore(passport.authenticate('google', { scope: ['profile', 'email'] }))
  getAuth() {}

  @Get('/auth/google/callback')
  @UseBefore(passport.authenticate('google'), (res: express.Response) => {
    const token = jwt.sign({ user: 'aewfjraeg' }, jwtSecret)
    res.cookie('token', token, { httpOnly: true })
    res.json({ token })
  })
  @Redirect('/')
  getAuthCallback() {}

  @Get('/api/current_user')
  @UseBefore((req: express.Request, res: express.Response) => {
    res.send(req.user)
  })
  getCurrentUser() {}

  @Get('/api/jwt')
  @UseBefore((res: express.Response) => {
    const token = jwt.sign({ user: 'aewfjraeg' }, jwtSecret)
    res.cookie('token', token, { httpOnly: true })
    res.json({ token })
  })
  getJwt() {}

  @Get('/api/csrfToken')
  @UseBefore((req: express.Request, res: express.Response) => {
    res.json({ csrfToken: req.csrfToken() })
  })
  getCsrfToken() {}

  @Get('/api/logout')
  @UseBefore((req: express.Request, res: express.Response) => {
    req.logout()
    res.redirect('/')
  })
  getLogout() {}
}
