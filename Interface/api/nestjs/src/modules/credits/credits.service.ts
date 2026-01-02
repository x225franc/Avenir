import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GrantCreditDto } from './dto/grant-credit.dto';
import { CreditRepository } from '@infrastructure/database/postgresql/CreditRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { UserId } from '@domain/value-objects/UserId';
import { AccountId } from '@domain/value-objects/AccountId';
import { Money } from '@domain/value-objects/Money';
import { Credit } from '@domain/entities/Credit';
import { CreditId } from '@domain/value-objects/CreditId';

@Injectable()
export class CreditsService {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async grantCredit(advisorId: string, grantCreditDto: GrantCreditDto) {
    try {
      const advisorIdVO = UserId.fromString(advisorId);
      const userIdVO = UserId.fromNumber(grantCreditDto.userId);
      const accountIdVO = AccountId.fromNumber(grantCreditDto.accountId);

      // Verify account exists and belongs to user
      const account = await this.accountRepository.findById(accountIdVO);
      if (!account) {
        throw new NotFoundException('Compte non trouvé');
      }

      if (account.userId.value !== grantCreditDto.userId.toString()) {
        throw new BadRequestException('Le compte n appartient pas à cet utilisateur');
      }

      // Calculate monthly payment using amortization formula
      const P = grantCreditDto.principalAmount;
      const r = grantCreditDto.annualInterestRate / 12; // Monthly interest rate
      const n = grantCreditDto.durationMonths;

      let monthlyPayment: number;
      if (r === 0) {
        monthlyPayment = P / n;
      } else {
        monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      }

      // Add insurance to monthly payment
      const insuranceCost = P * grantCreditDto.insuranceRate;
      monthlyPayment += insuranceCost;

      // Create credit entity
      const credit = new Credit(
        new CreditId(0), // Will be assigned by database
        userIdVO,
        accountIdVO,
        advisorIdVO,
        new Money(grantCreditDto.principalAmount),
        grantCreditDto.annualInterestRate,
        grantCreditDto.insuranceRate,
        grantCreditDto.durationMonths,
        new Money(monthlyPayment),
        new Money(grantCreditDto.principalAmount), // Initially, remaining balance equals principal
        'active',
        new Date(),
        new Date()
      );

      // Save credit
      await this.creditRepository.save(credit);

      // Credit the account with the principal amount
      account.credit(new Money(grantCreditDto.principalAmount));
      await this.accountRepository.save(account);

      return {
        userId: credit.getUserId().value,
        accountId: credit.getAccountId().value,
        advisorId: credit.getAdvisorId().value,
        principalAmount: credit.getPrincipalAmount().amount,
        annualInterestRate: credit.getAnnualInterestRate(),
        insuranceRate: credit.getInsuranceRate(),
        durationMonths: credit.getDurationMonths(),
        monthlyPayment: credit.getMonthlyPayment().amount,
        remainingBalance: credit.getRemainingBalance().amount,
        status: credit.getStatus(),
        createdAt: credit.getCreatedAt(),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de l octroi du crédit');
    }
  }

  async getUserCredits(userId: string) {
    try {
      const userIdVO = UserId.fromString(userId);
      const credits = await this.creditRepository.findByUserId(userIdVO);

      return credits.map(credit => ({
        id: credit.getId().getValue(),
        userId: credit.getUserId().value,
        accountId: credit.getAccountId().value,
        advisorId: credit.getAdvisorId().value,
        principalAmount: credit.getPrincipalAmount().amount,
        annualInterestRate: credit.getAnnualInterestRate(),
        insuranceRate: credit.getInsuranceRate(),
        durationMonths: credit.getDurationMonths(),
        monthlyPayment: credit.getMonthlyPayment().amount,
        remainingBalance: credit.getRemainingBalance().amount,
        remainingMonths: credit.getRemainingMonths(),
        status: credit.getStatus(),
        createdAt: credit.getCreatedAt(),
        updatedAt: credit.getUpdatedAt(),
      }));
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des crédits');
    }
  }

  async processMonthlyPayments() {
    try {
      const activeCredits = await this.creditRepository.findActiveCredits();
      const results = [];

      for (const credit of activeCredits) {
        try {
          const accountIdVO = credit.getAccountId();
          const account = await this.accountRepository.findById(accountIdVO);

          if (!account) {
            results.push({
              creditId: credit.getId().getValue(),
              success: false,
              error: 'Compte non trouvé',
            });
            continue;
          }

          // Check if account has enough balance for monthly payment
          const monthlyPayment = credit.getMonthlyPayment();
          if (!account.hasEnoughBalance(monthlyPayment)) {
            // Mark credit as defaulted
            credit.markAsDefaulted();
            await this.creditRepository.update(credit);

            results.push({
              creditId: credit.getId().getValue(),
              success: false,
              error: 'Solde insuffisant - crédit marqué comme défaillant',
            });
            continue;
          }

          // Debit account
          account.debit(monthlyPayment);
          await this.accountRepository.save(account);

          // Process payment on credit
          credit.processMonthlyPayment();
          await this.creditRepository.update(credit);

          results.push({
            creditId: credit.getId().getValue(),
            success: true,
            amountPaid: monthlyPayment.amount,
            remainingBalance: credit.getRemainingBalance().amount,
            status: credit.getStatus(),
          });
        } catch (error) {
          results.push({
            creditId: credit.getId().getValue(),
            success: false,
            error: (error as Error).message,
          });
        }
      }

      return {
        totalProcessed: activeCredits.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors du traitement des paiements mensuels');
    }
  }
}
