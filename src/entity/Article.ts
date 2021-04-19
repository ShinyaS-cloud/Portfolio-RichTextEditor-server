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

import { User, Favorites, Comment } from './Index'

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

  @Column({ type: 'boolean', nullable: false })
  isPublic?: boolean

  @Column({ type: 'int', nullable: true })
  userId?: number

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date

  @ManyToOne('User', 'article', {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user: User | undefined

  @OneToMany('Favorites', 'article')
  favorites: Favorites[] | undefined

  @OneToMany('Comment', 'article')
  comment: Comment[] | undefined
}
