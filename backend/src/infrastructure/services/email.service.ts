import nodemailer from "nodemailer";
import { config } from "@infrastructure/config/database";

/**
 * Configuration du transporteur d'email
 */
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST || "smtp.gmail.com",
	port: parseInt(process.env.EMAIL_PORT || "587", 10),
	secure: false, // true pour 465, false pour les autres ports
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

/**
 * Service d'envoi d'emails
 */
export class EmailService {
	/**
	 * Envoyer un email de vérification d'inscription
	 */
	async sendVerificationEmail(
		to: string,
		firstName: string,
		verificationToken: string
	): Promise<boolean> {
		try {
			const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

			const mailOptions = {
				from: `"Banque AVENIR" <${process.env.EMAIL_USER}>`,
				to,
				subject: "Vérifiez votre compte Banque AVENIR",
				html: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="UTF-8">
						<style>
							body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
							.container { max-width: 600px; margin: 0 auto; padding: 20px; }
							.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
							.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
							.button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
							.footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
						</style>
					</head>
					<body>
						<div class="container">
							<div class="header">
								<h1>🏦 Banque AVENIR</h1>
								<p>Bienvenue dans votre nouvelle banque moderne</p>
							</div>
							<div class="content">
								<h2>Bonjour ${firstName},</h2>
								<p>Merci de vous être inscrit sur <strong>Banque AVENIR</strong> !</p>
								<p>Pour activer votre compte et commencer à gérer vos finances, veuillez cliquer sur le bouton ci-dessous :</p>
								<div style="text-align: center;text-decoration: none;">
									<a href="${verificationUrl}" class="button">Vérifier mon email</a>
								</div>
								<p>Ou copiez ce lien dans votre navigateur :</p>
								<p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; font-size: 12px;">
									${verificationUrl}
								</p>
								<strong>Si vous n'avez pas créé de compte sur Banque AVENIR, vous pouvez ignorer cet email.</strong>
							</div>
							<div class="footer">
								<p>Banque AVENIR - Alliance de Valeurs Économiques et Nationnales Investies Responsablement</p>
								<p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
							</div>
						</div>
					</body>
					</html>
				`,
				text: `
					Bonjour ${firstName},

					Merci de vous être inscrit sur Banque AVENIR !

					Pour activer votre compte, veuillez cliquer sur ce lien :
					${verificationUrl}

					Ce lien est valide pendant 24 heures.

					Si vous n'avez pas créé de compte sur Banque AVENIR, vous pouvez ignorer cet email.

					Banque AVENIR - Alliance de Valeurs Économiques et Nationnales Investies Responsablement
				`,
			};

			const info = await transporter.sendMail(mailOptions);
			console.log("✅ Email de vérification envoyé:", info.messageId);
			return true;
		} catch (error) {
			console.error("❌ Erreur lors de l'envoi de l'email:", error);
			return false;
		}
	}

	/**
	 * Envoyer un email de bienvenue après vérification
	 */
	async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
		try {
			const mailOptions = {
				from: `"Banque AVENIR" <${process.env.EMAIL_USER}>`,
				to,
				subject: "Bienvenue chez Banque AVENIR !",
				html: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="UTF-8">
						<style>
							body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
							.container { max-width: 600px; margin: 0 auto; padding: 20px; }
							.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
							.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
							.feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
							.footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
						</style>
					</head>
					<body>
						<div class="container">
							<div class="header">
								<h1>🎉 Bienvenue chez Banque AVENIR !</h1>
							</div>
							<div class="content">
								<h2>Bonjour ${firstName},</h2>
								<p>Votre compte est maintenant <strong>actif</strong> ! 🎊</p>
								<p>Vous pouvez désormais profiter de tous nos services :</p>
								
								<div class="feature">
									<strong>💰 Comptes multiples</strong>
									<p>Créez autant de comptes que vous le souhaitez : compte courant, épargne, investissement.</p>
								</div>
								
								<div class="feature">
									<strong>🔄 Transferts instantanés</strong>
									<p>Effectuez des virements entre vos comptes en quelques clics.</p>
								</div>
								
								<div class="feature">
									<strong>📈 Suivi en temps réel</strong>
									<p>Consultez vos soldes et transactions à tout moment.</p>
								</div>
								
								<p style="text-align: center; margin-top: 30px;">
									<a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" style="display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
										Accéder à mon compte
									</a>
								</p>
							</div>
							<div class="footer">
								<p>Banque AVENIR - Votre partenaire financier de confiance</p>
							</div>
						</div>
					</body>
					</html>
				`,
			};

			const info = await transporter.sendMail(mailOptions);
			console.log("✅ Email de bienvenue envoyé:", info.messageId);
			return true;
		} catch (error) {
			console.error("❌ Erreur lors de l'envoi de l'email:", error);
			return false;
		}
	}

