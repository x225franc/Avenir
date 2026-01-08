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
	jwtSecret: process.env.JWT_SECRET || 'secret_super_securise_pour_jwt',
	database: {
		host: process.env.DB_POSTGRES_HOST || 'localhost',
		port: parseInt(process.env.DB_POSTGRES_PORT || '5433', 10),
		username: process.env.DB_POSTGRES_USER || 'avenir',
		password: process.env.DB_POSTGRES_PASSWORD || 'avenir123',
		database: process.env.DB_POSTGRES_NAME || 'avenir_bank',
	},
};
