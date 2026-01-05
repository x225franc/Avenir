import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PlaceOrderDto, OrderTypeDto } from './dto/place-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { InvestmentOrderRepository } from '@infrastructure/database/postgresql/InvestmentOrderRepository';
import { StockRepository } from '@infrastructure/database/postgresql/StockRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';
import { BankSettingsRepository } from '@infrastructure/database/postgresql/BankSettingsRepository';
import { UserId } from '@domain/value-objects/UserId';
import { PlaceInvestmentOrder } from '@application/use-cases/investment/PlaceInvestmentOrder';
import { CancelInvestmentOrder } from '@application/use-cases/investment/CancelInvestmentOrder';
import { GetUserPortfolio } from '@application/use-cases/investment/GetUserPortfolio';
import { GetAvailableStocks } from '@application/use-cases/investment/GetAvailableStocks';

@Injectable()
export class InvestmentsService {
  constructor(
    private readonly investmentOrderRepository: InvestmentOrderRepository,
    private readonly stockRepository: StockRepository,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly bankSettingsRepository: BankSettingsRepository,
  ) {}

  async placeOrder(userId: string, placeOrderDto: PlaceOrderDto) {
    try {
      // Utiliser le Use Case PlaceInvestmentOrder
      const placeOrderUseCase = new PlaceInvestmentOrder(
        this.accountRepository,
        this.stockRepository,
        this.investmentOrderRepository,
        this.transactionRepository,
        this.bankSettingsRepository
      );

      const orderType = placeOrderDto.orderType === OrderTypeDto.BUY ? 'buy' : 'sell';

      const result = await placeOrderUseCase.execute({
        userId,
        accountId: placeOrderDto.accountId.toString(),
        stockId: placeOrderDto.stockId.toString(),
        orderType,
        quantity: placeOrderDto.quantity,
      });

      if (!result.success) {
        throw new BadRequestException(result.errors.join(', ') || result.message);
      }

      return {
        orderId: result.orderId,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la création de l ordre');
    }
  }

  async cancelOrder(userId: string, cancelOrderDto: CancelOrderDto) {
    try {
      // Utiliser le Use Case CancelInvestmentOrder
      const cancelOrderUseCase = new CancelInvestmentOrder(
        this.investmentOrderRepository,
        this.accountRepository
      );

      const result = await cancelOrderUseCase.execute({
        userId,
        orderId: cancelOrderDto.orderId.toString(),
      });

      if (!result.success) {
        throw new BadRequestException(result.errors.join(', ') || result.message);
      }

      return {
        message: result.message,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de l\'annulation de l\'ordre');
    }
  }

  async getStocks(availableOnly: boolean = true) {
    try {
      // Utiliser le Use Case GetAvailableStocks
      const getStocksUseCase = new GetAvailableStocks(
        this.stockRepository,
        this.bankSettingsRepository
      );

      const result = await getStocksUseCase.execute(!availableOnly);

      if (!result.success) {
        throw new BadRequestException(result.errors.join(', ') || result.message);
      }

      return result.stocks;
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des actions');
    }
  }

  async getPortfolio(userId: string) {
    try {
      // Utiliser le Use Case GetUserPortfolio
      const getPortfolioUseCase = new GetUserPortfolio(
        this.investmentOrderRepository,
        this.stockRepository
      );

      const result = await getPortfolioUseCase.execute({ userId });

      if (!result.success) {
        throw new BadRequestException(result.errors.join(', ') || result.message);
      }

      return result.portfolio;
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération du portefeuille');
    }
  }

  async getUserOrders(userId: string) {
    const userIdVO = UserId.fromString(userId);
    const orders = await this.investmentOrderRepository.findByUserId(userIdVO);

    return orders.map(order => ({
      id: order.id.value,
      stockId: order.stockId.value,
      stockSymbol: (order as any).stockSymbol || 'UNKNOWN',
      companyName: (order as any).companyName || 'Unknown Company',
      orderType: order.orderType,
      quantity: order.quantity,
      pricePerShare: order.pricePerShare.amount,
      totalAmount: order.totalAmount.amount,
      fees: order.fees.amount,
      status: order.status,
      executedAt: order.executedAt,
      createdAt: order.createdAt,
    }));
  }
}
