import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'

import { Post } from './Post'

@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: false })
  quantity!: number

  @Column({ type: 'int', nullable: true })
  postId!: number

  @ManyToOne(() => Post, (post) => post.posts, { cascade: true })
  @JoinColumn({ name: 'postId' })
  post?: Post
}
