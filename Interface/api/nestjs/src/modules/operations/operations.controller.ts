import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('operations')
@UseGuards(JwtAuthGuard)
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  async deposit(@CurrentUser() user: any, @Body() depositDto: DepositDto) {
    return this.operationsService.deposit(user.userId, depositDto);
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  async withdraw(@CurrentUser() user: any, @Body() withdrawDto: WithdrawDto) {
    return this.operationsService.withdraw(user.userId, withdrawDto);
  }
}
