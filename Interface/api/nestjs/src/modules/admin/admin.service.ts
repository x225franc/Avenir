import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { UpdateSavingsRateDto } from './dto/update-savings-rate.dto';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { StockRepository } from '@infrastructure/database/postgresql/StockRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { BankSettingsRepository } from '@infrastructure/database/postgresql/BankSettingsRepository';
import { User, UserRole } from '@domain/entities/User';
import { UserId } from '@domain/value-objects/UserId';
import { Email } from '@domain/value-objects/Email';
import { Stock } from '@domain/entities/Stock';
import { StockId } from '@domain/value-objects/StockId';
import { Money } from '@domain/value-objects/Money';
import { AccountType } from '@domain/entities/Account';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly stockRepository: StockRepository,
    private readonly accountRepository: AccountRepository,
    private readonly bankSettingsRepository: BankSettingsRepository,
  ) {}

  // ============ USER MANAGEMENT ============

  async getAllUsers() {
    try {
      const users = await this.userRepository.findAll();

      return users.map(user => ({
        id: user.id.value,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
      }));
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des utilisateurs');
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      // Check if email already exists
      const emailVO = new Email(createUserDto.email);
      const existingUser = await this.userRepository.findByEmail(emailVO);

      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Create user entity
      const user = User.create({
        email: emailVO,
        passwordHash: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: UserRole[createUserDto.role.toUpperCase() as keyof typeof UserRole],
        emailVerified: true, // Admin-created users are auto-verified
        isBanned: false,
      });

      // Save user
      await this.userRepository.save(user);

      return {
        id: user.id.value,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la création de l utilisateur');
    }
  }

  async getUserById(id: string) {
    try {
      const userIdVO = UserId.fromString(id);
      const user = await this.userRepository.findById(userIdVO);

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      return {
        id: user.id.value,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération de l utilisateur');
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      const userIdVO = UserId.fromString(id);
      const user = await this.userRepository.findById(userIdVO);

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Check email uniqueness if changing email
      if (updateUserDto.email && updateUserDto.email !== user.email.value) {
        const emailVO = new Email(updateUserDto.email);
        const existingUser = await this.userRepository.findByEmail(emailVO);
        if (existingUser) {
          throw new ConflictException('Cet email est déjà utilisé');
        }
      }

      // Update user properties
      if (updateUserDto.email) {
        (user as any).email = new Email(updateUserDto.email);
      }
      if (updateUserDto.firstName) {
        (user as any).firstName = updateUserDto.firstName;
      }
      if (updateUserDto.lastName) {
        (user as any).lastName = updateUserDto.lastName;
      }
      if (updateUserDto.role) {
        (user as any).role = updateUserDto.role;
      }

      await this.userRepository.save(user);

      return {
        id: user.id.value,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isBanned: user.isBanned,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la mise à jour de l utilisateur');
    }
  }

  async deleteUser(id: string) {
    try {
      const userIdVO = UserId.fromString(id);
      const user = await this.userRepository.findById(userIdVO);

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      await this.userRepository.delete(userIdVO);

      return {
        message: 'Utilisateur supprimé avec succès',
        id,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la suppression de l utilisateur');
    }
  }

  async banUser(id: string) {
    try {
      const userIdVO = UserId.fromString(id);
      const user = await this.userRepository.findById(userIdVO);

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      user.banUser();
      await this.userRepository.save(user);

      return {
        message: 'Utilisateur banni avec succès',
        id,
        isBanned: user.isBanned,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors du bannissement de l utilisateur');
    }
  }

  async unbanUser(id: string) {
    try {
      const userIdVO = UserId.fromString(id);
      const user = await this.userRepository.findById(userIdVO);

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      user.unbanUser();
      await this.userRepository.save(user);

      return {
        message: 'Utilisateur débanni avec succès',
        id,
        isBanned: user.isBanned,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors du débannissement de l utilisateur');
    }
  }

  // ============ STOCK MANAGEMENT ============

  async getAllStocks() {
    try {
      const stocks = await this.stockRepository.findAll(false);

      return stocks.map(stock => ({
        id: stock.id.value,
        symbol: stock.symbol,
        companyName: stock.companyName,
        currentPrice: stock.currentPrice.amount,
        isAvailable: stock.isAvailable,
        createdAt: stock.createdAt,
        updatedAt: stock.updatedAt,
      }));
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des actions');
    }
  }

  async createStock(createStockDto: CreateStockDto) {
    try {
      // Check if symbol already exists
      const existingStock = await this.stockRepository.findBySymbol(createStockDto.symbol);
      if (existingStock) {
        throw new ConflictException('Ce symbole d action existe déjà');
      }

      // Create stock entity using factory
      const stock = Stock.create({
        symbol: createStockDto.symbol,
        companyName: createStockDto.companyName,
        currentPrice: new Money(createStockDto.currentPrice),
        isAvailable: createStockDto.isAvailable ?? true,
      });

      // Save stock
      await this.stockRepository.save(stock);

      return {
        id: stock.id.value,
        symbol: stock.symbol,
        companyName: stock.companyName,
        currentPrice: stock.currentPrice.amount,
        isAvailable: stock.isAvailable,
        createdAt: stock.createdAt,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la création de l action');
    }
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto) {
    try {
      const stockIdVO = StockId.fromNumber(parseInt(id));
      const stock = await this.stockRepository.findById(stockIdVO);

      if (!stock) {
        throw new NotFoundException('Action non trouvée');
      }

      // Check symbol uniqueness if changing symbol
      if (updateStockDto.symbol && updateStockDto.symbol !== stock.symbol) {
        const existingStock = await this.stockRepository.findBySymbol(updateStockDto.symbol);
        if (existingStock) {
          throw new ConflictException('Ce symbole d action existe déjà');
        }
      }

      // Update stock properties
      if (updateStockDto.symbol) {
        (stock as any).props.symbol = updateStockDto.symbol.toUpperCase().trim();
      }
      if (updateStockDto.companyName) {
        (stock as any).props.companyName = updateStockDto.companyName;
      }
      if (updateStockDto.currentPrice !== undefined) {
        stock.updatePrice(new Money(updateStockDto.currentPrice));
      }
      if (updateStockDto.isAvailable !== undefined) {
        stock.setAvailability(updateStockDto.isAvailable);
      }

      await this.stockRepository.save(stock);

      return {
        id: stock.id.value,
        symbol: stock.symbol,
        companyName: stock.companyName,
        currentPrice: stock.currentPrice.amount,
        isAvailable: stock.isAvailable,
        updatedAt: stock.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la mise à jour de l action');
    }
  }

  async deleteStock(id: string) {
    try {
      const stockIdVO = StockId.fromNumber(parseInt(id));
      const stock = await this.stockRepository.findById(stockIdVO);

      if (!stock) {
        throw new NotFoundException('Action non trouvée');
      }

      await this.stockRepository.delete(stockIdVO);

      return {
        message: 'Action supprimée avec succès',
        id,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la suppression de l action');
    }
  }

  // ============ BANK SETTINGS MANAGEMENT ============

  async applyInterest() {
    try {
      const savingsRate = await this.bankSettingsRepository.getSavingsRate();
      const dailyRate = savingsRate / 100 / 365; // Convert annual % to daily decimal

      // Get all savings accounts
      const savingsAccounts = await this.accountRepository.findAllSavingsAccounts();

      let totalInterestPaid = 0;
      const results = [];

      for (const account of savingsAccounts) {
        const interest = account.balance.amount * dailyRate;
        const interestMoney = new Money(interest);

        account.credit(interestMoney);
        await this.accountRepository.save(account);

        totalInterestPaid += interest;
        results.push({
          accountId: account.id.value,
          balance: account.balance.amount,
          interestPaid: interest,
        });
      }

      return {
        message: 'Intérêts appliqués avec succès',
        savingsRate,
        dailyRate,
        accountsProcessed: savingsAccounts.length,
        totalInterestPaid,
        results,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de l application des intérêts');
    }
  }

  async testInterest() {
    try {
      const savingsRate = await this.bankSettingsRepository.getSavingsRate();
      const dailyRate = savingsRate / 100 / 365;

      const savingsAccounts = await this.accountRepository.findAllSavingsAccounts();

      let totalInterestWouldBePaid = 0;
      const results = [];

      for (const account of savingsAccounts) {
        const interest = account.balance.amount * dailyRate;
        totalInterestWouldBePaid += interest;

        results.push({
          accountId: account.id.value,
          balance: account.balance.amount,
          interestToBePaid: interest,
        });
      }

      return {
        message: 'Simulation des intérêts (aucune modification)',
        savingsRate,
        dailyRate,
        accountsToProcess: savingsAccounts.length,
        totalInterestWouldBePaid,
        results,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors du test des intérêts');
    }
  }

  async updateSavingsRate(updateSavingsRateDto: UpdateSavingsRateDto) {
    try {
      await this.bankSettingsRepository.setSavingsRate(updateSavingsRateDto.rate);

      return {
        message: 'Taux d épargne mis à jour avec succès',
        rate: updateSavingsRateDto.rate,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la mise à jour du taux d épargne');
    }
  }

  async getSavingsRate() {
    try {
      const rate = await this.bankSettingsRepository.getSavingsRate();

      return {
        rate,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération du taux d épargne');
    }
  }

  async getCronStatus() {
    // TODO: Implement cron status check when cron service is created
    return {
      message: 'Statut du cron (à implémenter)',
      isRunning: false,
      lastRun: null,
    };
  }
}
