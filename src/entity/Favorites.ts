import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Article, User } from './Index'

@Entity()
export class Favorites {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: true })
  userId?: number

  @Column({ type: 'int', nullable: true })
  articleId?: number

  @ManyToOne('User', 'favorites', {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user?: User | undefined

  @ManyToOne('Article', 'favorites', {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'articleId' })
  article?: Article | undefined
}
