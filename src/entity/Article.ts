import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

import { User } from './User'
import { Favorites } from './Favorites'
import { Comment } from './Comment'

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'char', length: 100, nullable: true })
  title?: string

  @Column({ type: 'char', length: 200, nullable: true })
  imageUrl?: string

  @Column({ type: 'int', nullable: true })
  category?: number

  @Column({ type: 'char', length: 200, nullable: true })
  abstract?: string

  @Column({ type: 'json', nullable: true })
  content?: JSON

  @Column({ type: 'int', nullable: true })
  userId?: number

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date

  @ManyToOne(() => User, (user) => user.article, { cascade: true })
  @JoinColumn({ name: 'userId' })
  user?: User

  @OneToMany(() => Favorites, (favorites) => favorites.article)
  favorites?: Favorites[]

  @OneToMany(() => Comment, (comment) => comment.article)
  comment?: Comment[]
}
