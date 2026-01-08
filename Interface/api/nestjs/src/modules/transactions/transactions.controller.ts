import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';
import { IbanTransferDto } from './dto/iban-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  @HttpCode(HttpStatus.CREATED)
  async transfer(
    @CurrentUser() user: any,
    @Body() transferDto: TransferDto,
  ) {
    return this.transactionsService.transfer(user.userId, transferDto);
  }

  @Get()
  async findByUser(@CurrentUser() user: any) {
    return this.transactionsService.findByUserId(user.userId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin', 'director')
  async findAll() {
    return this.transactionsService.findAll();
  }

  @Get('by-status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'director', 'advisor')
  async findByStatus(@Query('status') status: string) {
    return this.transactionsService.findByStatus(status);
  }

  @Get('account/:accountId')
  async findByAccountId(@Param('accountId') accountId: string) {
    return this.transactionsService.findByAccountId(accountId);
  }

  @Get('iban/lookup/:iban')
  async lookupAccountByIban(@Param('iban') iban: string) {
    return this.transactionsService.lookupAccountByIban(iban);
  }

  @Post('iban')
  @HttpCode(HttpStatus.CREATED)
  async transferToExternalIban(
    @CurrentUser() user: any,
    @Body() ibanTransferDto: IbanTransferDto,
  ) {
    return this.transactionsService.transferToExternalIban(user.userId, ibanTransferDto);
  }
}
