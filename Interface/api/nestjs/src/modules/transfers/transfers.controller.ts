import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { TransferDto } from '../transactions/dto/transfer.dto';
import { IbanTransferDto } from '../transactions/dto/iban-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Controller pour l'alias /transfers
 * Compatible avec l'API Express
 */
@Controller('transfers')
@UseGuards(JwtAuthGuard)
export class TransfersController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async transfer(
    @CurrentUser() user: any,
    @Body() transferDto: TransferDto,
  ) {
    return this.transactionsService.transfer(user.userId, transferDto);
  }

  @Get('account/:accountId')
  async getTransactionsByAccount(@Param('accountId') accountId: string) {
    return this.transactionsService.findByAccountId(accountId);
  }

  @Get()
  async getUserTransactions(@CurrentUser() user: any) {
    return this.transactionsService.findByUserId(user.userId);
  }

  @Get('iban/lookup/:iban')
  async getAccountByIban(@Param('iban') iban: string) {
    return this.transactionsService.lookupAccountByIban(iban);
  }

  @Post('iban')
  @HttpCode(HttpStatus.CREATED)
  async transferToIban(
    @CurrentUser() user: any,
    @Body() ibanTransferDto: IbanTransferDto,
  ) {
    return this.transactionsService.transferToExternalIban(user.userId, ibanTransferDto);
  }
}
