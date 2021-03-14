/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import { Get, JsonController, Redirect, UseBefore } from 'routing-controllers'
import express from 'express'

import passport from 'passport'

@JsonController()
export class UserController {
  @Get('/auth/google')
  @UseBefore(passport.authenticate('google', { scope: ['profile', 'email'] }))
  getAuth() {}

  @Get('/auth/google/callback')
  @UseBefore(passport.authenticate('google'))
  @Redirect('/')
  getAuthCallback() {}

  @Get('/api/current_user')
  @UseBefore((req: express.Request, res: express.Response) => {
    res.send(req.user)
  })
  getCurrentUser() {}

  // @Get('/api/jwt')
  // @UseBefore((req: express.Request, res: express.Response) => {
  //   const token = jsonwebtoken.sign({ user: 'aewfjraeg' }, jwtSecret)
  //   res.cookie('token', token, { httpOnly: true })
  //   res.redirect('/')
  // })
  // getJwt() {}

  @Get('/api/csrfToken')
  @UseBefore((req: express.Request, res: express.Response) => {
    res.json({ csrfToken: req.csrfToken() })
  })
  getCsrfToken() {}

  @Get('/api/logout')
  @UseBefore((req: express.Request, res: express.Response) => {
    req.logout()
    // res.clearCookie('token')
    res.redirect('/')
  })
  getLogout() {}
}
