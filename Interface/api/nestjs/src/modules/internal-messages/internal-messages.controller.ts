import { Controller, Get, Post, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { InternalMessagesService } from './internal-messages.service';
import { SendInternalMessageDto } from './dto/send-internal-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('internal-messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('advisor', 'director')
export class InternalMessagesController {
  constructor(private readonly internalMessagesService: InternalMessagesService) {}

  // POST /api/internal-messages - Envoyer un message interne
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser() user: any,
    @Body() sendMessageDto: SendInternalMessageDto,
  ) {
    return this.internalMessagesService.sendMessage(user.userId, sendMessageDto);
  }

  // GET /api/internal-messages?userId=X&type=group|direct&otherUserId=Y - Récupérer les messages
  @Get()
  async getMessages(
    @Query('userId') userId: string,
    @Query('type') type: 'group' | 'direct',
    @Query('otherUserId') otherUserId?: string,
  ) {
    return this.internalMessagesService.getMessages(userId, type || 'group', otherUserId);
  }
}

// GET /api/staff-members - Récupérer les membres du staff
@Controller('staff-members')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('advisor', 'director')
export class StaffMembersController {
  constructor(private readonly internalMessagesService: InternalMessagesService) {}

  @Get()
  async getStaffMembers() {
    return this.internalMessagesService.getStaffMembers();
  }
}
