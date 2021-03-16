import * as Faker from 'faker/locale/ja'

import { define } from 'typeorm-seeding'
import { Article } from '../entity/Article'

define(Article, (faker: typeof Faker) => {
  const article = new Article()
  // const seed = faker.random.number(1000)
  // const mockImages = 'https://picsum.photos/id/' + seed + '/200/300.jpg'
  article.category = faker.random.number(4)
  // article.imageUrl = mockImages
  article.title = faker.name.title()
  article.abstract = faker.lorem.sentence(10)

  const varArray = [...Array(100)].fill({
    key: '',
    data: {},
    text: '',
    type: 'unstyled',
    depth: 0,
    entityRanges: [],
    inlineStyleRanges: []
  })

  const fakerArray = varArray.map((v) => {
    v.key = faker.random.alphaNumeric(5).toLowerCase()
    v.text = faker.lorem.sentence(9)
    v.inlineStyleRanges = []
    return v
  })

  article.content = JSON.parse('{ blocks: ' + `${fakerArray}` + ', entityMap: {} }')

  return article
})
