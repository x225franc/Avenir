import dotenv from "dotenv";

// Chargement des variables d'environnement
dotenv.config();

export interface DatabaseConfig {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
}

export interface AppConfig {
	port: number;
	nodeEnv: string;
	jwtSecret: string;
	database: DatabaseConfig;
}

export const config: AppConfig = {
	port: parseInt(process.env.PORT || '3001', 10),
	nodeEnv: process.env.NODE_ENV || 'development',
	jwtSecret:
		process.env.JWT_SECRET || 'secret_super_securise_pour_jwt_express',
	database: {
		host: process.env.DB_HOST || 'localhost',
		port: parseInt(process.env.DB_PORT || '3306', 10),
		username: process.env.DB_USERNAME || 'avenir',
		password: process.env.DB_PASSWORD || 'avenir123',
		database: process.env.DB_NAME || 'avenir_bank',
	},
};

// Validation de la configuration
// export function validateConfig(): void {
// 	const requiredEnvVars = ["JWT_SECRET"];

// 	for (const envVar of requiredEnvVars) {
// 		if (!process.env[envVar] && config.nodeEnv === "production") {
// 			throw new Error(`Variable ${envVar} manquante`);
// 		}
// 	}
// }

// // Valide la configuration au chargement
// if (config.nodeEnv === "production") {
// 	validateConfig();
// }
