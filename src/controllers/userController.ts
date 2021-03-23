/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import {
  Get,
  JsonController,
  Post,
  QueryParam,
  Redirect,
  Req,
  Res,
  UseBefore
} from 'routing-controllers'
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
  getAuthGoogle() {}

  @Get('/auth/google/callback')
  @UseBefore(passport.authenticate('google'))
  @Redirect('/')
  getAuthGoogleCallback() {}

  @Get('/api/current_user')
  async getCurrentUser(@Req() req: express.Request, @Res() res: express.Response) {
    if (!req.user) {
      return res.send(req.user)
    }
    // req.userにはpasswordやgoogleIdなどが入っているので外してクライアントに返す
    // req.userに型がついていないのでやむおえずany型に変換
    const authUser: any = { ...req.user }
    const user = await this.userRepositry.findOne({ where: { authUserId: authUser.id } })
    return res.send({ ...user, isLogedIn: true })
  }

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

  @Post('/api/login')
  @UseBefore((req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  })
  getAuth() {}
}
