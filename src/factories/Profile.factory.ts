import * as Faker from 'faker/locale/ja'
import { define, factory } from 'typeorm-seeding'
import { Users } from '../entity/Users'
import { Profile } from '../entity/Profile'

define(Profile, (faker: typeof Faker) => {
  const profile = new Profile()
  profile.name = faker.name.findName()
  profile.introduction = faker.lorem.text()
  profile.birthDay = faker.date.past()
  profile.users = factory(Users)() as any
  return profile
})
