/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import { Get, JsonController, Param } from 'routing-controllers'

import { getRepository } from 'typeorm'
import { Post } from 'src/entity/Post'
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
  postRepositry = getRepository(Post)

  /// paramsで指定されたカテゴリーのポストを返す
  @Get('/api/post/:categoryName')
  async getPost(@Param('categoryName') param: CategoryTypes) {
    try {
      const post = await this.postRepositry.find({ where: { category: categories[param].id } })

      const fetchPost = post.map((p) => {
        return { postId: p.id, title: p.title, imageUrl: p.imageUrl, userId: p.user }
      })

      return fetchPost
    } catch (error) {
      console.log(error)
    }
  }

  @Get('/newpost')
  getNewPost() {}
}
