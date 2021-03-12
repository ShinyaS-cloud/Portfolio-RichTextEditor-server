import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm'
import { Posts } from './Posts'
import { Favorites } from './Favorites'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'char', length: 30, nullable: true })
  name?: string

  @Column({ type: 'char', length: 200, nullable: true })
  password?: string

  @Column({ type: 'char', length: 50, nullable: true })
  email?: string

  @Column({ type: 'int', nullable: true })
  postsId?: number

  @Column({ type: 'char', length: 200, nullable: true })
  googleId?: string

  @Column({ type: 'boolean', nullable: false })
  loginGoogle!: boolean

  @OneToOne(() => Posts, (posts) => posts.user)
  @JoinColumn({ name: 'postsId' })
  posts?: Posts

  @OneToMany(() => Favorites, (favorites) => favorites.user)
  favorites!: Favorites[]
}
