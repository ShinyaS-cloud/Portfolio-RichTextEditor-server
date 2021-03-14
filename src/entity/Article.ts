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

import { Users } from './Users'
import { Favorites } from './Favorites'

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

  @Column({ type: 'json', nullable: true })
  content?: JSON

  @Column({ type: 'int', nullable: true })
  usersId?: number

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date

  @ManyToOne(() => Users, (users) => users.article, { cascade: true })
  @JoinColumn({ name: 'usersId' })
  users?: Users

  @OneToMany(() => Favorites, (favorites) => favorites.article)
  favorites?: Favorites[]
}
