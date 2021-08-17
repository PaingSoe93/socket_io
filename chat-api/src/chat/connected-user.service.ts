import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserI } from '../user/model/user.interface';
import { ConnectedUserEntity } from './model/connected-user.entity';
import { ConnectedUserI } from './model/connected-user.interface';

@Injectable()
export class ConnectedUserService {
  constructor(
    @InjectRepository(ConnectedUserEntity)
    private readonly connectedUserRepo: Repository<ConnectedUserEntity>,
  ) {}

  create(connectedUser: ConnectedUserI): Promise<ConnectedUserI> {
    return this.connectedUserRepo.save(connectedUser);
  }

  findByUser(user: UserI): Promise<ConnectedUserI[]> {
    return this.connectedUserRepo.find({ user });
  }

  deleteBySocketId(socketId: string) {
    return this.connectedUserRepo.delete({ socketId });
  }

  async deleteAll() {
    await this.connectedUserRepo.createQueryBuilder().delete().execute();
  }
}
