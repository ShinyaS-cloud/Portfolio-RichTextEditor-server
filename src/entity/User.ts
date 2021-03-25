import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm'
import { AuthUser } from './AuthUser'
import { Article } from './Article'
import { Favorites } from './Favorites'
import { Follows } from './Follows'
import { Comment } from './Comment'

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

  @OneToOne(() => AuthUser, (authUser) => authUser.user)
  @JoinColumn({ name: 'authUserId' })
  authUser?: AuthUser

  @OneToMany(() => Article, (article) => article.user)
  article?: Article[]

  @OneToMany(() => Favorites, (favorites) => favorites.user)
  favorites?: Favorites[]

  @OneToMany(() => Comment, (comment) => comment.user)
  comment?: Comment[]

  @OneToMany(() => Follows, (follows) => follows.fromUser)
  fromFollows?: Follows[]

  @OneToMany(() => Follows, (follows) => follows.toUser)
  toFollows?: Follows[]
}
