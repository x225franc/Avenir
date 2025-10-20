import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { testConnection } from "@infrastructure/database/mysql/connection";
import { getCronService } from "../../../Infrastructure/jobs/CronService";
import apiRoutes from "./routes";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet());
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
		credentials: true,
	})
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de test
app.get("/", (req, res) => {
	res.json({
		message: "Banque AVENIR API - Express Server",
		version: "1.0.0",
		framework: "Express.js",
		endpoints: {
			users: "/api/users",
			accounts: "/api/accounts",
			transactions: "/api/transactions",
		},
	});
});

app.get("/health", (req, res) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// Routes API
app.use("/api", apiRoutes);

// Gestionnaire d'erreur global
app.use(
	(
		err: Error,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		console.error("Error:", err);
		res.status(500).json({
			error: "Erreur interne du serveur",
			message: err.message,
		});
	}
);

// Gestionnaire 404
app.use("*", (req, res) => {
	res.status(404).json({
		error: "Route introuvable",
		path: req.originalUrl,
	});
});

// Démarrage du serveur
if (require.main === module) {
	// Test de la connexion à la base de données avant de démarrer le serveur
	testConnection().then((isConnected: boolean) => {
		if (!isConnected) {
			console.error('❌ Echec de la connexion bdd');
			process.exit(1);
		}

		app.listen(PORT, () => {
			console.log(`🚀 Serveur express tourne sur http://localhost:${PORT}`);
			console.log(`📊 Health check: http://localhost:${PORT}/health`);
			console.log(`💾 Base de données connectée`);
			
			// Démarrer les tâches planifiées
			try {
				const cronService = getCronService();
				cronService.start();
				console.log(`⏰ Tâches planifiées démarrées`);
			} catch (error) {
				console.error('⚠️ Erreur lors du démarrage des tâches planifiées:', error);
			}
		});

		// Gestion propre de l'arrêt du serveur
		process.on('SIGTERM', () => {
			console.log('SIGTERM signal received: closing HTTP server');
			const cronService = getCronService();
			cronService.stop();
			process.exit(0);
		});

		process.on('SIGINT', () => {
			console.log('SIGINT signal received: closing HTTP server');
			const cronService = getCronService();
			cronService.stop();
			process.exit(0);
		});
	});
}

export default app;
