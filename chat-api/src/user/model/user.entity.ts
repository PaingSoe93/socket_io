import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConnectedUserEntity } from '../../chat/model/connected-user.entity';
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

  @OneToMany(() => ConnectedUserEntity, (connections) => connections.user)
  connections: ConnectedUserEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  emailToLower() {
    this.email = this.email.toLocaleLowerCase();
    this.username = this.username.toLocaleLowerCase();
  }
}
