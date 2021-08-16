import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoomEntity } from '../../chat/model/room.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ unique: true })
  email: string;

  @ManyToMany(() => RoomEntity)
  @JoinTable({ name: 'room_user' })
  rooms: RoomEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  emailToLower() {
    this.email = this.email.toLocaleLowerCase();
    this.username = this.username.toLocaleLowerCase();
  }
}
