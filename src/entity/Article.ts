import { Entity, PrimaryGeneratedColumn, OneToMany, JoinColumn, Column, ManyToOne } from 'typeorm'

import { Posts } from './Posts'
import { Favorites } from './Favorites'

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'char', length: 100, nullable: true })
  title?: string

  @Column({ type: 'char', length: 100, nullable: true })
  imageUrl?: string

  @Column({ type: 'int', nullable: true })
  category?: number

  @Column({ type: 'json', nullable: true })
  content?: JSON

  @Column({ type: 'int', nullable: true })
  postsId?: number

  @ManyToOne(() => Posts, (posts) => posts.article)
  @JoinColumn({ name: 'postsId' })
  posts?: Posts

  @OneToMany(() => Favorites, (favorites) => favorites.article)
  favorites?: Favorites[]
}
