import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ChatGateway } from './chat.gateway';
import { ConnectedUserEntity } from './model/connected-user.entity';
import { RoomEntity } from './model/room.entity';
import { RoomService } from './room.service';
import { ConnectedUserService } from './connected-user.service';
import { MessageEntity } from './model/message.entity';
import { JoinedRoomEntity } from './model/joined-room.entity';
import { JoinedRoomService } from './joined-room.service';
import { MessageService } from './message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomEntity,
      ConnectedUserEntity,
      MessageEntity,
      JoinedRoomEntity,
    ]),
    AuthModule,
    UserModule,
  ],
  providers: [
    ChatGateway,
    RoomService,
    ConnectedUserService,
    MessageService,
    JoinedRoomService,
  ],
})
export class ChatModule {}
