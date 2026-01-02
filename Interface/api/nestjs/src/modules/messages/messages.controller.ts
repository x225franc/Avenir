import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { AssignConversationDto } from './dto/assign-conversation.dto';
import { TransferConversationDto } from './dto/transfer-conversation.dto';
import { CloseConversationDto } from './dto/close-conversation.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // POST /api/messages/send - Envoyer un message
  @Post('send')
  async sendMessage(
    @CurrentUser() user: any,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.userId, sendMessageDto);
  }

  // GET /api/messages/conversations - Obtenir toutes les conversations
  @Get('conversations')
  async getConversations(@CurrentUser() user: any) {
    return this.messagesService.getConversations(user.userId);
  }

  // GET /api/messages/conversation/:conversationId - Obtenir les messages d'une conversation
  @Get('conversation/:conversationId')
  async getConversationMessages(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagesService.getConversationMessages(conversationId, user.userId);
  }

  // POST /api/messages/assign - Assigner une conversation à un conseiller
  @Post('assign')
  @Roles('advisor', 'director')
  async assignConversation(@Body() assignDto: AssignConversationDto) {
    return this.messagesService.assignConversation(assignDto);
  }

  // POST /api/messages/transfer - Transférer une conversation à un autre conseiller
  @Post('transfer')
  @Roles('advisor', 'director')
  async transferConversation(@Body() transferDto: TransferConversationDto) {
    return this.messagesService.transferConversation(transferDto);
  }

  // POST /api/messages/close - Fermer une conversation
  @Post('close')
  @Roles('advisor', 'director')
  async closeConversation(@Body() closeDto: CloseConversationDto) {
    return this.messagesService.closeConversation(closeDto);
  }

  // POST /api/messages/mark-read - Marquer les messages comme lus
  @Post('mark-read')
  async markAsRead(
    @CurrentUser() user: any,
    @Body() markReadDto: MarkReadDto,
  ) {
    return this.messagesService.markAsRead(user.userId, markReadDto);
  }

  // GET /api/messages/check-open/:clientId - Vérifier si un client a une conversation ouverte
  @Get('check-open/:clientId')
  @Roles('advisor', 'director')
  async checkOpenConversation(@Param('clientId') clientId: string) {
    return this.messagesService.checkOpenConversation(clientId);
  }
}
