/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import { Get, JsonController, Param, Redirect, Session } from 'routing-controllers'

import { getRepository } from 'typeorm'
import { Article } from '../entity/Article'
import { Posts } from '../entity/Posts'
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
  postsRepositry = getRepository(Posts)

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
      const newArticle = await this.articleRepositry.save(article)
      let posts = await this.postsRepositry.findOne({ where: { userId: session.passport.user.id } })

      // posts新規作成の場合
      if (posts === undefined) {
        posts = new Posts()
        posts.users = session.passport.user
      }
      if (posts.article === undefined) {
        posts.article = []
      }
      posts.article = [...posts.article, article]
      await this.postsRepositry.save(posts)
      return { articleId: newArticle.id }
    } catch (error) {
      console.log(error)
    }
  }
}
