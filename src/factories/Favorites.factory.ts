import * as Faker from 'faker/locale/ja'
import { Article } from '../entity/Article'
import { Users } from '../entity/Users'
import { define, factory } from 'typeorm-seeding'
import { Favorites } from '../entity/Favorites'

define(Favorites, (faker: typeof Faker) => {
  const favorites = new Favorites()
  favorites.article = factory(Article)() as any
  favorites.users = factory(Users)() as any
  return favorites
})
