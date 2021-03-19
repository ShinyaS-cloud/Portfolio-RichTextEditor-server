import * as Faker from 'faker/locale/ja'
import { define } from 'typeorm-seeding'
import { Users } from '../entity/Users'
import bcrypt from 'bcrypt'

define(Users, (faker: typeof Faker) => {
  const user = new Users()
  const password = faker.random.word()

  user.codename = faker.name.firstName().toLowerCase()
  user.email = faker.internet.email()
  user.password = bcrypt.hashSync(password, 12)
  user.loginGoogle = false
  return user
})
