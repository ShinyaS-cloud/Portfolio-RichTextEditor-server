/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import {
  Get,
  JsonController,
  Post,
  QueryParam,
  QueryParams,
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
import { Follows } from '../entity/Follows'

class GetUserQuery {
  codename!: string
  authUserId!: number
}

@JsonController()
export class UserController {
  authUserRepository = getRepository(AuthUser)
  userRepository = getRepository(User)
  followsRepository = getRepository(Follows)

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
    // req.userに型がついていないのでやむを得ずany型に変換
    const authUser: any = { ...req.user }
    const user = await this.userRepository.findOne({ where: { authUserId: authUser.id } })
    return res.send({ ...user, isLoggedIn: true })
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

  /**
   * 取得したユーザー情報を返す
   */
  @Get('/api/profile')
  async getProfile(@QueryParams() param: GetUserQuery, @Res() res: express.Response) {
    try {
      const { codename, authUserId } = param
      const user = await this.userRepository.findOne({
        where: { codename }
      })
      delete user?.authUserId
      let toFollowCount = 0
      let fromFollowCount = 0
      let isFollow = false
      if (user) {
        const follow = await this.followsRepository.find({
          where: { fromUserId: authUserId, toUserId: user.id }
        })
        isFollow = Boolean(follow.length)
        toFollowCount = await this.followsRepository.count({
          where: { toUserId: user.id }
        })
        fromFollowCount = await this.followsRepository.count({
          where: { fromUserId: user.id }
        })
      }
      return { ...user, toFollowCount, fromFollowCount, isFollow }
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

  @Post('/api/signup')
  async postSignUp(@Req() req: express.Request, @Res() res: express.Response) {
    const newUser = new AuthUser()
    newUser.email = req.body.email
    newUser.password = req.body.password
    const doneUser = await this.authUserRepository.save(newUser)
    return doneUser
  }

  /**
   * フォローボタンを押す
   */

  @Post('/api/follow')
  async postFollow(@Req() req: express.Request, @Res() res: express.Response) {
    try {
      if (+req.body.fromUserId === 0) {
        return res.send(false)
      }
      const prevFollow = await this.followsRepository.find({
        where: { fromUserId: req.body.fromUserId, toUserId: req.body.toUserId }
      })
      const prevFollowCount = await this.followsRepository.count({
        where: { toUserId: req.body.toUserId }
      })
      let isFollow
      let followCount = prevFollowCount
      if (prevFollow.length) {
        await this.followsRepository.delete(prevFollow[0])
        isFollow = Boolean(prevFollow.length - 1)
        followCount -= 1
      } else {
        const follow = new Follows()
        follow.fromUserId = req.body.fromUserId
        follow.toUserId = req.body.toUserId
        await this.followsRepository.save(follow)
        isFollow = true
        followCount += 1
      }
      return { isFollow, followCount }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   *  paramsで指定されたuserのフォロワーを返すAPI
   */
  @Get('/api/followeeList')
  async getFolloweeList(@QueryParam('toUserId') toUserId: number) {
    try {
      const followee = await this.followsRepository.find({
        where: { toUserId },
        relations: ['fromUser']
      })
      const fetchFollowee = followee.map((p) => {
        delete p.toUser?.authUserId
        delete p.toUser?.headerUrl
        delete p.toUser?.id
        return p.toUser
      })
      return fetchFollowee
    } catch (error) {
      console.log(error)
    }
  }

  /**
   *  paramsで指定されたuserがフォローしているuserを返すAPI
   */
  @Get('/api/followList')
  async getFollowList(@QueryParam('fromUserId') fromUserId: number) {
    try {
      const follow = await this.followsRepository.find({
        where: { fromUserId },
        relations: ['toUser']
      })
      const fetchFollow = follow.map((p) => {
        delete p.toUser?.authUserId
        delete p.toUser?.headerUrl
        delete p.toUser?.id
        return p.toUser
      })
      return fetchFollow
    } catch (error) {
      console.log(error)
    }
  }
}
