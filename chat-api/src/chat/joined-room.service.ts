import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserI } from '../user/model/user.interface';
import { JoinedRoomEntity } from './model/joined-room.entity';
import { JoinedRoomI } from './model/joined-room.interface';
import { RoomI } from './model/room.interface';

@Injectable()
export class JoinedRoomService {
  constructor(
    @InjectRepository(JoinedRoomEntity)
    private readonly joinedRoomRepo: Repository<JoinedRoomEntity>,
  ) {}

  create(joinedRoom: JoinedRoomI): Promise<JoinedRoomI> {
    return this.joinedRoomRepo.save(joinedRoom);
  }

  findByUser(user: UserI): Promise<JoinedRoomI[]> {
    return this.joinedRoomRepo.find({ user });
  }

  findByRoom(room: RoomI): Promise<JoinedRoomI[]> {
    return this.joinedRoomRepo.find({ room });
  }

  deleteBySocketId(socketId: string) {
    return this.joinedRoomRepo.delete({ socketId });
  }

  async deleteAll() {
    await this.joinedRoomRepo.createQueryBuilder().delete().execute();
  }
}
