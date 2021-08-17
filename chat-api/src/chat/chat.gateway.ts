import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UserI } from '../user/model/user.interface';
import { UserService } from '../user/user.service';
import { ConnectedUserService } from './connected-user.service';
import { JoinedRoomService } from './joined-room.service';
import { MessageService } from './message.service';
import { ConnectedUserI } from './model/connected-user.interface';
import { JoinedRoomI } from './model/joined-room.interface';
import { MessageI } from './model/message.interface';
import { PageI } from './model/page.interface';
import { RoomI } from './model/room.interface';
import { RoomService } from './room.service';

@WebSocketGateway({ cors: { origin: ['https://hoppscotch.io'] } })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly roomService: RoomService,
    private readonly connectedUserService: ConnectedUserService,
    private readonly joinedRoomService: JoinedRoomService,
    private readonly messageService: MessageService,
  ) {}

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
    await this.joinedRoomService.deleteAll();
  }

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

        await this.connectedUserService.create({ socketId: socket.id, user });
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch (error) {
      this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) {
    await this.connectedUserService.deleteBySocketId(socket.id);
    console.log('disconnected');
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI) {
    const createdRoom: RoomI = await this.roomService.createRoom(
      room,
      socket.data.user,
    );
    for (const user of createdRoom.users) {
      const connections: ConnectedUserI[] =
        await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id, {
        page: 1,
        limit: 10,
      });
      rooms.meta.currentPage = rooms.meta.currentPage - 1;
      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }

  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(socket: Socket, page: PageI) {
    const rooms = await this.roomService.getRoomsForUser(
      socket.data.user.id,
      this.handleIncomingPageRequest(page),
    );
    rooms.meta.currentPage = rooms.meta.currentPage - 1;
    return this.server.to(socket.id).emit('rooms', rooms);
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, room: RoomI) {
    const messages = await this.messageService.findMessageForRoom(room, {
      page: 1,
      limit: 10,
    });

    await this.joinedRoomService.create({
      socketId: socket.id,
      user: socket.data.user,
      room,
    });

    await this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(socket: Socket) {
    await this.joinedRoomService.deleteBySocketId(socket.id);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageI) {
    const createdMessage: MessageI = await this.messageService.create({
      ...message,
      user: socket.data.user,
    });
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.id);
    const joinedUser: JoinedRoomI[] = await this.joinedRoomService.findByRoom(
      room,
    );
    //Send new Message to all joined Users of the room (currently online)
    for (const user of joinedUser) {
      await this.server.to(user.socketId).emit('messageAdded', createdMessage);
    }
  }

  // add page +1 to match angular material paginator
  private handleIncomingPageRequest(page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    page.page = page.page + 1;
    return page;
  }
}
