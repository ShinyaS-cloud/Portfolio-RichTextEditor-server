/* eslint-disable space-before-function-paren */
import { Article } from '../entity/Article'
import { Connection } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'
import { AuthUser } from '../entity/AuthUser'
import { User } from '../entity/User'

export default class CreateUser implements Seeder {
  public async run(factory: Factory, connection: Connection) {
    await factory(User)()
      .map(async (user: User) => {
        const articles: Article[] = await factory(Article)().createMany(50)
        const authUser: AuthUser = await factory(AuthUser)().create()

        user.article = articles
        user.authUser = authUser

        return user
      })
      .createMany(50)
  }
}
