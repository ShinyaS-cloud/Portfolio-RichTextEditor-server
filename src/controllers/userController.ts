/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import { Get, JsonController, QueryParam, Redirect, Res, UseBefore } from 'routing-controllers'
import express from 'express'

import passport from 'passport'
import { getRepository } from 'typeorm'
import { Users } from '../entity/Users'
import { Profile } from '../entity/Profile'

@JsonController()
export class UserController {
  usersRepositry = getRepository(Users)
  profileRepositry = getRepository(Profile)

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
      // const profile = await this.profileRepositry.findOne({
      //   relations: ['users'],
      //   where: { users_codename: codename }
      // })
      const user = await this.usersRepositry.findOne({
        relations: ['profile'],
        where: { codename }
      })
      const profile = user?.profile
      const returnProfile = { ...profile, users: { codename } }

      res.json(returnProfile)
      return res
    } catch (error) {
      console.log(error)
    }
  }
}
