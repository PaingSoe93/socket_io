import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [AuthModule, UserModule],
  providers: [ChatGateway],
})
export class ChatModule {}
