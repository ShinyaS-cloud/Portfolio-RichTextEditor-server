import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm'
import { Users } from './Users'

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'char', length: 40, nullable: true })
  name?: string

  @Column({ type: 'char', length: 200, nullable: true })
  introduction?: string

  @Column({ type: 'int', nullable: true })
  usersId?: number

  @Column({ type: 'date', nullable: true })
  birthDay?: Date

  @OneToOne(() => Users, (users) => users.profile)
  @JoinColumn({ name: 'usersId' })
  users?: Users
}
