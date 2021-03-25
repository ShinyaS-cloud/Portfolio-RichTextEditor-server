/* eslint-disable space-before-function-paren */
import { Article } from '../entity/Article'
import { User } from '../entity/User'
import { Connection } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'

import { Favorites } from '../entity/Favorites'
import faker from 'faker'

export default class CreateUser implements Seeder {
  public async run(factory: Factory, connection: Connection) {
    await factory(Favorites)()
      .map(async (favorites: Favorites) => {
        const articleRepository = connection.getRepository(Article)
        const userRepository = connection.getRepository(User)
        const articleCount = (await articleRepository.count()) - 1
        const userCount = (await userRepository.count()) - 1

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
      .createMany(50)
  }
}
