import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm'
import { UserPosts } from './UserPosts'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ nullable: false, unique: true })
  password!: string

  @Column({ nullable: false })
  email!: string

  @Column({ type: 'int', nullable: true })
  postId!: number

  @OneToOne(() => UserPosts, (userPosts) => userPosts.user)
  @JoinColumn({ name: 'userpostsId' })
  userPosts?: UserPosts
}
