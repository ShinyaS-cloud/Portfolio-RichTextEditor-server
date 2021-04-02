/* eslint-disable space-before-function-paren */
import express from 'express'
import { ExpressMiddlewareInterface } from 'routing-controllers'

export class MyMiddleware implements ExpressMiddlewareInterface {
  // interface implementation is optional
  use(request: express.Request, response: express.Response, next: express.NextFunction): any {
    const authUser = request.user
    if (!authUser) {
      return response.json({ authorizationRequired: true })
    } else {
      next()
    }
  }
}
