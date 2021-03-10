import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'
import { Post } from './Post'

@Entity()
export class Favorites {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: false })
  userId!: number

  @Column({ type: 'int', nullable: true })
  postId!: number

  @ManyToOne(() => User, (user) => user.favorites, { cascade: true })
  @JoinColumn({ name: 'userId' })
  user?: User

  @ManyToOne(() => Post, (post) => post.favorites, { cascade: true })
  @JoinColumn({ name: 'postId' })
  post?: Post
}
