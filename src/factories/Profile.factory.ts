import * as Faker from 'faker/locale/ja'
import { define } from 'typeorm-seeding'

import { Profile } from '../entity/Profile'

define(Profile, (faker: typeof Faker) => {
  const profile = new Profile()
  profile.name = faker.name.findName()
  profile.introduction = faker.random.words(5)
  profile.avatarUrl = faker.random.arrayElement(avatars)
  const seed = faker.random.number(1000)
  const mockImages = 'https://picsum.photos/id/' + seed + '/200/300.jpg'
  profile.headerUrl = mockImages
  return profile
})

const avatars = [
  'f_f_event_7_s256_f_event_7_0bg.png',
  'f_f_event_66_s256_f_event_66_0bg.png',
  'f_f_event_68_s256_f_event_68_0bg.png',
  'f_f_event_75_s256_f_event_75_0bg.png',
  'f_f_event_77_s256_f_event_77_0bg.png',
  'f_f_event_79_s256_f_event_79_0bg.png',
  'f_f_event_82_s256_f_event_82_0bg.png',
  'f_f_health_50_s256_f_health_50_0bg.png',
  'f_f_object_2_s256_f_object_2_0bg.png',
  'f_f_object_51_s256_f_object_51_0bg.png',
  'f_f_object_74_s256_f_object_74_0bg.png',
  'f_f_object_75_s256_f_object_75_0bg.png',
  'f_f_object_76_s256_f_object_76_0bg.png',
  'f_f_object_79_s256_f_object_79_0bg.png',
  'f_f_object_100_s256_f_object_100_0bg.png',
  'f_f_object_108_s256_f_object_108_0bg.png',
  'f_f_object_111_s256_f_object_111_0bg.png',
  'f_f_object_114_s256_f_object_114_0bg.png',
  'f_f_object_116_s256_f_object_116_0bg.png',
  'f_f_object_122_s256_f_object_122_0bg.png',
  'f_f_object_149_s256_f_object_149_0bg.png',
  'f_f_object_151_s256_f_object_151_0bg.png',
  'f_f_object_161_s256_f_object_161_0bg.png',
  'f_f_object_170_s256_f_object_170_0bg.png'
]
