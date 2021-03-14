/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import {
  Get,
  JsonController,
  Param,
  Post,
  Redirect,
  Req,
  Res,
  Session,
  UseBefore
} from 'routing-controllers'
import jwt from 'express-jwt'
import express from 'express'

import { getRepository } from 'typeorm'
import { Article } from '../entity/Article'
import { Users } from '../entity/Users'
const categories = {
  pet: { id: 0, name: 'pet' },
  sports: { id: 1, name: 'sports' },
  novel: { id: 2, name: 'novel' },
  IT: { id: 3, name: 'IT' },
  food: { id: 4, name: 'food' },
  twitter: { id: 5, name: 'twitter' }
}

type CategoryTypes = keyof typeof categories
const jwtSecret = 'secret123'

@JsonController()
export class PostController {
  articleRepositry = getRepository(Article)
  usersRepositry = getRepository(Users)

  /// paramsで指定されたカテゴリーのポストを返す
  @Get('/api/post/:categoryName')
  async getArticle(@Param('categoryName') param: CategoryTypes) {
    try {
      const post = await this.articleRepositry.find({ where: { category: categories[param].id } })

      const fetchPost = post.map((p) => {
        return { articleId: p.id, title: p.title, imageUrl: p.imageUrl }
      })

      return fetchPost
    } catch (error) {
      console.log(error)
    }
  }

  @Get('/api/newpost')
  @UseBefore(
    jwt({ secret: jwtSecret, algorithms: ['HS256'], getToken: (req) => req.cookies.token })
  )
  @Redirect('/newpost/:articleId')
  async getNewPost(@Session() session: any) {
    try {
      const article = new Article()

      const users = await this.usersRepositry.findOne({
        where: { id: session.passport.user.id }
      })
      article.users = users
      const newArticle = await this.articleRepositry.save(article)

      if (users === undefined) {
        return console.log('error')
      }

      return { articleId: newArticle.id }
    } catch (error) {
      console.log(error)
    }
  }

  @Post('/api/save')
  @Redirect('/')
  async getSaveArticle(
    @Session() session: any,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    try {
      // const article = await this.articleRepositry.findOne({
      //   where: { id: req.body.id }
      // })
      // if (article === undefined) {
      //   return console.log('error')
      // }

      // article.

      // await this.articleRepositry.save(article)
      await this.articleRepositry.update(req.body.articleId, {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category
      })
    } catch (error) {
      console.log(error)
    }
  }
}
