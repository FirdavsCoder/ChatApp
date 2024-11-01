import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';

@WebSocketGateway(3002, {
  cors: {
    origin: '*', // yoki kerakli domen
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  handleConnection(client: Socket) {
    console.log(`Client connected ${client.id}`);

    client.broadcast.emit('user-joined', {
      message: `New User joined the chat: ${client.id}`,
    });

    // this.server.emit('user-joined', {
    //   message: `New User joined the chat: ${client.id}`,
    // });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected ${client.id}`);

    this.server.emit('user-left', {
      message: `User left the chat: ${client.id}`,
    });
  }

  @SubscribeMessage('newMessage')
  handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: string,
  ) {
    client.broadcast.emit('message', message);
    // this.server.emit('message', message);
  }

  @SubscribeMessage('user-typing')
  handleUserTyping(@MessageBody() data: { username: string }) {
    this.server.emit('user-typing', data);
  }

  @SubscribeMessage('stop-typing')
  handleStopTyping(@MessageBody() data: { username: string }) {
    this.server.emit('stop-typing', data);
  }
}
