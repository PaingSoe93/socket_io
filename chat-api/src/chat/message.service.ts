import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { MessageEntity } from './model/message.entity';
import { MessageI } from './model/message.interface';
import { RoomI } from './model/room.interface';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
  ) {}

  create(message: MessageI): Promise<MessageI> {
    return this.messageRepo.save(this.messageRepo.create(message));
  }

  findMessageForRoom(
    room: RoomI,
    options: IPaginationOptions,
  ): Promise<Pagination<MessageI>> {
    return paginate(this.messageRepo, options, {
      room,
      relations: ['user', 'room'],
    });
  }
}
