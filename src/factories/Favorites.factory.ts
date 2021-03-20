import * as Faker from 'faker/locale/ja'
import { define } from 'typeorm-seeding'
import { Favorites } from '../entity/Favorites'

define(Favorites, (faker: typeof Faker) => {
  const favorites = new Favorites()
  favorites.articleId = faker.random.number(100)
  return favorites
})
