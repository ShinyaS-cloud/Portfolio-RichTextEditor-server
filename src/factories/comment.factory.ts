import * as Faker from 'faker/locale/ja'
import natsumeArray from '../testUtil/natsume'

import { define } from 'typeorm-seeding'
import { Comment } from '../entity/Comment'

define(Comment, (faker: typeof Faker) => {
  const comment = new Comment()
  const sentence = faker.random.arrayElement(natsumeArray)
  comment.comment = sentence
  return comment
})
