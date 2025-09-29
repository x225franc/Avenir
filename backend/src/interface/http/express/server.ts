import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
// import { config } from "../../infrastructure/config/database";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de test
app.get("/", (req, res) => {
	res.json({
		message: "Banque AVENIR API - Express Server",
		version: "1.0.0",
		framework: "Express.js",
	});
});

app.get("/health", (req, res) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

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
			error: "Internal Server Error",
			message: err.message,
		});
	}
);

// Gestionnaire 404
app.use("*", (req, res) => {
	res.status(404).json({
		error: "Route not found",
		path: req.originalUrl,
	});
});

// Démarrage du serveur
if (require.main === module) {
	app.listen(PORT, () => {
		console.log(`🚀 Express Server running on http://localhost:${PORT}`);
		console.log(`📊 Health check: http://localhost:${PORT}/health`);
	});
}

export default app;
