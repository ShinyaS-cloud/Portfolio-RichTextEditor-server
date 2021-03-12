/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import { Get, JsonController, Param, Redirect, Session } from 'routing-controllers'

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

  @Get('/newpost')
  @Redirect('/newpost/:articleId')
  async getNewPost(@Session() session: any) {
    try {
      const article = new Article()
      const users = await this.usersRepositry.findOne({
        where: { userId: session.passport.user.id }
      })
      article.users = users
      const newArticle = await this.articleRepositry.save(article)

      if (users === undefined) {
        return console.log('error')
      }

      // 新規作成の場合
      if (users.article === undefined) {
        users.article = []
      }
      users.article = [...users.article, article]
      await this.usersRepositry.save(users)
      return { articleId: newArticle.id }
    } catch (error) {
      console.log(error)
    }
  }
}
