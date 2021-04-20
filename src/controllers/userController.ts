/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import {
  Delete,
  Get,
  JsonController,
  Post,
  QueryParam,
  Req,
  Res,
  Session,
  UseAfter,
  UseBefore
} from 'routing-controllers'

import bcrypt from 'bcrypt'
import express from 'express'

import passport from 'passport'
import { getRepository } from 'typeorm'
import cors from 'cors'

import { MyMiddleware } from '../middlewares/MyMiddleware'
import { AuthUser, User, Follows } from '../entity/Index'

@JsonController()
export class UserController {
  authUserRepository = getRepository(AuthUser)
  userRepository = getRepository(User)
  followsRepository = getRepository(Follows)

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
    return res.send(200)
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
      let authUserId = 0
      if (session.passport?.user?.id) {
        authUserId = session.passport.user.id
      }
      const user = await this.userRepository.findOne({
        where: { codename }
      })
      delete user?.authUserId
      let followerCount = 0
      let followeeCount = 0
      let isFollow = false
      if (user) {
        const follow = await this.followsRepository.findOne({
          where: { fromUserId: authUserId, toUserId: user.id }
        })
        isFollow = !!follow
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

  @Post('/api/signup')
  @UseAfter((req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  async postSignUp(@Req() req: express.Request, @Res() res: express.Response) {
    const existingUser = await this.authUserRepository.findOne({ where: { email: req.body.email } })
    if (existingUser) {
      return res.send('already exist user!!')
    }
    const newAuthUser = new AuthUser()
    newAuthUser.email = req.body.email
    newAuthUser.password = bcrypt.hashSync(req.body.password, 12)
    try {
      const doneAuthUser = await this.authUserRepository.save(newAuthUser)
      req.login(doneAuthUser, (err) => {
        console.log(err)
      })
      const newUser = new User()
      newUser.authUser = newAuthUser
      newUser.codename = '' + doneAuthUser.id
      const doneUser = await this.userRepository.save(newUser)
      return doneUser
    } catch (error) {
      console.log(error)
    }
  }

  @Get('/auth/google')
  @UseBefore(cors(), passport.authenticate('google', { scope: ['profile', 'email'] }))
  getGoogleLogin() {}

  @Get('/auth/google/callback')
  @UseBefore(cors(), passport.authenticate('google'))
  async getGoogleCallback(
    @Session() session: any,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    const authUser = session.passport.user
    const returnUser = await this.userRepository.findOne({ where: { authUserId: authUser.id } })
    return returnUser
  }

  @UseBefore(MyMiddleware)
  @Post('/api/userEdit')
  async postEdit(
    @Session() session: any,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    const authUser = session.passport.user
    const prevUser = await this.userRepository.findOne({ where: { authUserId: authUser.id } })
    const newAuthUser = await this.authUserRepository.findOne({
      where: { id: authUser.id }
    })
    if (!newAuthUser) {
      return console.log('AuthUserError')
    }
    newAuthUser.email = req.body.email
    newAuthUser.password = req.body.password
    const doneAuthUser = await this.authUserRepository.save(newAuthUser)
    const newUser = { ...prevUser, name: req.body.name, introduction: req.body.introduction }
    await this.userRepository.save(newUser)
    return doneAuthUser
  }

  /**
   * フォローボタンを押す
   */

  @UseBefore(MyMiddleware)
  @Post('/api/follow')
  async postFollow(
    @Session() session: any,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    try {
      const fromUserId = session.passport?.user?.id
      if (!fromUserId) {
        return res.send(false)
      }
      const prevFollow = await this.followsRepository.find({
        where: { fromUserId: fromUserId, toUserId: req.body.toUserId }
      })
      const prevFollowCount = await this.followsRepository.count({
        where: { toUserId: req.body.toUserId }
      })

      let isFollow
      let followeeCount = prevFollowCount
      if (prevFollow.length) {
        await this.followsRepository.delete(prevFollow[0])
        isFollow = !!(prevFollow.length - 1)
        followeeCount -= 1
      } else {
        const follow = new Follows()
        follow.fromUserId = fromUserId
        follow.toUserId = req.body.toUserId
        await this.followsRepository.save(follow)
        isFollow = true
        followeeCount += 1
      }
      return { isFollow, followeeCount }
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

  @UseBefore(MyMiddleware)
  @Delete('/api/user/delete')
  async deleteUser(@Session() session: any, @Req() req: express.Request) {
    const doneUser = await this.authUserRepository.delete({ id: session.passport.user.id })
    req.logout()
    return doneUser
  }
}
