/* eslint-disable space-before-function-paren */
import { Article } from '../entity/Article'
import { Connection } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'
import { Users } from '../entity/Users'
import { Profile } from '../entity/Profile'

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection) {
    await factory(Users)()
      .map(async (user: Users) => {
        const articles: Article[] = await factory(Article)().createMany(10)
        const profile: Profile = await factory(Profile)().create()
        user.article = articles
        user.profile = profile
        return user
      })
      .createMany(10)
  }
}
