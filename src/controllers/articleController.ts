/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import {
  Get,
  JsonController,
  Post,
  QueryParam,
  QueryParams,
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
import { Comment } from '../entity/Comment'

const csrfProtection = csrf({ cookie: true })

class GetUserCategoryQuery {
  categoryNumber!: number
  userId!: number
  next!: number
}

/**
 * Controller
 */

@JsonController()
export class ArticleController {
  articleRepository = getRepository(Article)
  userRepository = getRepository(User)
  favoritesRepository = getRepository(Favorites)
  commentRepository = getRepository(Comment)
  fetchArticle = async (where: any, next: number) => {
    // nextはどこから読み取るかの番号
    const article = await this.articleRepository.find({
      relations: ['user', 'favorites'],
      take: 12,
      skip: next,
      order: { createdAt: 'DESC' },
      where: where
    })
    return article
  }

  /**
   *  paramsで指定されたカテゴリーのarticleを返すAPI
   */
  @Get('/api/articleList')
  async getArticleListCategory(@QueryParams() param: GetUserCategoryQuery) {
    try {
      const post = await this.fetchArticle(
        { category: param.categoryNumber, isPublic: true },
        param.next
      )

      const fetchedPost = post.map((p) => {
        let isFavorite = false
        let favoriteCount = 0
        if (p.favorites !== undefined) {
          const favoriteUser = p.favorites.filter((f) => +f.userId! === +param.userId)
          isFavorite = Boolean(favoriteUser.length)
          favoriteCount = p.favorites.length
          delete p.favorites
        }
        delete p.content
        delete p.user?.authUserId
        delete p.user?.introduction
        delete p.user?.headerUrl
        return { ...p, isFavorite, favoriteCount }
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
      const post = await this.fetchArticle({ userId }, 0)
      const fetchPost = post.map((p) => {
        delete p.content
        delete p.user?.authUserId
        delete p.user?.introduction
        delete p.user?.headerUrl
        let favoriteCount = 0
        if (p.favorites) {
          favoriteCount = p.favorites.length
        }
        return { ...p, isFavorite: false, favoriteCount }
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
      const post = await this.favoritesRepository.find({
        relations: ['user', 'article'],
        where: { userId, isPublic: true }
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
   *  paramsで指定されたuserのcommentを返すAPI
   */
  @Get('/api/comment')
  async getCommentList(@QueryParam('articleId') articleId: number) {
    try {
      const Comment = await this.commentRepository.find({
        relations: ['user'],
        where: { articleId }
      })

      const fetchComment = Comment.map((p) => {
        delete p.user?.authUserId
        delete p.user?.introduction
        delete p.user?.headerUrl
        const returnComment = { comment: { id: p.id, comment: p.comment }, user: p.user }
        return { ...returnComment }
      })

      return fetchComment
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 選択された一つのArticleを返すAPI
   */
  @Get('/api/article')
  async getArticle(
    @QueryParam('id') articleId: number,
    @Session() session: any,
    @Res() res: express.Response
  ) {
    const article = await this.articleRepository.findOne(articleId, {
      relations: ['user', 'favorites']
    })
    const favorite = await this.favoritesRepository.find({
      where: { articleId, userId: session.passport.user.id }
    })
    if (article === undefined || article.user === undefined) {
      return '/'
    }
    let favoriteCount = 0
    const isFavorite = Boolean(favorite.length)
    if (article.favorites) {
      favoriteCount = article.favorites.length
    }
    delete article.user.authUserId
    delete article.user.introduction
    delete article.user.headerUrl
    return { ...article, favoriteCount, isFavorite }
  }

  /**
   *新しいArticleを作成するAPI
   */
  @Get('/api/newpost')
  @UseBefore(csrfProtection)
  async getNewPost(@Session() session: any) {
    try {
      const article = new Article()

      const user = await this.userRepository.findOne({
        where: { id: session.passport.user.id }
      })
      article.user = user
      article.isPublic = false
      article.content = JSON.parse('{ "blocks": [], "entityMap": {} }')
      article.category = 0
      article.title = ''
      const newArticle = await this.articleRepository.save(article)

      if (user === undefined) {
        return console.log('error')
      }

      return { articleId: newArticle.id, codename: user.codename }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 編集されたArticleを保存する
   */
  @Post('/api/save')
  @UseBefore(csrfProtection)
  async postSaveArticle(
    @Session() session: any,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    try {
      const { data } = req.body

      await this.articleRepository.update(data.articleId, {
        title: data.title,
        content: data.content,
        category: data.category
      })

      return res.send('OK')
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
      const prevFavorite = await this.favoritesRepository.find({
        where: { userId: req.body.userId, articleId: req.body.articleId }
      })
      const prevFavoriteCount = await this.favoritesRepository.count({
        where: { articleId: req.body.articleId }
      })
      let isFavorite
      let favoriteCount = prevFavoriteCount
      if (prevFavorite.length) {
        await this.favoritesRepository.delete(prevFavorite[0])
        isFavorite = Boolean(prevFavorite.length - 1)
        favoriteCount -= 1
      } else {
        const favorite = new Favorites()
        favorite.userId = req.body.userId
        favorite.articleId = req.body.articleId
        await this.favoritesRepository.save(favorite)
        isFavorite = true
        favoriteCount += 1
      }
      return { isFavorite, favoriteCount }
    } catch (error) {
      console.log(error)
    }
  }
}
