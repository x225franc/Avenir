import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { UpdateSavingsRateDto } from './dto/update-savings-rate.dto';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { StockRepository } from '@infrastructure/database/postgresql/StockRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { TransactionRepository } from '@infrastructure/database/postgresql/TransactionRepository';
import { BankSettingsRepository } from '@infrastructure/database/postgresql/BankSettingsRepository';
import { InvestmentOrderRepository } from '@infrastructure/database/postgresql/InvestmentOrderRepository';
import { User, UserRole } from '@domain/entities/User';
import { UserId } from '@domain/value-objects/UserId';
import { Email } from '@domain/value-objects/Email';
import { ApplyDailyInterest } from '@application/use-cases/account/ApplyDailyInterest';
import { CreateStock } from '@application/use-cases/admin/CreateStock';
import { UpdateStock } from '@application/use-cases/admin/UpdateStock';
import { DeleteStock } from '@application/use-cases/admin/DeleteStock';
import { GetAllStocks } from '@application/use-cases/admin/GetAllStocks';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly stockRepository: StockRepository,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly bankSettingsRepository: BankSettingsRepository,
    private readonly investmentOrderRepository: InvestmentOrderRepository,
  ) {}

  // ============ STATS ============

  async getStats() {
    try {
      const users = await this.userRepository.findAll();

      const totalClients = users.filter(u => u.role === UserRole.CLIENT).length;
      const totalAdvisors = users.filter(u => u.role === UserRole.ADVISOR).length;

      // Pour les comptes, on va utiliser findByUserId pour chaque utilisateur
      let totalAccounts = 0;
      let totalVolume = 0;

      for (const user of users) {
        const userAccounts = await this.accountRepository.findByUserId(user.id);
        totalAccounts += userAccounts.length;
        totalVolume += userAccounts.reduce((sum: number, account) => sum + account.balance.amount, 0);
      }

      // Format standardisé compatible avec Express (pas dans Express mais c'est une API de stats)
      return {
        success: true,
        data: {
          totalClients,
          totalAdvisors,
          totalAccounts,
          totalVolume,
        },
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // ============ TEAM MANAGEMENT ============

  async getTeamMembers() {
    try {
      const users = await this.userRepository.findAll();

      // Return only advisors and directors (staff members)
      const teamMembers = users.filter(u => u.role === UserRole.ADVISOR || u.role === UserRole.DIRECTOR);

      // Format standardisé compatible avec Express (pas dans Express mais c'est une API de team)
      return {
        success: true,
        data: teamMembers.map(user => ({
          id: user.id.value,
          email: user.email.value,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        })),
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des membres de l\'équipe');
    }
  }

  // ============ USER MANAGEMENT ============

  async getAllUsers() {
    try {
      const users = await this.userRepository.findAll();

      // Format standardisé compatible avec Express
      return {
        success: true,
        data: users.map(user => user.toJSON()),
      };
    } catch (error) {
      throw new BadRequestException('Erreur serveur lors de la récupération des utilisateurs');
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

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Utilisateur créé avec succès',
        data: {
          userId: user.id.value,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erreur serveur lors de la création de l\'utilisateur');
    }
  }

  async getUserById(id: string) {
    try {
      const userIdVO = UserId.fromString(id);
      const user = await this.userRepository.findById(userIdVO);

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Format standardisé compatible avec Express
      return {
        success: true,
        data: user.toJSON(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur serveur lors de la récupération de l\'utilisateur');
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

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Utilisateur mis à jour avec succès',
        data: user.toJSON(),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erreur serveur lors de la mise à jour de l\'utilisateur');
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

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Utilisateur supprimé avec succès',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur serveur lors de la suppression de l\'utilisateur');
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

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Utilisateur banni avec succès',
        data: user.toJSON(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur serveur lors du bannissement de l\'utilisateur');
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

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Utilisateur débanni avec succès',
        data: user.toJSON(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur serveur lors du débannissement de l\'utilisateur');
    }
  }

  // ============ STOCK MANAGEMENT ============

  async getAllStocks() {
    try {
      // Utiliser le Use Case GetAllStocks
      const getAllStocksUseCase = new GetAllStocks(
        this.stockRepository,
        this.investmentOrderRepository
      );

      const result = await getAllStocksUseCase.execute(false);

      if (!result.success) {
        throw new BadRequestException(result.message || 'Erreur lors de la récupération des actions');
      }

      // Format standardisé compatible avec Express (pas dans Express mais c'est une API d'admin)
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération des actions');
    }
  }

  async createStock(createStockDto: CreateStockDto) {
    try {
      // Utiliser le Use Case CreateStock
      const createStockUseCase = new CreateStock(this.stockRepository);

      const result = await createStockUseCase.execute({
        symbol: createStockDto.symbol,
        companyName: createStockDto.companyName,
        currentPrice: createStockDto.currentPrice,
        isAvailable: createStockDto.isAvailable,
      });

      if (!result.success) {
        throw new BadRequestException(result.message);
      }

      // Format standardisé compatible avec Express (pas dans Express mais c'est une API d'admin)
      return {
        success: true,
        message: result.message,
        data: {
          stockId: result.stockId,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la création de l action');
    }
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto) {
    try {
      // Utiliser le Use Case UpdateStock
      const updateStockUseCase = new UpdateStock(this.stockRepository);

      const result = await updateStockUseCase.execute({
        id,
        symbol: updateStockDto.symbol,
        companyName: updateStockDto.companyName,
        isAvailable: updateStockDto.isAvailable,
      });

      if (!result.success) {
        throw new BadRequestException(result.message);
      }

      // Format standardisé compatible avec Express (pas dans Express mais c'est une API d'admin)
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la mise à jour de l action');
    }
  }

  async deleteStock(id: string) {
    try {
      // Utiliser le Use Case DeleteStock
      const deleteStockUseCase = new DeleteStock(
        this.stockRepository,
        this.investmentOrderRepository
      );

      const result = await deleteStockUseCase.execute(id);

      if (!result.success) {
        throw new BadRequestException(result.message);
      }

      // Format standardisé compatible avec Express (pas dans Express mais c'est une API d'admin)
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la suppression de l action');
    }
  }

  // ============ BANK SETTINGS MANAGEMENT ============

  async applyInterest() {
    try {
      // Utiliser le Use Case ApplyDailyInterest
      const applyInterestUseCase = new ApplyDailyInterest(
        this.accountRepository,
        this.transactionRepository,
        this.bankSettingsRepository
      );

      const result = await applyInterestUseCase.execute();

      if (!result.success) {
        throw new BadRequestException(result.errors.join(', ') || 'Erreur lors de l\'application des intérêts');
      }

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Application des intérêts exécutée avec succès',
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

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Test des intérêts quotidiens exécuté avec succès',
        data: {
          savingsRate,
          dailyRate,
          accountsToProcess: savingsAccounts.length,
          totalInterestWouldBePaid,
          results,
        },
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors du test des intérêts');
    }
  }

  async updateSavingsRate(updateSavingsRateDto: UpdateSavingsRateDto) {
    try {
      const oldRate = await this.bankSettingsRepository.getSavingsRate();
      await this.bankSettingsRepository.setSavingsRate(updateSavingsRateDto.rate);

      // Format standardisé compatible avec Express (Express retourne plus d'infos mais simplifié ici)
      return {
        success: true,
        message: 'Taux d\'épargne mis à jour avec succès',
        data: {
          oldRate,
          newRate: updateSavingsRateDto.rate,
        },
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la mise à jour du taux d épargne');
    }
  }

  async getSavingsRate() {
    try {
      const rate = await this.bankSettingsRepository.getSavingsRate();

      // Format standardisé compatible avec Express
      return {
        success: true,
        data: {
          rate,
          rateFormatted: `${rate}%`,
          lastUpdate: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur lors de la récupération du taux d épargne');
    }
  }

  async getCronStatus() {
    // Format standardisé compatible avec Express
    return {
      success: true,
      data: {
        status: 'running',
        jobs: [
          {
            name: 'daily-interest',
            schedule: '59 23 * * *',
            description: 'Applique les intérêts quotidiens aux comptes d\'épargne',
            nextRun: 'Tous les jours à 23:59',
          },
        ],
      },
    };
  }
}
