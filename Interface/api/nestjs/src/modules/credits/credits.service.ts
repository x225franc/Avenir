import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GrantCreditDto } from './dto/grant-credit.dto';
import { CalculateCreditDto } from './dto/calculate-credit.dto';
import { CreditRepository } from '@infrastructure/database/postgresql/CreditRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';
import { GrantCredit } from '@application/use-cases/credit/GrantCredit';
import { ProcessMonthlyPayments } from '@application/use-cases/credit/ProcessMonthlyPayments';
import { GetUserCredits } from '@application/use-cases/credit/GetUserCredits';
import { CreditCalculationService } from '@application/services/CreditCalculationService';

@Injectable()
export class CreditsService {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async grantCredit(advisorId: string, grantCreditDto: GrantCreditDto) {
    try {
      // Utiliser le Use Case GrantCredit
      const calculationService = new CreditCalculationService();
      const grantCreditUseCase = new GrantCredit(
        this.creditRepository,
        this.accountRepository,
        this.userRepository,
        calculationService
      );

      const result = await grantCreditUseCase.execute({
        userId: grantCreditDto.userId,
        accountId: grantCreditDto.accountId,
        advisorId: parseInt(advisorId),
        principalAmount: grantCreditDto.principalAmount,
        annualInterestRate: grantCreditDto.annualInterestRate,
        insuranceRate: grantCreditDto.insuranceRate,
        durationMonths: grantCreditDto.durationMonths,
      });

      if (!result.success) {
        throw new BadRequestException(result.message);
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de l\'octroi du crédit');
    }
  }

  async getUserCredits(userId: string) {
    try {
      // Utiliser le Use Case GetUserCredits
      const getUserCreditsUseCase = new GetUserCredits(this.creditRepository);

      const result = await getUserCreditsUseCase.execute({
        userId: parseInt(userId),
      });

      if (!result.success) {
        throw new BadRequestException('Erreur lors de la récupération des crédits');
      }

      return result;
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des crédits');
    }
  }

  async processMonthlyPayments() {
    try {
      // Utiliser le Use Case ProcessMonthlyPayments
      const processMonthlyPaymentsUseCase = new ProcessMonthlyPayments(
        this.creditRepository,
        this.accountRepository,
        this.transactionRepository
      );

      const result = await processMonthlyPaymentsUseCase.execute();

      if (!result.success) {
        throw new BadRequestException('Erreur lors du traitement des paiements mensuels');
      }

      return {
        totalProcessed: result.totalCredits,
        successful: result.processed,
        failed: result.failed,
        errors: result.errors,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors du traitement des paiements mensuels');
    }
  }

  calculateMonthlyPayment(calculateDto: CalculateCreditDto) {
    try {
      const calculationService = new CreditCalculationService();

      const totalCost = calculationService.calculateTotalCost(
        calculateDto.principalAmount,
        calculateDto.annualInterestRate,
        calculateDto.insuranceRate,
        calculateDto.durationMonths
      );

      return {
        success: true,
        ...totalCost,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors du calcul du crédit');
    }
  }
}
