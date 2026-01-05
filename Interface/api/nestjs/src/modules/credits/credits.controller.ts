import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { GrantCreditDto } from './dto/grant-credit.dto';
import { CalculateCreditDto } from './dto/calculate-credit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('credits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Post('grant')
  @Roles('advisor', 'director')
  async grantCredit(
    @CurrentUser() user: any,
    @Body() grantCreditDto: GrantCreditDto,
  ) {
    return this.creditsService.grantCredit(user.userId, grantCreditDto);
  }

  @Get('user/:userId')
  async getUserCredits(@Param('userId') userId: string) {
    return this.creditsService.getUserCredits(userId);
  }

  @Post('process-monthly-payments')
  @Roles('director')
  async processMonthlyPayments() {
    return this.creditsService.processMonthlyPayments();
  }

  @Post('calculate')
  async calculateCredit(@Body() calculateDto: CalculateCreditDto) {
    return this.creditsService.calculateMonthlyPayment(calculateDto);
  }
}
