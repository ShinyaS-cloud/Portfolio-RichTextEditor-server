import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'

@Entity()
export class Follows {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: true })
  fromUserId?: number

  @Column({ type: 'int', nullable: true })
  toUserId?: number

  @ManyToOne(() => User, (fromUser) => fromUser.fromFollows, { cascade: true })
  @JoinColumn({ name: 'fromUserId' })
  fromUser?: User

  @ManyToOne(() => User, (toUser) => toUser.toFollows, { cascade: true })
  @JoinColumn({ name: 'toUserId' })
  toUser?: User
}
