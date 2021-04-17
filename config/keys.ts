// key.ts figure out what set of credentials to return
interface KeyTypes {
  googleClientId: string
  googleClientSecret: string
  cognitoClientId: string
  cognitoUserPoolId: string
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
