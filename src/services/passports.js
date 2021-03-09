import passport from 'passport'
import Google from 'passport-google-oauth20'
import { getRepository } from 'typeorm'
import { User } from '../entity/User'

import { keys } from '../../config/keys'

const userRepositry = getRepository(User)

const GoogleStrategy = Google.Strategy

// passportとセッションの紐づけ
// ユーザーデータからユニークユーザー識別子を取り出す
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// ユニークユーザー識別子からユーザーデータを取り出す
passport.deserializeUser(async (id, done) => {
  const user = await userRepositry.findOne(id)
  done(null, user)
})

// passportとStrategyの紐づけ
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await userRepositry.findOne({ where: { googleId: profile.id } })
      if (existingUser) {
        console.log('we already have a record with the given profile ID')
        done(null, existingUser)
      } else {
        console.log('We dont have a recode with this ID,make a new record!')
        const user = await new User({ googleId: profile.id }).save()
        done(null, user)
      }
    }
  )
)
