import dotenv from "dotenv";
import path from "path";

// Charge le .env local du dossier express
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { testConnection } from "@infrastructure/database/mysql/connection";
import { getCronService } from "../../../Infrastructure/jobs/CronService";
import { stockPriceFluctuationService } from "../../../Application/services/StockPriceFluctuation";
import { initMessageSocketService } from "@infrastructure/services/MessageSocketService";
import { initSSEService } from "../../../Infrastructure/services/SSEService";
import apiRoutes from "./routes";

const app = express();
const httpServer = http.createServer(app);
let io: SocketIOServer | null = null;
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
			console.error("❌ Echec de la connexion bdd");
			process.exit(1);
		}

		httpServer.listen(PORT, () => {
			console.log(`🚀 Serveur express tourne sur http://localhost:${PORT}`);
			// console.log(`Health check: http://localhost:${PORT}/health`);
			console.log(`💾 Base de données connectée`);

			// Démarrer les tâches planifiées
			try {
				const cronService = getCronService();
				cronService.start();
				console.log(`⏰ Tâches planifiées démarrées`);
			} catch (error) {
				console.error(
					"⚠️ Erreur lors du démarrage des tâches planifiées:",
					error
				);
			}

			// Démarrer socket.io
			try {
				io = new SocketIOServer(httpServer, {
					cors: {
						origin: process.env.FRONTEND_URL || "http://localhost:3000",
						methods: ["GET", "POST"],
					},
				});

				io.on("connection", (socket) => {
					console.log(`🟢 WebSocket connecté: ${socket.id}`);

					// Join user-specific room
					socket.on("join", (data) => {
						console.log("📥 Join request received:", data);
						const userId = typeof data === "object" ? data.userId : data;
						const role = typeof data === "object" ? data.role : null;

						if (userId) {
							socket.join(`user:${userId}`);
							// console.log(`User ${userId} joined room user:${userId}`);
						}

						// Join staff rooms for advisors and directors (case-insensitive)
						const normalizedRole = role ? String(role).toLowerCase() : null;
						if (normalizedRole === "advisor" || normalizedRole === "director") {
							socket.join("advisors");
							socket.join("staff"); // Room pour les messages internes
							console.log(`👔 User ${userId} (${role}) joined advisors and staff rooms`);
						}
					});

					// Join conversation-specific room
					socket.on("join-conversation", (conversationId) => {
						socket.join(`conversation:${conversationId}`);
						console.log(`💬 Joined conversation: ${conversationId}`);
					});

					// Leave conversation room
					socket.on("leave-conversation", (conversationId) => {
						socket.leave(`conversation:${conversationId}`);
						console.log(`👋 Left conversation: ${conversationId}`);
					});

					// Typing indicators
					socket.on("typing:start", ({ conversationId, userId }) => {
						socket
							.to(`conversation:${conversationId}`)
							.emit("typing:start", { conversationId, userId });
					});

					socket.on("typing:stop", ({ conversationId, userId }) => {
						socket
							.to(`conversation:${conversationId}`)
							.emit("typing:stop", { conversationId, userId });
					});

					// Internal message typing indicators
					socket.on("internal_typing:start", ({ userId, targetUserId }) => {
						if (targetUserId) {
							socket
								.to(`user:${targetUserId}`)
								.emit("internal_typing:start", { userId });
						} else {
							socket.to("staff").emit("internal_typing:start", { userId });
						}
					});

					socket.on("internal_typing:stop", ({ userId, targetUserId }) => {
						if (targetUserId) {
							socket
								.to(`user:${targetUserId}`)
								.emit("internal_typing:stop", { userId });
						} else {
							socket.to("staff").emit("internal_typing:stop", { userId });
						}
					});

					socket.on("disconnect", () => {
						console.log(`🔴 WebSocket déconnecté: ${socket.id}`);
					});
				});
				console.log("🔌 Socket.IO server started");

				// Export io globally for use in routes
				(global as any).io = io;

				// Initialize MessageSocketService
				initMessageSocketService(io);

				// Initialize SSE Service
				initSSEService();
			} catch (error) {
				console.error("⚠️ Erreur lors du démarrage de Socket.IO:", error);
			}

			// Démarrer le service de fluctuation des prix des actions
			try {
				stockPriceFluctuationService.start();
				console.log(`📈 Service de fluctuation des prix démarré`);
			} catch (error) {
				console.error(
					"⚠️ Erreur lors du démarrage de la fluctuation des prix:",
					error
				);
			}

			// Si le service émet des mises à jour, les diffuser via socket.io
			try {
				stockPriceFluctuationService.on("priceUpdated", (payload) => {
					if (io) {
						io.emit("stock_price_update", payload);
					}
				});
			} catch (err) {
				console.error(
					"⚠️ Erreur lors du binding Socket.IO avec la fluctuation:",
					err
				);
			}
		});

		// Gestion propre de l'arrêt du serveur
		process.on("SIGTERM", () => {
			console.log("SIGTERM signal received: closing HTTP server");
			const cronService = getCronService();
			cronService.stop();
			stockPriceFluctuationService.stop();
			if (io) {
				io.close();
			}
			process.exit(0);
		});

		process.on("SIGINT", () => {
			console.log("SIGINT signal received: closing HTTP server");
			const cronService = getCronService();
			cronService.stop();
			stockPriceFluctuationService.stop();
			if (io) {
				io.close();
			}
			process.exit(0);
		});
	});
}

export default app;
