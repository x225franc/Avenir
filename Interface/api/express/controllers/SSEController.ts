import { Request, Response } from "express";
import { getSSEService } from "../../../../Infrastructure/services/SSEService";
import { v4 as uuidv4 } from "uuid";

export class SSEController {
	/**
	 * GET /api/sse/stream
	 * Établir une connexion SSE
	 */
	async connect(req: Request, res: Response): Promise<void> {
		const { userId, role } = req.query;
		const clientId = uuidv4();

		const sseService = getSSEService();
		sseService.addClient(
			clientId,
			res,
			userId ? parseInt(userId as string) : undefined,
			role as string | undefined
		);

		// La connexion reste ouverte jusqu'à ce que le client se déconnecte
		// ou que le serveur ferme la connexion
	}

	/**
	 * POST /api/sse/broadcast
	 * Diffuser un événement à tous les clients (pour tests)
	 */
	async broadcast(req: Request, res: Response): Promise<void> {
		try {
			const { event, data } = req.body;

			if (!event) {
				res.status(400).json({
					success: false,
					error: "Event name is required",
				});
				return;
			}

			const sseService = getSSEService();
			sseService.broadcast(event, data || {});

			res.status(200).json({
				success: true,
				message: `Event "${event}" broadcasted to ${sseService.getClientCount()} clients`,
			});
		} catch (error: any) {
			console.error("Error in broadcast:", error);
			res.status(500).json({
				success: false,
				error: error.message || "Server error",
			});
		}
	}
}
