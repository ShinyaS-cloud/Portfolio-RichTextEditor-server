import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn, Column } from 'typeorm'
import { User } from './User'
import { Posts } from './Posts'

@Entity()
export class UserPosts {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: true })
  userId!: number

  @OneToOne(() => User, (user) => user.userPosts, { cascade: true })
  @JoinColumn({ name: 'userId' })
  user?: User

  @OneToMany(() => Posts, (posts) => posts.userPosts)
  posts!: Posts[]
}
