import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'
import { Article } from './Article'

@Entity()
export class Favorites {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: false })
  userId!: number

  @Column({ type: 'int', nullable: true })
  articleId!: number

  @ManyToOne(() => User, (user) => user.favorites, { cascade: true })
  @JoinColumn({ name: 'userId' })
  user?: User

  @ManyToOne(() => Article, (article) => article.favorites, { cascade: true })
  @JoinColumn({ name: 'articleId' })
  article?: Article
}
