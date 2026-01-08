import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SocketGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Join a user-specific room
  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    const roomName = `user:${data.userId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} joined room: ${roomName}`);
    return { event: 'joined', data: { room: roomName } };
  }

  // Join a conversation room
  @SubscribeMessage('join-conversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `conversation:${data.conversationId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} joined conversation: ${roomName}`);
    return { event: 'conversation-joined', data: { conversationId: data.conversationId } };
  }

  // Leave a conversation room
  @SubscribeMessage('leave-conversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `conversation:${data.conversationId}`;
    client.leave(roomName);
    this.logger.log(`Client ${client.id} left conversation: ${roomName}`);
    return { event: 'conversation-left', data: { conversationId: data.conversationId } };
  }

  // Typing indicators
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @MessageBody() data: { conversationId: string; userId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `conversation:${data.conversationId}`;
    client.to(roomName).emit('typing:start', {
      conversationId: data.conversationId,
      userId: data.userId,
      userName: data.userName,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `conversation:${data.conversationId}`;
    client.to(roomName).emit('typing:stop', {
      conversationId: data.conversationId,
      userId: data.userId,
    });
  }

  // Internal messages typing indicators
  @SubscribeMessage('internal_typing:start')
  handleInternalTypingStart(
    @MessageBody() data: { userId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to('staff').emit('internal_typing:start', {
      userId: data.userId,
      userName: data.userName,
    });
  }

  @SubscribeMessage('internal_typing:stop')
  handleInternalTypingStop(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to('staff').emit('internal_typing:stop', {
      userId: data.userId,
    });
  }

  // Helper methods to emit events from services

  /**
   * Emit a new message event to a conversation
   */
  emitNewMessage(conversationId: string, message: any) {
    this.server.to(`conversation:${conversationId}`).emit('message:new', message);
    this.logger.log(`New message emitted to conversation: ${conversationId}`);
  }

  /**
   * Emit a message read event
   */
  emitMessageRead(conversationId: string, data: any) {
    this.server.to(`conversation:${conversationId}`).emit('message:read', data);
  }

  /**
   * Emit stock price update
   */
  emitStockPriceUpdate(stockId: number, price: number) {
    this.server.emit('stock:price-update', { stockId, price });
    this.logger.log(`Stock price update emitted: ${stockId} -> ${price}`);
  }

  /**
   * Emit notification to a specific user
   */
  emitNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Notification sent to user: ${userId}`);
  }

  /**
   * Emit notification to all advisors
   */
  emitNotificationToAdvisors(notification: any) {
    this.server.to('advisors').emit('notification', notification);
    this.logger.log('Notification sent to all advisors');
  }

  /**
   * Emit notification to all staff (advisors + directors)
   */
  emitNotificationToStaff(notification: any) {
    this.server.to('staff').emit('notification', notification);
    this.logger.log('Notification sent to all staff');
  }
}
