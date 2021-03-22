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
import { User } from '../entity/User'
import { Favorites } from '../entity/Favorites'

const csrfProtection = csrf({ cookie: true })

/**
 * Contoroller
 */
class GetUserCategoryQuery {
  categoryNumber!: number
  userId!: number
}

@JsonController()
export class ArticleController {
  articleRepositry = getRepository(Article)
  userRepositry = getRepository(User)
  favoritesRepositry = getRepository(Favorites)
  fetchArticle = async (where: any) => {
    const article = await this.articleRepositry.find({
      relations: ['user', 'favorites'],
      take: 12,
      order: { createdAt: 'DESC' },
      where: where
    })
    return article
  }

  /**
   *  paramsで指定されたカテゴリーのポストを返すAPI
   */
  @Get('/api/articleList')
  async getArticleListCategory(@QueryParams() param: GetUserCategoryQuery) {
    try {
      const post = await this.fetchArticle({ category: param.categoryNumber })

      const fetchedPost = post.map((p) => {
        let isFavorite = false
        if (p.favorites !== undefined) {
          const favoriteUser = p.favorites.filter((f) => +f.userId! === +param.userId)
          isFavorite = Boolean(favoriteUser.length)
          delete p.favorites
        }
        delete p.content
        delete p.user?.authUserId
        delete p.user?.introduction
        delete p.user?.headerUrl
        return { ...p, isFavorite }
      })
      return fetchedPost
    } catch (error) {
      console.log(error)
    }
  }

  /**
   *  paramsで指定されたuserのarticleを返すAPI
   */
  @Get('/api/articleList/user')
  async getArticleListUser(@QueryParam('userId') userId: number) {
    try {
      const post = await this.fetchArticle({ userId })

      const fetchPost = post.map((p) => {
        delete p.content
        delete p.user?.authUserId
        delete p.user?.introduction
        delete p.user?.headerUrl
        return { ...p, isFavorite: false }
      })
      return fetchPost
    } catch (error) {
      console.log(error)
    }
  }

  /**
   *  paramsで指定されたuserのお気に入りのarticleを返すAPI
   */
  @Get('/api/articleList/favorite')
  async getArticleListFavorite(@QueryParam('userId') userId: number) {
    try {
      const post = await this.favoritesRepositry.find({
        relations: ['user', 'article'],
        where: { userId }
      })

      const fetchPost = post.map((p) => {
        delete p.user?.authUserId
        const returnArticle = { ...p.article, user: p.user }
        delete returnArticle.content
        return { ...returnArticle, isFavorite: true }
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
    const article = await this.articleRepositry.findOne(param, { relations: ['user'] })
    if (article === undefined || article.user === undefined) {
      return '/'
    }
    delete article.user.authUserId
    delete article.user.introduction
    delete article.user.headerUrl
    res.json(article)
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

      const user = await this.userRepositry.findOne({
        where: { id: session.passport.user.id }
      })
      article.user = user
      const newArticle = await this.articleRepositry.save(article)

      if (user === undefined) {
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
      if (+req.body.userId === 0) {
        return res.send(false)
      }
      const prevFavorite = await this.favoritesRepositry.find({
        where: { userId: req.body.userId, articleId: req.body.articleId }
      })
      let isFavorite
      if (prevFavorite.length) {
        await this.favoritesRepositry.delete(prevFavorite[0])
        isFavorite = Boolean(prevFavorite.length - 1)
      } else {
        const favorite = new Favorites()
        favorite.userId = req.body.userId
        favorite.articleId = req.body.articleId
        await this.favoritesRepositry.save(favorite)
        isFavorite = true
      }
      return { isFavorite }
    } catch (error) {
      console.log(error)
    }
  }
}
