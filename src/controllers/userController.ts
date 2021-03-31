/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import {
  Delete,
  Get,
  JsonController,
  Post,
  QueryParam,
  Redirect,
  Req,
  Res,
  Session,
  UseBefore
} from 'routing-controllers'
import express from 'express'

import passport from 'passport'
import { getRepository } from 'typeorm'
import { AuthUser } from '../entity/AuthUser'
import { User } from '../entity/User'
import { Follows } from '../entity/Follows'

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
  async getProfile(
    @Session() session: any,
    @QueryParam('codename') codename: string,
    @Res() res: express.Response
  ) {
    try {
      const authUserId = session.passport.user.id
      const user = await this.userRepository.findOne({
        where: { codename }
      })
      delete user?.authUserId
      let followerCount = 0
      let followeeCount = 0
      let isFollow = false
      if (user) {
        const follow = await this.followsRepository.find({
          where: { fromUserId: authUserId, toUserId: user.id }
        })
        isFollow = Boolean(follow.length)
        followerCount = await this.followsRepository.count({
          where: { fromUserId: user.id }
        })
        followeeCount = await this.followsRepository.count({
          where: { toUserId: user.id }
        })
      }
      return { ...user, followerCount, followeeCount, isFollow }
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
      let followerCount = prevFollowCount
      if (prevFollow.length) {
        await this.followsRepository.delete(prevFollow[0])
        isFollow = Boolean(prevFollow.length - 1)
        followerCount -= 1
      } else {
        const follow = new Follows()
        follow.fromUserId = req.body.fromUserId
        follow.toUserId = req.body.toUserId
        await this.followsRepository.save(follow)
        isFollow = true
        followerCount += 1
      }
      return { isFollow, followerCount }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   *  paramsで指定されたuserのフォロワーを返すAPI
   */
  @Get('/api/followerList')
  async getFollowerList(@QueryParam('userId') userId: number) {
    try {
      const follower = await this.followsRepository.find({
        select: ['fromUserId', 'toUserId'],
        where: { fromUserId: userId },
        relations: ['toUser']
      })

      const fetchFollower = follower.map((p) => {
        delete p.toUser?.authUserId
        delete p.toUser?.headerUrl
        delete p.toUser?.id
        return p.toUser
      })

      return fetchFollower
    } catch (error) {
      console.log(error)
    }
  }

  /**
   *  paramsで指定されたuserのフォロイーを返すAPI
   */
  @Get('/api/followeeList')
  async getFolloweeList(@QueryParam('userId') userId: number) {
    try {
      const followee = await this.followsRepository.find({
        select: ['fromUserId', 'toUserId'],
        where: { toUserId: userId },
        relations: ['fromUser']
      })

      const fetchFollowee = followee.map((p) => {
        delete p.fromUser?.authUserId
        delete p.fromUser?.headerUrl
        delete p.fromUser?.id
        return p.fromUser
      })

      return fetchFollowee
    } catch (error) {
      console.log(error)
    }
  }

  @Delete('/api/user/delete')
  async deleteUser(@Session() session: any) {
    const doneUser = await this.authUserRepository.delete({ id: session.passport.user.id })
    return doneUser
  }
}