	/**
	 * Envoyer une notification de changement de taux d'épargne
	 */
	async sendSavingsRateChangeEmail(
		to: string,
		firstName: string,
		oldRate: number,
		newRate: number
	): Promise<boolean> {
		try {
			const mailOptions = {
				from: `"Banque AVENIR" <${process.env.EMAIL_USER}>`,
				to,
				subject: "📊 Changement du taux d'épargne - Banque AVENIR",
				html: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="UTF-8">
						<style>
							body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
							.container { max-width: 600px; margin: 0 auto; padding: 20px; }
							.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
							.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
							.rate-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
							.old-rate { color: #999; text-decoration: line-through; }
							.new-rate { color: #667eea; font-size: 32px; font-weight: bold; }
							.footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
						</style>
					</head>
					<body>
						<div class="container">
							<div class="header">
								<h1>📊 Mise à jour du taux d'épargne</h1>
							</div>
							<div class="content">
								<h2>Bonjour ${firstName},</h2>
								<p>Nous vous informons d'un changement concernant le taux d'intérêt de votre compte d'épargne.</p>
								
								<div class="rate-box">
									<p class="old-rate">Ancien taux : ${oldRate}%</p>
									<p class="new-rate">${newRate}%</p>
									<p><strong>Nouveau taux annuel</strong></p>
								</div>
								
								<p>Ce nouveau taux sera appliqué dès aujourd'hui à tous vos comptes d'épargne.</p>
								<p>Vous pouvez consulter vos comptes à tout moment depuis votre espace client.</p>
							</div>
							<div class="footer">
								<p>Banque AVENIR - Transparence et confiance</p>
							</div>
						</div>
					</body>
					</html>
				`,
			};

			const info = await transporter.sendMail(mailOptions);
			console.log("✅ Email de notification envoyé:", info.messageId);
			return true;
		} catch (error) {
			console.error("❌ Erreur lors de l'envoi de l'email:", error);
			return false;
		}
	}

	/**
	 * Envoyer un email de réinitialisation de mot de passe
	 */
	async sendPasswordResetEmail(
		to: string,
		firstName: string,
		resetToken: string
	): Promise<boolean> {
		try {
			const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

			const mailOptions = {
				from: `"Banque AVENIR" <${process.env.EMAIL_USER}>`,
				to,
				subject: "Réinitialisation de votre mot de passe",
				html: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="UTF-8">
						<style>
							body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
							.container { max-width: 600px; margin: 0 auto; padding: 20px; }
							.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
							.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
							.button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
							.warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
							.footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
						</style>
					</head>
					<body>
						<div class="container">
							<div class="header">
								<h1>🔒 Réinitialisation de mot de passe</h1>
							</div>
							<div class="content">
								<h2>Bonjour ${firstName},</h2>
								<p>Vous avez demandé à réinitialiser le mot de passe de votre compte Banque AVENIR.</p>
								
								<p>Pour définir un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
								
								<div style="text-align: center;">
									<a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
								</div>
								
								<div class="warning">
									<strong>⚠️ Attention :</strong> Ce lien est valable pendant <strong>1 heure</strong> uniquement. 
									Si vous ne réinitialisez pas votre mot de passe dans ce délai, vous devrez faire une nouvelle demande.
								</div>
								
								<p><strong>Vous n'avez pas demandé cette réinitialisation ?</strong><br>
								Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email. Votre mot de passe actuel reste inchangé.</p>
							</div>
							<div class="footer">
								<p>Banque AVENIR - Sécurité et confiance</p>
							</div>
						</div>
					</body>
					</html>
				`,
			};

			const info = await transporter.sendMail(mailOptions);
			console.log("✅ Email de réinitialisation envoyé:", info.messageId);
			return true;
		} catch (error) {
			console.error("❌ Erreur lors de l'envoi de l'email:", error);
			return false;
		}
	}
}

export const emailService = new EmailService();
