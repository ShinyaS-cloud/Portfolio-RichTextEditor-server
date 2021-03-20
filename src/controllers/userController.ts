/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import { Get, JsonController, QueryParam, Redirect, Res, UseBefore } from 'routing-controllers'
import express from 'express'

import passport from 'passport'
import { getRepository } from 'typeorm'
import { AuthUser } from '../entity/AuthUser'
import { User } from '../entity/User'

@JsonController()
export class UserController {
  authUserRepositry = getRepository(AuthUser)
  userRepositry = getRepository(User)

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

  @Get('/api/profile')
  async getProfile(@QueryParam('codename') codename: string, @Res() res: express.Response) {
    try {
      const user = await this.userRepositry.findOne({
        where: { codename }
      })
      res.json(user)
      return res
    } catch (error) {
      console.log(error)
    }
  }
}
