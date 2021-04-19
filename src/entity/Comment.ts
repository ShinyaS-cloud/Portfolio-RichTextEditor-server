import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Article, User } from './Index'

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'char', length: 200, nullable: true })
  comment?: string

  @Column({ type: 'int', nullable: true })
  userId?: number

  @Column({ type: 'int', nullable: true })
  articleId?: number

  @ManyToOne('User', 'comment', {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user: User | undefined

  @ManyToOne('Article', 'comment', {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'articleId' })
  article?: Article | undefined
}
