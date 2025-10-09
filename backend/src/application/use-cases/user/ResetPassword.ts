import { IUserRepository } from "@domain/repositories/IUserRepository";
import { UserId } from "@domain/value-objects/UserId";
import * as bcrypt from "bcrypt";

export class ResetPassword {
	constructor(private userRepository: IUserRepository) {}

	async execute(token: string, newPassword: string): Promise<void> {
		// Decode token
		const decoded = Buffer.from(token, "base64").toString();
		const [userId, timestamp] = decoded.split(":");

		// Check token expiration (1 hour)
		const tokenAge = Date.now() - parseInt(timestamp);
		const ONE_HOUR = 60 * 60 * 1000;

		if (tokenAge > ONE_HOUR) {
			throw new Error(
				"Le lien de réinitialisation a expiré. Veuillez faire une nouvelle demande."
			);
		}

		// Find user
		const user = await this.userRepository.findById(UserId.fromString(userId));
		if (!user) {
			throw new Error("Utilisateur introuvable");
		}

		// Verify token matches
		if (user.passwordResetToken !== token) {
			throw new Error("Token de réinitialisation invalide");
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Reset password and clear token
		user.resetPassword(hashedPassword);
		await this.userRepository.save(user);
	}
}
