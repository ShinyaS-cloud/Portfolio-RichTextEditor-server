import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm'

import { User } from './Index'

@Entity()
export class AuthUser {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'char', length: 200, nullable: true })
  password?: string

  @Column({ type: 'char', length: 50, nullable: true })
  email?: string

  @Column({ type: 'char', length: 200, nullable: true })
  googleId?: string

  @Column({ type: 'char', length: 200, nullable: true })
  cognitoId?: string

  @OneToOne('User', 'authUser')
  user: User | undefined
}
