import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { UserI } from '../user/model/user.interface';
import { RoomEntity } from './model/room.entity';
import { RoomI } from './model/room.interface';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepo: Repository<RoomEntity>,
  ) {}

  async createRoom(room: RoomI, creator: UserI) {
    const newRoom = await this.addCreatorToRoom(room, creator);
    return this.roomRepo.save(newRoom);
  }

  async getRoomsForUser(
    userId: number,
    options: IPaginationOptions,
  ): Promise<Pagination<RoomI>> {
    const query = this.roomRepo
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.updated_at', 'DESC');
    return paginate(query, options);
  }

  async addCreatorToRoom(room: RoomI, creator: UserI): Promise<RoomI> {
    room.users.push(creator);
    return room;
  }
}
