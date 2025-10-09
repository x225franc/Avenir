import { Account, AccountType } from "../entities/Account";
import { AccountId } from "../value-objects/AccountId";
import { UserId } from "../value-objects/UserId";
import { IBAN } from "../value-objects/IBAN";

/**
 * Interface du repository Account (contrat du domaine)
 */
export interface IAccountRepository {
	/**
	 * Sauvegarde un compte (création ou mise à jour)
	 */
	save(account: Account): Promise<void>;

	/**
	 * Trouve un compte par son ID
	 */
	findById(id: AccountId): Promise<Account | null>;

	/**
	 * Trouve un compte par son IBAN
	 */
	findByIBAN(iban: IBAN): Promise<Account | null>;

	/**
	 * Trouve tous les comptes d'un utilisateur
	 */
	findByUserId(userId: UserId): Promise<Account[]>;

	/**
	 * Trouve les comptes d'un utilisateur par type
	 */
	findByUserIdAndType(userId: UserId, type: AccountType): Promise<Account[]>;

	/**
	 * Trouve tous les comptes d'épargne actifs (pour appliquer les intérêts)
	 */
	findAllSavingsAccounts(): Promise<Account[]>;

	/**
	 * Supprime un compte
	 */
	delete(id: AccountId): Promise<void>;

	/**
	 * Vérifie si un IBAN existe déjà
	 */
	ibanExists(iban: IBAN): Promise<boolean>;
}
