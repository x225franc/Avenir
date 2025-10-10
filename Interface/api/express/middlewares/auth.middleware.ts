import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@infrastructure/config/database";

export interface JWTPayload {
	userId: string;
	email: string;
	role: string;
}

/**
 * Middleware d'authentification JWT
 * Vérifie le token JWT dans le header Authorization
 * Ajoute les informations de l'utilisateur dans req.user
 */
export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	try {
		// Récupérer le token du header Authorization
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			res.status(401).json({
				success: false,
				error: "Token d'authentification manquant",
			});
			return;
		}

		// Format: "Bearer TOKEN"
		const token = authHeader.split(" ")[1];

		if (!token) {
			res.status(401).json({
				success: false,
				error: "Format du token invalide",
			});
			return;
		}

		// Vérifier et décoder le token
		const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;

		// Ajouter les informations de l'utilisateur à la requête
		(req as any).user = decoded;

		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			res.status(401).json({
				success: false,
				error: "Token invalide",
			});
			return;
		}

		if (error instanceof jwt.TokenExpiredError) {
			res.status(401).json({
				success: false,
				error: "Token expiré",
			});
			return;
		}

		res.status(500).json({
			success: false,
			error: "Erreur lors de la vérification du token",
		});
	}
};

/**
 * Middleware pour vérifier le rôle de l'utilisateur
 */
export const roleMiddleware = (...allowedRoles: string[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const userRole = (req as any).user?.role;

		if (!userRole) {
			res.status(401).json({
				success: false,
				error: "Non authentifié",
			});
			return;
		}

		if (!allowedRoles.includes(userRole)) {
			res.status(403).json({
				success: false,
				error: "Accès non autorisé pour votre rôle",
			});
			return;
		}

		next();
	};
};
