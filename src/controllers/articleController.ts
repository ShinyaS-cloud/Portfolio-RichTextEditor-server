/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import {
  Delete,
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

class GetArticleQuery {
  categoryNumber!: number
  userId!: number
  next!: number
  type!: 'user' | 'category' | 'favorite'
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

  async fetchArticle(where: any, session: any, arg: GetArticleQuery) {
    // nextはどこから読み取るかの番号
    try {
      const authUserId = session.passport.user.id
      const article = await this.articleRepository.find({
        relations: ['user', 'favorites'],
        take: 12,
        select: [
          'id',
          'title',
          'abstract',
          'imageUrl',
          'category',
          'userId',
          'createdAt',
          'updatedAt',
          'isPublic'
        ],
        skip: arg.next,
        order: { createdAt: 'DESC' },
        where: where
      })
      if (!article) {
        return []
      }

      const fetchedPost = article.map((p) => {
        let isFavorite = false
        let favoriteCount = 0
        if (p.favorites) {
          const favoriteUser = p.favorites.find((f) => +f.userId! === authUserId)
          isFavorite = !!favoriteUser
          favoriteCount = p.favorites.length
          delete p.favorites
        }
        delete p.user?.authUserId
        delete p.user?.headerUrl
        delete p.user?.introduction
        return { ...p, isFavorite, favoriteCount }
      })
      return fetchedPost
    } catch (error) {
      console.log('Error')
      console.log(error)
    }
  }

  async getArticleListFavorite(session: any, arg: GetArticleQuery) {
    try {
      const authUserId = session.passport.user.id
      const { userId, next, categoryNumber } = arg

      const favorite = await this.favoritesRepository.find({
        relations: ['user', 'article'],
        where: { userId }
      })

      if (!favorite.length) {
        return []
      }

      const articleFavoriteIdList = favorite.map((p) => {
        let where: any = { id: p.articleId, category: categoryNumber, isPublic: true }
        if (p.userId !== authUserId) {
          where = { id: p.articleId, category: categoryNumber }
        }
        return where
      })

      const article = await this.articleRepository.find({
        relations: ['user', 'favorites'],
        take: 12,
        skip: next,
        where: articleFavoriteIdList
      })
      if (!article) {
        return []
      }

      const fetchedPost = article.map((p) => {
        let isFavorite = false
        let favoriteCount = 0
        if (p.favorites) {
          const favoriteUser = p.favorites.find((f) => +f.userId! === authUserId)
          isFavorite = !!favoriteUser
          favoriteCount = p.favorites.length
          delete p.favorites
        }
        delete p.user?.authUserId
        delete p.user?.headerUrl
        delete p.user?.introduction
        return { ...p, isFavorite, favoriteCount }
      })
      return fetchedPost
    } catch (error) {
      console.log('error')
      console.log(error)
    }
  }

  /**
   *  paramsで指定されたカテゴリーのarticleを返すAPI
   */
  @Get('/api/articleList')
  async getArticleListCategory(@Session() session: any, @QueryParams() param: GetArticleQuery) {
    try {
      const authUserId = session.passport.user.id
      if (authUserId === 0) {
        return []
      }
      let where: any
      const isPublic = true
      switch (param.type) {
        case 'category':
          where = { category: param.categoryNumber, isPublic }
          return await this.fetchArticle(where, session, param)

        case 'user':
          if (+param.userId === authUserId) {
            where = { category: param.categoryNumber, userId: +param.userId }
          }
          where = { category: param.categoryNumber, userId: +param.userId, isPublic }
          return await this.fetchArticle(where, session, param)

        case 'favorite':
          return await this.getArticleListFavorite(session, param)

        default:
          break
      }
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
  async postFavorite(
    @Session() session: any,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    try {
      const authUserId = session.passport.user.id
      if (authUserId === 0) {
        return res.send(false)
      }
      const prevFavorite = await this.favoritesRepository.find({
        where: { userId: authUserId, articleId: req.body.articleId }
      })
      const prevFavoriteCount = await this.favoritesRepository.count({
        where: { articleId: req.body.articleId }
      })
      let isFavorite
      let favoriteCount = prevFavoriteCount
      if (prevFavorite.length) {
        await this.favoritesRepository.delete(prevFavorite[0])
        isFavorite = !!(prevFavorite.length - 1)
        favoriteCount -= 1
      } else {
        const favorite = new Favorites()
        favorite.userId = authUserId
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

  @Delete('/api/article/delete')
  async deleteArticle(@Session() session: any, @QueryParam('articleId') articleId: number) {
    const doneArticle = await this.articleRepository.delete({ id: articleId })
    return doneArticle
  }

  @Delete('/api/comment/delete')
  async deleteComment(@Session() session: any, @QueryParam('commentId') commentId: number) {
    const doneComment = await this.commentRepository.delete({ id: commentId })
    return doneComment
  }
}
