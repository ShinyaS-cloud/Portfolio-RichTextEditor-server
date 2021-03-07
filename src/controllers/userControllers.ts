/* eslint-disable space-before-function-paren */
import {
  Param,
  Body,
  Get,
  Post,
  Res,
  Controller,
  Render,
  Redirect,
  Session,
  Authorized,
  Req
} from 'routing-controllers'
import { User } from '../entity/User'
import * as express from 'express'
import { getRepository, getConnection } from 'typeorm'
import { Posts } from '../entity/Posts'
import bcrypt from 'bcrypt'

@Controller()
export class UserController {
  userRepositry = getRepository(User)
  postRepositry = getRepository(Posts)

  @Authorized()
  @Get('/user')
  async getAll() {
    return await this.userRepositry.find().catch((err) => console.log(err))
  }

  @Authorized()
  @Get('/user/:id')
  async getOne(@Res() res: express.Response, @Param('id') userId: number) {
    const user = await this.userRepositry.findOne({ where: { id: userId } })
    if (!user) {
      console.log('Product was Not Found')
      res.status(500)
      return
    }
    return user
  }

  @Authorized()
  @Get('/login')
  @Render('auth/login')
  async getLogin(@Session() session: any, res: express.Response) {
    return { pageTitle: 'Login Form', path: '/login' }
  }

  @Authorized()
  @Get('/signup')
  @Render('auth/signup')
  async getSignUp(@Session() session: any, @Res() res: express.Response) {
    return { pageTitle: 'SignUP Form', path: '/signup' }
  }

  @Authorized()
  @Get('/reset')
  @Render('auth/reset')
  async getReset(@Session() session: any, @Res() res: express.Response) {
    return { pageTitle: 'Reset Form', path: '/reset' }
  }

  @Authorized()
  @Post('/login')
  @Redirect('/login')
  async postLogin(
    @Body() userData: any,
    @Session() session: any,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    try {
      const authUser = await this.userRepositry.findOne({ where: { email: userData.email } })
      if (authUser === undefined) {
        req.flash('error', 'Invalid email or password')
        return
      }

      const doMatch = await bcrypt.compare(userData.password, authUser.password)
      if (doMatch) {
        session.user = authUser
        session.isLoggedIn = true
        return () => {
          res.redirect('/')
        }
      }
      return
    } catch (err) {
      console.log(err)
    }
  }

  @Authorized()
  @Post('/signup')
  @Redirect('/signup')
  async postSignup(
    @Body() userData: any,
    @Session() session: any,
    @Res() res: express.Response,
    @Req() req: express.Request
  ) {
    try {
      const authUser = await this.userRepositry.findOne({ where: { email: userData.email } })
      if (authUser !== undefined) {
        req.flash('error', 'E-mail exists already, please pick a different one')
        return
      } else {
        const newUser = userData
        const hashedPassword = await bcrypt.hash(userData.password, 12)
        newUser.password = hashedPassword
        const updatePost = this.postRepositry.create({})

        await this.userRepositry.save(newUser)
        await this.postRepositry.save(updatePost)

        await getConnection()
          .createQueryBuilder()
          .relation(User, 'post')
          .of(newUser.id)
          .set(updatePost.id)
        await getConnection()
          .createQueryBuilder()
          .relation(Post, 'user')
          .of(updatePost.id)
          .set(newUser.id)
        return () => res.redirect('/login')
      }
    } catch (err) {
      console.log(err)
    }
  }

  @Authorized()
  @Post('/logout')
  @Redirect('/')
  async postlogout(@Session() session: any) {
    session.destroy((err: Error) => {
      console.log(err)
    })
  }
}
