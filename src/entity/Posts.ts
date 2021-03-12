import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm'
import { User } from './User'
import { Article } from './Article'

@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: true })
  userId?: number

  @OneToOne(() => User, (user) => user.posts, { cascade: true })
  @JoinColumn({ name: 'userId' })
  user?: User

  @OneToMany(() => Article, (article) => article.posts, { cascade: true })
  article?: Article[]
}
