import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'
import { Article } from './Article'

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

  @ManyToOne(() => User, (user) => user.comment, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user?: User

  @ManyToOne(() => Article, (article) => article.comment, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'articleId' })
  article?: Article
}
