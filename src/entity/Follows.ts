import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './Index.js'

@Entity()
export class Follows {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'int', nullable: true })
  fromUserId?: number

  @Column({ type: 'int', nullable: true })
  toUserId?: number

  @ManyToOne('User', 'fromFollows', {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'fromUserId' })
  fromUser?: User | undefined

  @ManyToOne('User', 'toFollows', {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'toUserId' })
  toUser?: User | undefined
}
