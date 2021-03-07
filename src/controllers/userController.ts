/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import { Get, JsonController, UseBefore, Redirect } from 'routing-controllers'
import express from 'express'
import passport from 'passport'

@JsonController()
export class UserController {
  @UseBefore(passport.authenticate('google', { scope: ['profile', 'email'] }))
  @Get('/auth/google')
  getAuth() {}

  @UseBefore(passport.authenticate('google'))
  @Get('/auth/google/callback')
  @Redirect('/')
  getAuthCallback() {}

  @UseBefore((req: express.Request, res: express.Response) => {
    res.send(req.user)
  })
  @Get('/api/current_user')
  getCurrentUser() {}

  @UseBefore((req: express.Request, res: express.Response) => {
    req.logout()
    res.redirect('/')
  })
  @Get('/api/logout')
  getLogout() {}
}
