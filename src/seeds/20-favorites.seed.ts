/* eslint-disable space-before-function-paren */
import { Article } from '../entity/Article'
import { User } from '../entity/User'
import { Connection } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'

import { Comment } from '../entity/Comment'
import { Favorites } from '../entity/Favorites'
import { Follows } from '../entity/Follows'
import faker from 'faker'

export default class CreateFavorite implements Seeder {
  public async run(factory: Factory, connection: Connection) {
    const articleRepository = connection.getRepository(Article)
    const userRepository = connection.getRepository(User)
    const articleCount = (await articleRepository.count()) - 1
    const userCount = (await userRepository.count()) - 1
    // create Favorites
    await factory(Favorites)()
      .map(async (favorites: Favorites) => {
        const article = await articleRepository.findOne({
          where: { id: faker.random.number(articleCount) + 1 }
        })
        const user = await userRepository.findOne({
          where: { id: faker.random.number(userCount) + 1 }
        })
        favorites.article = article
        favorites.user = user

        return favorites
      })
      .createMany(100)

    // create  follows
    await factory(Follows)()
      .map(async (follows: Follows) => {
        const fromUser = await userRepository.findOne({
          where: { id: faker.random.number(userCount) + 1 }
        })
        const toUser = await userRepository.findOne({
          where: { id: faker.random.number(userCount) + 1 }
        })
        follows.fromUser = fromUser
        follows.toUser = toUser

        return follows
      })
      .createMany(1000)

    // create Comments
    await factory(Comment)()
      .map(async (comment: Comment) => {
        const article = await articleRepository.findOne({
          where: { id: faker.random.number(articleCount) + 1 }
        })
        const user = await userRepository.findOne({
          where: { id: faker.random.number(userCount) + 1 }
        })
        comment.article = article
        comment.user = user

        return comment
      })
      .createMany(1000)
  }
}
