import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { UserId } from '@domain/value-objects/UserId';
import { AccountId } from '@domain/value-objects/AccountId';
import { CreateAccount } from '@application/use-cases/account/CreateAccount';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(userId: string, createAccountDto: CreateAccountDto) {
    try {
      // Utiliser le Use Case CreateAccount
      const createAccountUseCase = new CreateAccount(
        this.accountRepository,
        this.userRepository
      );

      const result = await createAccountUseCase.execute({
        userId,
        accountName: createAccountDto.accountName,
        accountType: createAccountDto.accountType,
      });

      if (!result.success) {
        throw new BadRequestException(result.error || 'Erreur lors de la création du compte');
      }

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Compte créé avec succès',
        data: {
          accountId: result.accountId,
          iban: result.iban,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la création du compte');
    }
  }

  async findAll() {
    // Note: findAll() n'existe pas dans AccountRepository PostgreSQL
    // On pourrait l'ajouter ou lever une erreur
    throw new BadRequestException('findAll() not implemented - use findByUserId instead');
  }

  async findById(id: string, userId?: string) {
    const account = await this.accountRepository.findById(new AccountId(id));

    if (!account) {
      throw new NotFoundException('Compte non trouvé');
    }

    // Vérifier que l'utilisateur est propriétaire du compte
    if (userId && account.userId.value !== userId) {
      throw new ForbiddenException('Accès interdit à ce compte');
    }

    // Format standardisé compatible avec Express
    return {
      success: true,
      data: {
        id: account.id.value,
        userId: account.userId.value,
        iban: account.iban.value,
        accountName: account.accountName,
        accountType: account.accountType,
        balance: account.balance.amount,
        isActive: account.isActive,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      },
    };
  }

  async findByUserId(userId: string) {
    const userIdVO = UserId.fromString(userId);
    const accounts = await this.accountRepository.findByUserId(userIdVO);

    // Format standardisé compatible avec Express
    return {
      success: true,
      data: accounts.map(account => ({
        id: account.id.value,
        iban: account.iban.value,
        accountName: account.accountName,
        accountType: account.accountType,
        balance: account.balance.amount,
        isActive: account.isActive,
        createdAt: account.createdAt,
      })),
    };
  }

  async update(id: string, userId: string, updateAccountDto: UpdateAccountDto) {
    const account = await this.accountRepository.findById(new AccountId(id));

    if (!account) {
      throw new NotFoundException('Compte non trouvé');
    }

    if (account.userId.value !== userId) {
      throw new ForbiddenException('Accès interdit à ce compte');
    }

    // Utiliser la méthode updateName() du Domain
    if (updateAccountDto.accountName) {
      account.updateName(updateAccountDto.accountName);
    }

    // save() gère à la fois create et update
    await this.accountRepository.save(account);

    // Format standardisé compatible avec Express
    return {
      success: true,
      message: 'Compte mis à jour avec succès',
      data: {
        id: account.id.value,
        accountName: account.accountName,
        updatedAt: account.updatedAt,
      },
    };
  }

  async delete(id: string, userId: string) {
    const account = await this.accountRepository.findById(new AccountId(id));

    if (!account) {
      throw new NotFoundException('Compte non trouvé');
    }

    if (account.userId.value !== userId) {
      throw new ForbiddenException('Accès interdit à ce compte');
    }

    // Utiliser la méthode canBeDeleted() du Domain
    if (!account.canBeDeleted()) {
      throw new BadRequestException('Impossible de supprimer un compte avec un solde non nul');
    }

    await this.accountRepository.delete(account.id);

    // Format standardisé compatible avec Express
    return {
      success: true,
      message: 'Compte supprimé avec succès',
    };
  }
}
