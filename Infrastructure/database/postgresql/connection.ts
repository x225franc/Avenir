import { Pool } from "pg";
import { config } from "../../config/database-postgres";

/**
 * Pool de connexions PostgreSQL
 * Utilise un pool pour réutiliser les connexions et optimiser les performances
 */
class DatabaseConnection {
    private static instance: Pool | null = null;

    private constructor() {}

    public static getInstance(): Pool {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new Pool({
                host: config.database.host,
                port: config.database.port,
                user: config.database.username,
                password: config.database.password,
                database: config.database.database,
                max: 10, // connectionLimit equivalent
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            // console.log(`PostgreSQL connection pool created`);
            console.log('DB_PASSWORD =', process.env.DB_PASSWORD);

        }

        return DatabaseConnection.instance;
    }

    public static async testConnection(): Promise<boolean> {
        try {
            const pool = DatabaseConnection.getInstance();
            const client = await pool.connect();
            console.log("PostgreSQL connection réussie");
            client.release();
            return true;
        } catch (error) {
            console.error("PostgreSQL connection echouée:", error);
            return false;
        }
    }

    public static async close(): Promise<void> {
        if (DatabaseConnection.instance) {
            await DatabaseConnection.instance.end();
            DatabaseConnection.instance = null;
            // console.log("PostgreSQL connection pool closed");
        }
    }
}

export const pool = DatabaseConnection.getInstance();
export const testConnection = DatabaseConnection.testConnection;
export const closeConnection = DatabaseConnection.close;
