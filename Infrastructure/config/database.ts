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
		process.env.JWT_SECRET || 'null',
	database: {
		host: process.env.DB_HOST || 'localhost',
		port: parseInt(process.env.DB_PORT || '3306', 10),
		username: process.env.DB_USERNAME || 'root',
		password: process.env.DB_PASSWORD || '',
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
