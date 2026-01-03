import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { UpdateSavingsRateDto } from './dto/update-savings-rate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('director')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============ STATS ============

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  // ============ TEAM MANAGEMENT ============

  @Get('team-members')
  async getTeamMembers() {
    return this.adminService.getTeamMembers();
  }

  // ============ USER MANAGEMENT (7 endpoints) ============

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/ban')
  async banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Patch('users/:id/unban')
  async unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  // ============ STOCK MANAGEMENT (4 endpoints) ============

  @Get('stocks')
  async getAllStocks() {
    return this.adminService.getAllStocks();
  }

  @Post('stocks')
  async createStock(@Body() createStockDto: CreateStockDto) {
    return this.adminService.createStock(createStockDto);
  }

  @Put('stocks/:id')
  async updateStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.adminService.updateStock(id, updateStockDto);
  }

  @Delete('stocks/:id')
  async deleteStock(@Param('id') id: string) {
    return this.adminService.deleteStock(id);
  }

  // ============ BANK SETTINGS (5 endpoints) ============

  @Post('apply-interest')
  async applyInterest() {
    return this.adminService.applyInterest();
  }

  @Post('test-interest')
  async testInterest() {
    return this.adminService.testInterest();
  }

  @Put('savings-rate')
  async updateSavingsRate(@Body() updateSavingsRateDto: UpdateSavingsRateDto) {
    return this.adminService.updateSavingsRate(updateSavingsRateDto);
  }

  @Get('savings-rate')
  async getSavingsRate() {
    return this.adminService.getSavingsRate();
  }

  @Get('cron-status')
  async getCronStatus() {
    return this.adminService.getCronStatus();
  }
}
