/* eslint-disable space-before-function-paren */
import 'reflect-metadata'
import { Get, JsonController, UseBefore } from 'routing-controllers'
import express from 'express'
import { getRepository } from 'typeorm'
import { Post } from 'src/entity/Post'

@JsonController()
export class PostController {
  postRepositry=getRepository(Post)
  @Get('/api/post')
  @UseBefore((req: express.Request, res: express.Response) => {
    res.send(req.user)
  })
  getCurrentUser() {}

  @Get('/api/logout')
  @UseBefore((req: express.Request, res: express.Response) => {
    req.logout()
    res.redirect('/')
  })
  getLogout() {}
}
