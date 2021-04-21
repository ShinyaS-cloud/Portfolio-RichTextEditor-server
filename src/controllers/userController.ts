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

import bcrypt from 'bcrypt'
import express, { NextFunction } from 'express'

import passport from 'passport'
import { getRepository } from 'typeorm'

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
      return res.send({ id: 0 })
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
    return res.sendStatus(200)
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
  async postSignUp(@Req() req: express.Request, @Res() res: express.Response, next: NextFunction) {
    const existingUser = await this.authUserRepository.findOne({ where: { email: req.body.email } })
    if (existingUser) {
      return res.send({ error: 'error' })
    }
    const newAuthUser = new AuthUser()
    newAuthUser.email = req.body.email
    newAuthUser.password = bcrypt.hashSync(req.body.password, 12)
    try {
      await this.authUserRepository.save(newAuthUser)
      const newUser = new User()
      newUser.authUser = newAuthUser
      newUser.name = req.body.name
      newUser.codename = req.body.codename
      newUser.introduction = req.body.introduction
      newUser.headerUrl =
        'https://rich-text-editor-bucket.s3-ap-northeast-1.amazonaws.com/img/pet/img1.jpg'
      newUser.avatarUrl =
        'https://rich-text-editor-bucket.s3-ap-northeast-1.amazonaws.com/f_f_event_66_s256_f_event_66_0bg.png'
      const doneUser = await this.userRepository.save(newUser)
      return doneUser
    } catch (error) {
      console.log(error)
    }
  }

  @Get('/auth/google')
  @UseBefore(passport.authenticate('google', { scope: ['profile', 'email'] }))
  getGoogleLogin() {}

  @Get('/auth/google/callback')
  @UseBefore(passport.authenticate('google'))
  @Redirect('https://master.d3h3awtsgh3ucy.amplifyapp.com/edit/:codename')
  async getGoogleCallback(
    @Session() session: any,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    const authUser = session.passport.user
    const returnUser = await this.userRepository.findOne({ where: { authUserId: authUser.id } })
    return { codename: returnUser?.codename }
  }

  @UseBefore(MyMiddleware)
  @Get('/api/userEdit')
  async getEditUser(
    @Session() session: any,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    const authUser = session.passport.user
    const prevUser = await this.userRepository.findOne({ where: { authUserId: authUser.id } })
    const prevAuthUser = await this.authUserRepository.findOne({
      where: { id: authUser.id }
    })
    return {
      name: prevUser?.name,
      codename: prevUser?.codename,
      email: prevAuthUser?.email,
      introduction: prevUser?.introduction
    }
  }

  @UseBefore(MyMiddleware)
  @Post('/api/userEdit')
  async postEditUser(
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
    await this.authUserRepository.save(newAuthUser)
    const newUser = { ...prevUser, name: req.body.name, introduction: req.body.introduction }
    const doneUser = await this.userRepository.save(newUser)
    return doneUser
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
