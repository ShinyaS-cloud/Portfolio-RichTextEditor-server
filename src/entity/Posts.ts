import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm'
import { Users } from './Users'
import { Article } from './Article'

@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: true })
  userId?: number

  @OneToOne(() => Users, (users) => users.posts, { cascade: true })
  @JoinColumn({ name: 'userId' })
  users?: Users

  @OneToMany(() => Article, (article) => article.posts, { cascade: true })
  article?: Article[]
}
