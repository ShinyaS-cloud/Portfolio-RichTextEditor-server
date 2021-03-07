// key.ts figure out what set of credentials to return
import 'node'

interface KeyTypes {
  googleClientID: string
  googleClientSecret: string
  cookieKey: string
}

let keys: KeyTypes

if (process.env.NODE_ENV === 'production') {
  // we are in production - return the prod set of keys

  const prodKeys = require('./prod')
  keys = prodKeys.default
} else {
  // we are in development - return the dev keys
  const devKeys = require('./dev')
  keys = devKeys.default
}

export { keys }
