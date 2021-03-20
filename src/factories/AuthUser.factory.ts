import * as Faker from 'faker/locale/ja'
import { define } from 'typeorm-seeding'
import { AuthUser } from '../entity/AuthUser'
import bcrypt from 'bcrypt'

define(AuthUser, (faker: typeof Faker) => {
  const user = new AuthUser()
  const password = faker.random.word()

  user.email = faker.internet.email()
  user.password = bcrypt.hashSync(password, 12)
  user.loginGoogle = false
  return user
})
