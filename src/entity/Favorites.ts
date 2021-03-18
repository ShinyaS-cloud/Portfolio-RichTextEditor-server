import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Users } from './Users'
import { Article } from './Article'

@Entity()
export class Favorites {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: false })
  usersId!: number

  @Column({ type: 'int', nullable: true })
  articleId!: number

  @ManyToOne(() => Users, (users) => users.favorites, { cascade: true })
  @JoinColumn({ name: 'usersId' })
  users?: Users

  @ManyToOne(() => Article, (article) => article.favorites, { cascade: true })
  @JoinColumn({ name: 'articleId' })
  article?: Article
}
