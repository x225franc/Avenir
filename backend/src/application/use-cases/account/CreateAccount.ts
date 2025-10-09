import { IAccountRepository } from "@domain/repositories/IAccountRepository";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { Account, AccountType } from "@domain/entities/Account";
import { UserId } from "@domain/value-objects/UserId";
import { Money } from "@domain/value-objects/Money";
import { CreateAccountDTO } from "../../dto";

export interface CreateAccountResult {
	success: boolean;
	accountId?: string;
	iban?: string;
	error?: string;
}

/**
 * Use Case: Création d'un nouveau compte bancaire
 * 
 * Responsabilités:
 * - Valider les données d'entrée
 * - Vérifier que l'utilisateur existe
 * - Créer l'entité Account (IBAN généré automatiquement)
 * - Sauvegarder dans le repository
 * - Appliquer un dépôt initial si fourni
 */
export class CreateAccount {
	constructor(
		private accountRepository: IAccountRepository,
		private userRepository: IUserRepository
	) {}

	async execute(dto: CreateAccountDTO): Promise<CreateAccountResult> {
		try {
			// 1. Valider l'userId
			const userId = new UserId(dto.userId);

			// 2. Vérifier que l'utilisateur existe
			const user = await this.userRepository.findById(userId);
			if (!user) {
				return {
					success: false,
					error: "Utilisateur non trouvé",
				};
			}

			// 3. Valider le type de compte
			if (!Object.values(AccountType).includes(dto.accountType as AccountType)) {
				return {
					success: false,
					error: "Type de compte invalide",
				};
			}

			// 4. Créer l'entité Account (IBAN généré automatiquement)
			const account = Account.create({
				userId,
				accountName: dto.accountName.trim(),
				accountType: dto.accountType as AccountType,
				interestRate:
					dto.accountType === AccountType.SAVINGS ? 2.0 : undefined, // 2% par défaut pour épargne
			});

			// 5. Appliquer un dépôt initial si fourni
			if (dto.initialDeposit && dto.initialDeposit > 0) {
				const depositAmount = new Money(
					dto.initialDeposit,
					dto.currency || "EUR"
				);
				account.credit(depositAmount);
			}

			// 6. Sauvegarder dans le repository
			await this.accountRepository.save(account);

			return {
				success: true,
				accountId: account.id.value,
				iban: account.iban.formatted,
			};
		} catch (error) {
			if (error instanceof Error) {
				return {
					success: false,
					error: error.message,
				};
			}

			return {
				success: false,
				error: "Une erreur inattendue s'est produite lors de la création du compte",
			};
		}
	}
}
