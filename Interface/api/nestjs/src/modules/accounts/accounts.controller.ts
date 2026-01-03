import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(user.userId, createAccountDto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    // Pour les utilisateurs normaux, retourner seulement leurs comptes
    // Pour les admins, retourner tous les comptes (à implémenter avec RolesGuard)
    return this.accountsService.findByUserId(user.userId);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.accountsService.findByUserId(userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.accountsService.findById(id, user.userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, user.userId, updateAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.accountsService.delete(id, user.userId);
  }
}
