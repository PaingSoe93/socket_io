import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ChatGateway } from './chat.gateway';
import { ConnectedUserEntity } from './model/connected-user.entity';
import { RoomEntity } from './model/room.entity';
import { RoomService } from './room.service';
import { ConnectedUserService } from './connected-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomEntity, ConnectedUserEntity]),
    AuthModule,
    UserModule,
  ],
  providers: [ChatGateway, RoomService, ConnectedUserService],
})
export class ChatModule {}
