import { UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { paginate } from 'nestjs-typeorm-paginate';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UserI } from '../user/model/user.interface';
import { UserService } from '../user/user.service';
import { PageI } from './model/page.interface';
import { RoomI } from './model/room.interface';
import { RoomService } from './room.service';

@WebSocketGateway({ cors: { origin: ['https://hoppscotch.io'] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly roomService: RoomService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      let decodedToken = await this.authService.verifyJwt(
        socket.handshake.headers.authorization,
      );
      const user: UserI = await this.userService.findOne(decodedToken.user.id);
      if (!user) {
        this.disconnect(socket);
      } else {
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id, {
          page: 1,
          limit: 10,
        });
        rooms.meta.currentPage = rooms.meta.currentPage - 1;
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch (error) {
      this.disconnect(socket);
    }
  }

  handleDisconnect() {
    console.log('disconnected');
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI): Promise<RoomI> {
    return this.roomService.createRoom(room, socket.data.user);
  }

  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(socket: Socket, page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    page.page = page.page + 1;
    const rooms = await this.roomService.getRoomsForUser(
      socket.data.user.id,
      page,
    );
    rooms.meta.currentPage = rooms.meta.currentPage - 1;
    return this.server.to(socket.id).emit('rooms', rooms);
  }
}
