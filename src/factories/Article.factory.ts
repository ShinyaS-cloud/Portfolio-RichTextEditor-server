import * as Faker from 'faker/locale/ja'

import { define } from 'typeorm-seeding'
import { Article } from '../entity/Article'

import natsumeArray from '../testUtil/natsume'

define(Article, (faker: typeof Faker) => {
  const article = new Article()
  const seed = faker.random.number(299) + 1
  const mockImages = 'img/pet' + seed + '.jpg'
  article.category = faker.random.number(5)
  article.imageUrl = mockImages
  article.title = faker.name.title()
  article.abstract = faker.lorem.sentence(10)
  article.isPublic = true

  const varArray = [...Array(100)].fill(undefined)

  const types = [
    'unstyled',
    'header-one',
    'header-two',
    'header-three',
    'header-four',
    'header-five',
    'header-six',
    'blockquote',
    'unordered-list-item',
    'ordered-list-item',
    'left',
    'center',
    'right'
  ]

  const inlineStyle = [
    'BOLD',
    'ITALIC',
    'STRIKETHROUGH',
    'UNDERLINE',
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet'
  ]

  const textGenerator = () => {
    const sentence = faker.random.arrayElement(natsumeArray)
    const lengths = faker.random.number(sentence.length)
    const offset = faker.random.number(sentence.length - lengths)
    return {
      key: faker.random.alphaNumeric(5).toLowerCase(),
      data: {},
      text: sentence,
      type: faker.random.arrayElement(types),
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [
        { style: faker.random.arrayElement(inlineStyle), length: lengths, offset: offset }
      ]
    }
  }

  const fakerArray = varArray.map(textGenerator)

  const jsonString = '{ "blocks": ' + JSON.stringify(fakerArray) + ', "entityMap": {} }'
  article.content = JSON.parse(jsonString)

  return article
})
