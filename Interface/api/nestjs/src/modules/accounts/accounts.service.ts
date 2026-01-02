import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { UserId } from '@domain/value-objects/UserId';
import { AccountId } from '@domain/value-objects/AccountId';
import { Account } from '@domain/entities/Account';

/**
 * ⚠️ VERSION SIMPLIFIÉE - SANS USE CASES
 *
 * Ce service utilise directement les repositories au lieu des Use Cases.
 * Voir SIMPLIFICATIONS.md pour la liste des Use Cases à réintégrer.
 *
 * Use Cases manquants:
 * - CreateAccountUseCase
 * - GetUserAccountsUseCase
 * - UpdateAccountUseCase
 * - DeleteAccountUseCase
 */
@Injectable()
export class AccountsService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async create(userId: string, createAccountDto: CreateAccountDto) {
    const userIdVO = UserId.fromString(userId);

    // Account.create() génère automatiquement l'IBAN et initialise le solde à 0
    const account = Account.create({
      userId: userIdVO,
      accountName: createAccountDto.accountName,
      accountType: createAccountDto.accountType,
    });

    await this.accountRepository.save(account);

    return {
      id: account.id.value,
      userId: account.userId.value,
      iban: account.iban.value,
      accountName: account.accountName,
      accountType: account.accountType,
      balance: account.balance.amount,
      isActive: account.isActive,
      createdAt: account.createdAt,
    };
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

    return {
      id: account.id.value,
      userId: account.userId.value,
      iban: account.iban.value,
      accountName: account.accountName,
      accountType: account.accountType,
      balance: account.balance.amount,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  async findByUserId(userId: string) {
    const userIdVO = UserId.fromString(userId);
    const accounts = await this.accountRepository.findByUserId(userIdVO);

    return accounts.map(account => ({
      id: account.id.value,
      iban: account.iban.value,
      accountName: account.accountName,
      accountType: account.accountType,
      balance: account.balance.amount,
      isActive: account.isActive,
      createdAt: account.createdAt,
    }));
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

    return {
      id: account.id.value,
      accountName: account.accountName,
      updatedAt: account.updatedAt,
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

    return { message: 'Compte supprimé avec succès' };
  }
}
