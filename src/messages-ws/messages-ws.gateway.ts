import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/intrefaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,

    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    // console.log('ahora', payload);
    this.wss.emit('client-list', this.messagesWsService.getConnectedClients());
    console.log('Clientes conectados', {
      data: this.messagesWsService.getConnectedClients(),
      token,
    });

    // throw new Error('Method not implemented.');
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    console.log('Cliente desconectado', client.id);
    //throw new Error('Method not implemented.');
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    //! Emite unicamente al cliente
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload,
    // });

    //! Emitir a todos MENOS, al cliente
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload,
    // });

    //! Emitir a todos
    console.log(payload);
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message,
    });
  }
}
