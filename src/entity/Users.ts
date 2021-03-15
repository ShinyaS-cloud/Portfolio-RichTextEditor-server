import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm'
import { Article } from './Article'
import { Favorites } from './Favorites'
import { Profile } from './Profile'

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'char', length: 30, nullable: false })
  name!: string

  @Column({ type: 'char', length: 200, nullable: true })
  password?: string

  @Column({ type: 'char', length: 50, nullable: true })
  email?: string

  @Column({ type: 'char', length: 200, nullable: true })
  googleId?: string

  @Column({ type: 'boolean', nullable: false })
  loginGoogle!: boolean

  @OneToMany(() => Article, (article) => article.users)
  article?: Article[]

  @OneToMany(() => Favorites, (favorites) => favorites.users)
  favorites?: Favorites[]

  @OneToOne(() => Profile, (profile) => profile.users)
  profile?: Profile
}
