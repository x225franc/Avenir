import { IUserRepository } from "@domain/repositories/IUserRepository";
import { EmailService } from "@infrastructure/services/email.service";
import { Email } from "@domain/value-objects/Email";

export class RequestPasswordReset {
	constructor(
		private userRepository: IUserRepository,
		private emailService: EmailService
	) {}

	async execute(email: string): Promise<void> {
		// Find user by email
		const emailObj = new Email(email);
		const user = await this.userRepository.findByEmail(emailObj);
		if (!user) {
			// For security reasons, don't reveal if email exists
			// Return success even if user not found
			return;
		}

		// Generate password reset token (userId:timestamp)
		const timestamp = Date.now();
		const tokenData = `${user.id.value}:${timestamp}`;
		const token = Buffer.from(tokenData).toString("base64");

		// Save token to user
		user.setPasswordResetToken(token);
		await this.userRepository.save(user);

		// Send password reset email
		await this.emailService.sendPasswordResetEmail(
			user.email.value,
			user.firstName,
			token
		);
	}
}
