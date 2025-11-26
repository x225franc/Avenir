import { User } from "../entities/User";
import { UserId } from "../value-objects/UserId";
import { Email } from "../value-objects/Email";

/**
 * Interface du repository User (contrat du domaine)
 * Cette interface définit ce dont le domaine a besoin, sans dépendre de l'implémentation
 */
export interface IUserRepository {
	/**
	 * Sauvegarde un utilisateur (création ou mise à jour)
	 */
	save(user: User): Promise<void>;

	/**
	 * Trouve un utilisateur par son ID
	 */
	findById(id: UserId): Promise<User | null>;

	/**
	 * Trouve un utilisateur par son email
	 */
	findByEmail(email: Email): Promise<User | null>;

	/**
	 * Trouve tous les utilisateurs par rôle
	 */
	findByRole(role: string): Promise<User[]>;

	/**
	 * Trouve tous les utilisateurs
	 */
	findAll(): Promise<User[]>;

	/**
	 * Supprime un utilisateur
	 */
	delete(id: UserId): Promise<void>;

	/**
	 * Vérifie si un email existe déjà
	 */
	emailExists(email: Email): Promise<boolean>;
}
