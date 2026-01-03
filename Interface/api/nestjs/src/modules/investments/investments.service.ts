import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PlaceOrderDto, OrderTypeDto } from './dto/place-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { InvestmentOrderRepository } from '@infrastructure/database/postgresql/InvestmentOrderRepository';
import { StockRepository } from '@infrastructure/database/postgresql/StockRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { UserId } from '@domain/value-objects/UserId';
import { AccountId } from '@domain/value-objects/AccountId';
import { StockId } from '@domain/value-objects/StockId';
import { InvestmentOrderId } from '@domain/value-objects/InvestmentOrderId';
import { InvestmentOrder, OrderType } from '@domain/entities/InvestmentOrder';
import { Money } from '@domain/value-objects/Money';

@Injectable()
export class InvestmentsService {
  private readonly TRANSACTION_FEE = 1.00;

  constructor(
    private readonly investmentOrderRepository: InvestmentOrderRepository,
    private readonly stockRepository: StockRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async placeOrder(userId: string, placeOrderDto: PlaceOrderDto) {
    try {
      const userIdVO = UserId.fromString(userId);
      const accountIdVO = new AccountId(placeOrderDto.accountId);
      const stockIdVO = StockId.fromNumber(placeOrderDto.stockId);

      const account = await this.accountRepository.findById(accountIdVO);
      if (!account) {
        throw new NotFoundException('Compte non trouvé');
      }
      if (account.userId.value !== userId) {
        throw new ForbiddenException('Accès interdit à ce compte');
      }

      const stock = await this.stockRepository.findById(stockIdVO);
      if (!stock) {
        throw new NotFoundException('Action non trouvée');
      }
      if (!stock.canBeTraded()) {
        throw new BadRequestException('Cette action n est pas disponible à la négociation');
      }

      let order: InvestmentOrder;
      if (placeOrderDto.orderType === OrderTypeDto.BUY) {
        order = InvestmentOrder.createBuyOrder({
          userId: userIdVO,
          accountId: accountIdVO,
          stockId: stockIdVO,
          quantity: placeOrderDto.quantity,
          pricePerShare: stock.currentPrice,
          transactionFee: this.TRANSACTION_FEE,
        });

        if (!account.hasEnoughBalance(order.totalAmount)) {
          throw new BadRequestException('Solde insuffisant pour cet achat');
        }

        account.debit(order.totalAmount);
      } else {
        order = InvestmentOrder.createSellOrder({
          userId: userIdVO,
          accountId: accountIdVO,
          stockId: stockIdVO,
          quantity: placeOrderDto.quantity,
          pricePerShare: stock.currentPrice,
          transactionFee: this.TRANSACTION_FEE,
        });

        const userStockHistory = await this.investmentOrderRepository.findStockOrderHistory(stockIdVO);

        // Calculate net holdings from order history
        let netHoldings = 0;
        for (const order of userStockHistory) {
          if (order.userId.value === userId) {
            if (order.orderType === OrderType.BUY) {
              netHoldings += order.quantity;
            } else {
              netHoldings -= order.quantity;
            }
          }
        }

        if (netHoldings < placeOrderDto.quantity) {
          throw new BadRequestException(`Vous ne possédez que ${netHoldings} actions de ${stock.symbol}`);
        }

        account.credit(order.totalAmount);
      }

      await this.accountRepository.save(account);
      await this.investmentOrderRepository.save(order);

      order.execute();
      await this.investmentOrderRepository.save(order);

      return {
        id: order.id.value,
        userId: order.userId.value,
        accountId: order.accountId.value,
        stockId: order.stockId.value,
        orderType: order.orderType,
        quantity: order.quantity,
        pricePerShare: order.pricePerShare.amount,
        totalAmount: order.totalAmount.amount,
        fees: order.fees.amount,
        status: order.status,
        executedAt: order.executedAt,
        createdAt: order.createdAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la création de l ordre');
    }
  }

  async cancelOrder(userId: string, cancelOrderDto: CancelOrderDto) {
    const orderId = InvestmentOrderId.fromNumber(cancelOrderDto.orderId);
    const order = await this.investmentOrderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Ordre non trouvé');
    }

    if (order.userId.value !== userId) {
      throw new ForbiddenException('Accès interdit à cet ordre');
    }

    if (!order.canBeCancelled()) {
      throw new BadRequestException('Cet ordre ne peut pas être annulé');
    }

    order.cancel();
    await this.investmentOrderRepository.save(order);

    return {
      message: 'Ordre annulé avec succès',
      orderId: order.id.value,
      status: order.status,
    };
  }

  async getStocks(availableOnly: boolean = true) {
    const stocks = await this.stockRepository.findAll(availableOnly);

    return stocks.map(stock => ({
      id: stock.id.value,
      symbol: stock.symbol,
      companyName: stock.companyName,
      currentPrice: stock.currentPrice.amount,
      currency: stock.currentPrice.currency,
      isAvailable: stock.isAvailable,
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt,
    }));
  }

  async getPortfolio(userId: string) {
    const userIdVO = UserId.fromString(userId);
    const orders = await this.investmentOrderRepository.findExecutedOrdersByUserId(userIdVO);

    const portfolioMap = new Map<number, any>();

    for (const order of orders) {
      const stockIdValue = parseInt(order.stockId.value);

      if (!portfolioMap.has(stockIdValue)) {
        const stock = await this.stockRepository.findById(order.stockId);

        portfolioMap.set(stockIdValue, {
          stockId: stockIdValue,
          symbol: stock?.symbol || 'UNKNOWN',
          companyName: stock?.companyName || 'Unknown Company',
          currentPrice: stock?.currentPrice.amount || 0,
          quantity: 0,
          averagePurchasePrice: 0,
          totalCost: 0,
          currentValue: 0,
          profitLoss: 0,
          profitLossPercentage: 0,
        });
      }

      const position = portfolioMap.get(stockIdValue)!;

      if (order.orderType === OrderType.BUY) {
        position.quantity += order.quantity;
        position.totalCost += order.totalAmount.amount;
      } else {
        position.quantity -= order.quantity;
        position.totalCost -= order.totalAmount.amount;
      }
    }

    const portfolio = Array.from(portfolioMap.values()).filter(pos => pos.quantity > 0);

    for (const position of portfolio) {
      position.averagePurchasePrice = position.totalCost / position.quantity;
      position.currentValue = position.currentPrice * position.quantity;
      position.profitLoss = position.currentValue - position.totalCost;
      position.profitLossPercentage = (position.profitLoss / position.totalCost) * 100;
    }

    return portfolio;
  }
}
