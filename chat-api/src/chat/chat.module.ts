import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ChatGateway } from './chat.gateway';
import { RoomEntity } from './model/room.entity';
import { RoomService } from './room.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity]), AuthModule, UserModule],
  providers: [ChatGateway, RoomService],
})
export class ChatModule {}
