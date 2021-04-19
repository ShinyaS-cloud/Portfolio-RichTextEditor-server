import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm'
import { Article, AuthUser, Favorites, Follows, Comment } from './Index.js'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'char', length: 40, nullable: true })
  name?: string

  @Column({ type: 'char', length: 30, nullable: false })
  codename!: string

  @Column({ type: 'char', length: 200, nullable: true })
  introduction?: string

  @Column({ type: 'char', length: 200, nullable: true })
  avatarUrl?: string

  @Column({ type: 'char', length: 200, nullable: true })
  headerUrl?: string

  @Column({ type: 'int', nullable: true })
  authUserId?: number

  @OneToOne('AuthUser', 'user', {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'authUserId' })
  authUser?: AuthUser

  @OneToMany('Article', 'user')
  article?: Article[]

  @OneToMany('Favorites', 'user')
  favorites?: Favorites[]

  @OneToMany('Comment', 'user')
  comment?: Comment[]

  @OneToMany('Follows', 'fromUser')
  fromFollows?: Follows[]

  @OneToMany('Follows', 'toUser')
  toFollows?: Follows[]
}
