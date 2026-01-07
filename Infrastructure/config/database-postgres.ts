// Chargement explicite du .env de NestJS
// Nécessaire car ce fichier est importé avant l'exécution de main.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

// Déterminer le chemin vers le .env de NestJS
// Depuis dist/ (après compilation), le .env est dans le parent
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
	console.error('Erreur chargement .env:', result.error.message);
	console.error('__dirname:', __dirname);
	console.error('envPath:', envPath);
} else {
	console.log('.env chargé depuis:', envPath);
	console.log('DB_HOST:', process.env.DB_HOST);
	console.log('DB_USER:', process.env.DB_USER);
	console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');
	console.log('DB_NAME:', process.env.DB_NAME);
}

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
		host: process.env.DB_HOST || 'localhost',
		port: parseInt(process.env.DB_PORT || '5433', 10),
		username: process.env.DB_USER || 'avenir',
		password: process.env.DB_PASSWORD || 'avenir123',
		database: process.env.DB_NAME || 'avenir_bank',
	},
};
