import mysql from "mysql2/promise";
import { config } from "../../config/database";

/**
 * Pool de connexions MySQL
 * Utilise un pool pour réutiliser les connexions et optimiser les performances
 */
class DatabaseConnection {
	private static instance: mysql.Pool | null = null;

	private constructor() {}

	public static getInstance(): mysql.Pool {
		if (!DatabaseConnection.instance) {
			DatabaseConnection.instance = mysql.createPool({
				host: config.database.host,
				port: config.database.port,
				user: config.database.username,
				password: config.database.password,
				database: config.database.database,
				waitForConnections: true,
				connectionLimit: 10,
				queueLimit: 0,
				enableKeepAlive: true,
				keepAliveInitialDelay: 0,
			});

		}

		return DatabaseConnection.instance;
	}

	public static async testConnection(maxRetries: number = 5, retryDelay: number = 2000): Promise<boolean> {
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				const pool = DatabaseConnection.getInstance();
				const connection = await pool.getConnection();
				console.log("✅ MySQL connection réussie");
				connection.release();
				return true;
			} catch (error) {
				if (attempt === maxRetries) {
					console.error("❌ MySQL connection echouée après", maxRetries, "tentatives:", error);
					return false;
				}
				console.log(`⏳ Tentative ${attempt}/${maxRetries} échouée. Nouvelle tentative dans ${retryDelay}ms...`);
				await new Promise(resolve => setTimeout(resolve, retryDelay));
			}
		}
		return false;
	}

	public static async close(): Promise<void> {
		if (DatabaseConnection.instance) {
			await DatabaseConnection.instance.end();
			DatabaseConnection.instance = null;
		}
	}
}

export const pool = DatabaseConnection.getInstance();
export const testConnection = DatabaseConnection.testConnection;
export const closeConnection = DatabaseConnection.close;
