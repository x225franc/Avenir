import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdvisorService } from './advisor.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('advisor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdvisorController {
  constructor(private readonly advisorService: AdvisorService) {}

  @Get('advisors')
  async getAllAdvisors() {
    return this.advisorService.getAllAdvisors();
  }

  @Get('clients')
  @Roles('advisor', 'director')
  async getAdvisorClients(@CurrentUser() user: any) {
    return this.advisorService.getAdvisorClients(user.userId);
  }

  @Get('transactions')
  @Roles('advisor', 'director')
  async getAdvisorTransactions(@CurrentUser() user: any) {
    return this.advisorService.getAdvisorTransactions(user.userId);
  }

  @Get('transactions/pending')
  @Roles('advisor', 'director')
  async getPendingTransactions(@CurrentUser() user: any) {
    return this.advisorService.getPendingTransactions(user.userId);
  }

  @Patch('transactions/:id/approve')
  @Roles('advisor', 'director')
  async approveTransaction(@CurrentUser() user: any, @Param('id') id: string) {
    return this.advisorService.approveTransaction(user.userId, id);
  }

  @Patch('transactions/:id/reject')
  @Roles('advisor', 'director')
  async rejectTransaction(@CurrentUser() user: any, @Param('id') id: string) {
    return this.advisorService.rejectTransaction(user.userId, id);
  }

  @Post('notify-client')
  @Roles('advisor', 'director')
  async notifyClient(
    @CurrentUser() user: any,
    @Body() body: { clientId: string; subject: string; message: string },
  ) {
    return this.advisorService.notifyClient(user.userId, body.clientId, body.subject, body.message);
  }
}
