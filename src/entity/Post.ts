import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn, Column } from 'typeorm'
import { User } from './User'
import { Posts } from './Posts'
import { Favorites } from './Favorites'

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'char', length: 100, nullable: false })
  title!: string

  @Column({ type: 'char', length: 100, nullable: true })
  imageUrl?: string

  @Column({ type: 'int', nullable: false })
  category!: number

  @Column({ type: 'json', nullable: false })
  content!: JSON

  @Column({ type: 'int', nullable: true })
  userId!: number

  @OneToOne(() => User, (user) => user.post, { cascade: true })
  @JoinColumn({ name: 'userId' })
  user?: User

  @OneToMany(() => Posts, (posts) => posts.post)
  posts!: Posts[]

  @OneToMany(() => Favorites, (favorites) => favorites.post)
  favorites!: Favorites[]
}
