import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm'
import { UserPosts } from './UserPosts'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'char', length: 200, nullable: false, unique: true })
  password!: string

  @Column({ type: 'char', length: 50, nullable: true })
  email!: string

  @Column({ type: 'int', nullable: true })
  postId?: number

  @Column({ type: 'char', length: 50, nullable: true })
  googleID?: string

  @Column({ type: 'boolean', nullable: false })
  loginGoogle!: boolean

  @OneToOne(() => UserPosts, (userPosts) => userPosts.user)
  @JoinColumn({ name: 'userpostsId' })
  userPosts?: UserPosts
}
