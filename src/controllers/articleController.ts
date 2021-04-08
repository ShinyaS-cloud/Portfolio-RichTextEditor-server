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
import { MyMiddleware } from '../middlewares/MyMiddleware'

const csrfProtection = csrf({ cookie: true })

class GetArticleQuery {
  categoryNumber!: number
  userId!: number
  next!: number
  type!: 'user' | 'category' | 'favorite' | 'comment'
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

  /**
   * articleを取ってくる共通の処理
   *
   * where:検索条件
   * next:何番目から読み取るかの番号
   * authUserId:ログインしているuserのid
   */
  async fetchArticle(where: any, next: number, authUserId: number) {
    try {
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
        skip: next,
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

  /**
   * お気に入りした記事の検索する
   *
   * whereをfetchArticleに渡す
   */

  async getArticleListFavorite(arg: GetArticleQuery, authUserId: number) {
    try {
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

      const fetchedPost = await this.fetchArticle(articleFavoriteIdList, next, authUserId)
      return fetchedPost
    } catch (error) {
      console.log('error')
      console.log(error)
    }
  }

  /**
   * コメントした記事を検索する
   *
   * whereをfetchArticleに渡す
   */

  async getArticleListComment(arg: GetArticleQuery, authUserId: number) {
    try {
      const { userId, next, categoryNumber } = arg

      const comment = await this.commentRepository.find({ where: { userId } })

      if (!comment.length) {
        return []
      }

      const articleCommentIdList = comment.map((p) => {
        let where: any = { id: p.articleId, category: categoryNumber, isPublic: true }
        if (p.userId !== authUserId) {
          where = { id: p.articleId, category: categoryNumber }
        }
        return where
      })

      const fetchedPost = await this.fetchArticle(articleCommentIdList, next, authUserId)
      return fetchedPost
    } catch (error) {
      console.log('error')
      console.log(error)
    }
  }

  /**
   *  typeごとに処理を切り替える
   * 基本はwhereが検索条件になっている
   */
  @Get('/api/articleList')
  async getArticleListCategory(@Session() session: any, @QueryParams() param: GetArticleQuery) {
    try {
      let authUserId = 0
      if (session.passport?.user?.id) {
        authUserId = session.passport.user.id
      }
      let where: any
      const isPublic = true
      switch (param.type) {
        case 'category':
          where = { category: param.categoryNumber, isPublic }
          return await this.fetchArticle(where, param.next, authUserId)

        case 'user':
          if (+param.userId === authUserId) {
            where = { category: param.categoryNumber, userId: +param.userId }
          } else {
            where = { category: param.categoryNumber, userId: +param.userId, isPublic }
          }

          return await this.fetchArticle(where, param.next, authUserId)

        case 'favorite':
          return await this.getArticleListFavorite(param, authUserId)
        case 'comment':
          return await this.getArticleListComment(param, authUserId)

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
    let authUserId = 0

    if (session.passport?.user?.id) {
      authUserId = session.passport.user.id
    }
    const article = await this.articleRepository.findOne(articleId, {
      relations: ['user', 'favorites']
    })
    const favorite = await this.favoritesRepository.find({
      where: { articleId, userId: authUserId }
    })
    if (article === undefined || article.user === undefined) {
      return '/'
    }
    let favoriteCount = 0
    const isFavorite = !!favorite.length
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

  @UseBefore(MyMiddleware)
  @Post('/api/newpost')
  @UseBefore(csrfProtection)
  async getNewPost(@Session() session: any) {
    try {
      let authUserId = 0

      if (session.passport?.user?.id) {
        authUserId = session.passport.user.id
      }
      const article = new Article()

      const user = await this.userRepository.findOne({
        where: { id: authUserId }
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
   *新しいcommentを作成するAPI
   */

  @UseBefore(MyMiddleware)
  @Post('/api/comment')
  async getNewComment(@Session() session: any, @Req() req: express.Request) {
    try {
      let authUserId = 0

      if (session.passport?.user?.id) {
        authUserId = session.passport.user.id
      }
      const comment = new Comment()

      const user = await this.userRepository.findOne({
        where: { id: authUserId }
      })
      const article = await this.articleRepository.findOne({
        where: { id: req.body.articleId }
      })

      if (user === undefined) {
        return console.log('error')
      }
      comment.user = user
      comment.article = article
      comment.comment = req.body.comment
      const newComment = await this.commentRepository.save(comment)

      return { success: !!newComment }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 編集されたArticleを保存する
   */
  @UseBefore(MyMiddleware)
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
        category: data.category,
        abstract: data.abstract,
        isPublic: data.isPublic
      })

      return res.send('OK')
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * いいねボタンを押す
   */

  @UseBefore(MyMiddleware)
  @Post('/api/favorite')
  @UseBefore(csrfProtection)
  async postFavorite(
    @Session() session: any,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    try {
      let authUserId = 0

      if (session.passport?.user?.id) {
        authUserId = session.passport.user.id
      }

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

  @UseBefore(MyMiddleware)
  @Delete('/api/article/delete')
  async deleteArticle(@Req() req: express.Request) {
    try {
      const doneArticle = await this.articleRepository.delete({ id: req.body.articleId })
      return doneArticle
    } catch (error) {
      console.log(error)
    }
  }

  @UseBefore(MyMiddleware)
  @Delete('/api/comment/delete')
  async deleteComment(@Req() req: express.Request) {
    try {
      const doneComment = await this.commentRepository.delete({ id: req.body.commentId })
      return doneComment
    } catch (error) {
      console.log(error)
    }
  }
}
