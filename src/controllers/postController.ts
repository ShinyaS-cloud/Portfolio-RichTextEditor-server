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
  Session,
  UseBefore
} from 'routing-controllers'
import express from 'express'
import csrf from 'csurf'
import { getRepository } from 'typeorm'
import { Article } from '../entity/Article'
import { Users } from '../entity/Users'

const csrfProtection = csrf({ cookie: true })
// const categories = ['pet', 'sports', 'novel', 'IT', 'food']

// type CategoryTypes = keyof typeof categories

@JsonController()
export class PostController {
  articleRepositry = getRepository(Article)
  usersRepositry = getRepository(Users)

  /// paramsで指定されたカテゴリーのポストを返す
  @Get('/api/articleCategory')
  async getArticles(@QueryParam('categoryName') param: number) {
    try {
      let post
      if (param === -1) {
        post = await this.articleRepositry.find({ take: 10, order: { createdAt: 'DESC' } })
      } else {
        post = await this.articleRepositry.find({ where: { category: param } })
      }
      const fetchPost = post.map((p) => {
        return {
          articleId: p.id,
          title: p.title,
          imageUrl: p.imageUrl,
          userId: p.usersId,
          category: p.category,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }
      })

      return fetchPost
    } catch (error) {
      console.log(error)
    }
  }

  @Get('/article')
  async getArticle(@QueryParam('articleId') param: number) {
    const post = await this.articleRepositry.findOne({ where: { articleId: param } })
    if (post === undefined) {
      return
    }
    return {
      articleId: post.id,
      title: post.title,
      imageUrl: post.imageUrl,
      userId: post.usersId,
      category: post.category,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }
  }

  @Get('/api/newpost')
  @UseBefore(csrfProtection)
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
  @UseBefore(csrfProtection)
  @Redirect('/')
  async getSaveArticle(
    @Session() session: any,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    try {
      const { data } = req.body
      await this.articleRepositry.update(data.articleId, {
        title: data.title,
        content: data.content,
        category: data.category
      })
    } catch (error) {
      console.log(error)
    }
  }
}
