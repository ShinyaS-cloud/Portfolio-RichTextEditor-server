/* eslint-disable space-before-function-paren */
import { Article } from '../entity/Article'
import { Connection } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'
import { AuthUser } from '../entity/AuthUser'
import { User } from '../entity/User'
import { Favorites } from '../entity/Favorites'

export default class CreateUser implements Seeder {
  public async run(factory: Factory, connection: Connection) {
    await factory(User)()
      .map(async (user: User) => {
        const articles: Article[] = await factory(Article)().createMany(10)
        const authUser: AuthUser = await factory(AuthUser)().create()
        const favorites: Favorites[] = await factory(Favorites)().createMany(15)
        user.article = articles
        user.authUser = authUser
        user.favorites = favorites
        return user
      })
      .createMany(10)
  }
}
