import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'
import { Article } from './Article'

@Entity()
export class Favorites {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: true })
  userId?: number

  @Column({ type: 'int', nullable: true })
  articleId?: number

  @ManyToOne(() => User, (user) => user.favorites, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user?: User

  @ManyToOne(() => Article, (article) => article.favorites, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'articleId' })
  article?: Article
}
