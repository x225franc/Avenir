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

			// console.log(`✅ MySQL connection pool created`);
		}

		return DatabaseConnection.instance;
	}

	public static async testConnection(): Promise<boolean> {
		try {
			const pool = DatabaseConnection.getInstance();
			const connection = await pool.getConnection();
			console.log("✅ MySQL connection réussie");
			connection.release();
			return true;
		} catch (error) {
			console.error("❌ MySQL connection echouée:", error);
			return false;
		}
	}

	public static async close(): Promise<void> {
		if (DatabaseConnection.instance) {
			await DatabaseConnection.instance.end();
			DatabaseConnection.instance = null;
			// console.log("✅ MySQL connection pool closed");
		}
	}
}

export const pool = DatabaseConnection.getInstance();
export const testConnection = DatabaseConnection.testConnection;
export const closeConnection = DatabaseConnection.close;
