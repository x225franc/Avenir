import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser() user: any,
    @Body() sendMessageDto: SendInternalMessageDto,
  ) {
    return this.internalMessagesService.sendMessage(user.userId, sendMessageDto);
  }

  @Get(':userId')
  async getMessages(
    @CurrentUser() user: any,
    @Param('userId') otherUserId: string,
  ) {
    return this.internalMessagesService.getMessages(user.userId, otherUserId);
  }

  @Get('staff/members')
  async getStaffMembers() {
    return this.internalMessagesService.getStaffMembers();
  }
}
