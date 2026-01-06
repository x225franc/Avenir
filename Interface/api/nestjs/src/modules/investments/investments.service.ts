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
        throw new BadRequestException(result.errors?.join(', ') || result.message);
      }

      // Format standardisé compatible avec Express
      return {
        success: true,
        data: { orderId: result.orderId },
        message: result.message,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Erreur interne du serveur');
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
        throw new BadRequestException(result.errors?.join(', ') || result.message);
      }

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Erreur interne du serveur');
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
        throw new BadRequestException(result.errors?.join(', ') || result.message);
      }

      // Format standardisé compatible avec Express
      return {
        success: true,
        data: result.stocks,
        message: result.message,
      };
    } catch (error) {
      throw new BadRequestException('Erreur interne du serveur');
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
        throw new BadRequestException(result.errors?.join(', ') || result.message);
      }

      // Format standardisé compatible avec Express
      return {
        success: true,
        data: result.portfolio,
        message: result.message,
      };
    } catch (error) {
      throw new BadRequestException('Erreur interne du serveur');
    }
  }

  async getUserOrders(userId: string) {
    const userIdVO = UserId.fromString(userId);
    const orders = await this.investmentOrderRepository.findByUserId(userIdVO);

    // Format standardisé compatible avec Express
    // toJSON() retourne toutes les propriétés de l'ordre (id, stockId, orderType, quantity, etc.)
    return {
      success: true,
      data: orders.map(order => order.toJSON()),
      message: `${orders.length} ordre(s) trouvé(s)`,
    };
  }

  async getInvestmentFee() {
    try {
      const fee = await this.bankSettingsRepository.getInvestmentFee();

      // Format standardisé compatible avec Express
      return {
        success: true,
        data: { fee },
        message: 'Frais d\'investissement récupérés avec succès',
      };
    } catch (error) {
      throw new BadRequestException('Erreur interne du serveur');
    }
  }
}
