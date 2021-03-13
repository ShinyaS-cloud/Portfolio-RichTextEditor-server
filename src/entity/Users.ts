import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm'
import { Article } from './Article'
import { Favorites } from './Favorites'

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'char', length: 30, nullable: true })
  name?: string

  @Column({ type: 'char', length: 200, nullable: true })
  password?: string

  @Column({ type: 'char', length: 50, nullable: true })
  email?: string

  @Column({ type: 'char', length: 200, nullable: true })
  googleId?: string

  @Column({ type: 'boolean', nullable: false })
  loginGoogle!: boolean

  @OneToMany(() => Article, (article) => article.users)
  @JoinColumn({ name: 'articleId' })
  article?: Article[]

  @OneToMany(() => Favorites, (favorites) => favorites.users)
  favorites!: Favorites[]
}
