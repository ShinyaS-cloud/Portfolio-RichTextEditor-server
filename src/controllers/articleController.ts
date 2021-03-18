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
  Session,
  UseBefore
} from 'routing-controllers'
import express from 'express'
import csrf from 'csurf'
import { getRepository } from 'typeorm'
import { Article } from '../entity/Article'
import { Users } from '../entity/Users'
import { Favorites } from '../entity/Favorites'

const csrfProtection = csrf({ cookie: true })

/**
 * Contoroller
 */
class GetUsersCategoryQuery {
  categoryNumber!: number
  usersId!: number
}

@JsonController()
export class ArticleController {
  articleRepositry = getRepository(Article)
  usersRepositry = getRepository(Users)
  favoritesRepositry = getRepository(Favorites)

  /**
   *  paramsで指定されたカテゴリーのポストを返すAPI
   */
  @Get('/api/articleCategory')
  async getArticleList(@QueryParams() param: GetUsersCategoryQuery) {
    try {
      let post
      if (param.categoryNumber === -1) {
        post = await this.articleRepositry.find({
          relations: ['users', 'favorites'],
          take: 12,
          order: { createdAt: 'DESC' }
        })
      } else {
        post = await this.articleRepositry.find({
          relations: ['users', 'favorites'],
          take: 12,
          order: { createdAt: 'DESC' },
          where: { category: param.categoryNumber }
        })
      }
      const fetchPost = post.map((p) => {
        const returnArticle = { ...p, users: p.users }
        let isFavorite = false
        if (p.favorites !== undefined && param.usersId !== 0) {
          const favoriteUser = p.favorites.filter((f) => f.usersId === param.usersId)
          isFavorite = favoriteUser !== []
          delete returnArticle.favorites
        }
        delete returnArticle.content
        return { ...returnArticle, isFavorite }
      })
      return fetchPost
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 選択された一つのArticleを返すAPI
   */
  @Get('/api/article')
  async getArticle(@QueryParam('id') param: number, @Res() res: express.Response) {
    const article = await this.articleRepositry.findOne(param, { relations: ['users'] })
    if (article === undefined || article.users === undefined) {
      return '/'
    }

    const returnArticle = { ...article, users: { id: article.users.id, name: article.users.name } }
    res.json({
      ...returnArticle
    })
    return res
  }

  /**
   *新しいArticleを作成するAPI
   */
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

  /**
   * 編集されたArticleを保存する
   */
  @Post('/api/save')
  @UseBefore(csrfProtection)
  @Redirect('/')
  async postSaveArticle(
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

  /**
   * いいねボタンを押す
   */

  @Post('/api/favorite')
  @UseBefore(csrfProtection)
  async postFavorite(@Req() req: express.Request, @Res() res: express.Response) {
    try {
      const favorite = new Favorites()
      favorite.usersId = req.body.usersId
      favorite.articleId = req.body.articleId
      await this.favoritesRepositry.save(favorite)
      return res.sendStatus(200)
    } catch (error) {
      console.log(error)
    }
  }
}
