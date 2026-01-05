import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post('place-order')
  async placeOrder(
    @CurrentUser() user: any,
    @Body() placeOrderDto: PlaceOrderDto,
  ) {
    return this.investmentsService.placeOrder(user.userId, placeOrderDto);
  }

  @Post('cancel-order')
  async cancelOrder(
    @CurrentUser() user: any,
    @Body() cancelOrderDto: CancelOrderDto,
  ) {
    return this.investmentsService.cancelOrder(user.userId, cancelOrderDto);
  }

  @Get('stocks')
  async getStocks(@Query('availableOnly') availableOnly?: string) {
    const available = availableOnly === 'false' ? false : true;
    return this.investmentsService.getStocks(available);
  }

  @Get('portfolio')
  async getPortfolio(@CurrentUser() user: any) {
    return this.investmentsService.getPortfolio(user.userId);
  }

  @Get('fee')
  async getFee() {
    // Retourner les frais de transaction fixes
    return {
      transactionFee: 1.00,
      currency: 'EUR',
    };
  }

  @Get('orders')
  async getUserOrders(@CurrentUser() user: any) {
    return this.investmentsService.getUserOrders(user.userId);
  }
}
