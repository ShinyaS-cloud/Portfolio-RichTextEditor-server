import * as Faker from 'faker/locale/ja'
import { define } from 'typeorm-seeding'
import { AuthUser } from '../entity/AuthUser'
import bcrypt from 'bcrypt'
import fs from 'fs'

define(AuthUser, (faker: typeof Faker) => {
  const authUser = new AuthUser()
  const password = faker.random.word()
  fs.appendFile('password.txt', password + '/n', (error) => {
    if (error) {
      throw error
    }
  })

  authUser.email = faker.internet.email()
  authUser.password = bcrypt.hashSync(password, 12)
  authUser.loginGoogle = false
  return authUser
})
