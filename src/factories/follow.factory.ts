import * as Faker from 'faker/locale/ja'

import { define } from 'typeorm-seeding'
import { Follows } from '../entity/Follows'

define(Follows, (faker: typeof Faker) => {
  const follows = new Follows()
  return follows
})
