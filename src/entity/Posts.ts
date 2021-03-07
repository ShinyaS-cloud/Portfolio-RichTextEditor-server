import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'

import { UserPosts } from './UserPosts'

@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: false })
  quantity?: number

  @Column({ type: 'int', nullable: true })
  postId?: number

  @ManyToOne(() => UserPosts, (userPosts) => userPosts.posts, { cascade: true })
  @JoinColumn({ name: 'postId' })
  userPosts?: UserPosts
}
