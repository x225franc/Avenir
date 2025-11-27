import { Response } from "express";

interface SSEClient {
	id: string;
	userId?: number;
	role?: string;
	res: Response;
}

export class SSEService {
	private clients: Map<string, SSEClient> = new Map();

	/**
	 * Enregistrer un nouveau client SSE
	 */
	addClient(clientId: string, res: Response, userId?: number, role?: string): void {
		// Configuration des headers SSE
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.flushHeaders();

		this.clients.set(clientId, { id: clientId, userId, role, res });

		// Envoyer un message de connexion
		this.sendToClient(clientId, "connected", { message: "SSE connection established" });

		console.log(`✅ SSE client connected: ${clientId} (userId: ${userId}, role: ${role})`);

		// Nettoyer quand le client se déconnecte
		res.on("close", () => {
			this.removeClient(clientId);
		});
	}

	/**
	 * Retirer un client
	 */
	removeClient(clientId: string): void {
		const client = this.clients.get(clientId);
		if (client) {
			client.res.end();
			this.clients.delete(clientId);
			console.log(`🔴 SSE client disconnected: ${clientId}`);
		}
	}

	/**
	 * Envoyer un événement à un client spécifique
	 */
	sendToClient(clientId: string, event: string, data: any): void {
		const client = this.clients.get(clientId);
		if (client) {
			client.res.write(`event: ${event}\n`);
			client.res.write(`data: ${JSON.stringify(data)}\n\n`);
		}
	}

	/**
	 * Envoyer un événement à tous les clients
	 */
	broadcast(event: string, data: any): void {
		console.log(`📡 Broadcasting SSE event "${event}" to ${this.clients.size} clients`);
		this.clients.forEach((client) => {
			client.res.write(`event: ${event}\n`);
			client.res.write(`data: ${JSON.stringify(data)}\n\n`);
		});
	}

	/**
	 * Envoyer à tous les clients d'un rôle spécifique
	 */
	broadcastToRole(event: string, data: any, role: string): void {
		let count = 0;
		this.clients.forEach((client) => {
			if (client.role === role) {
				client.res.write(`event: ${event}\n`);
				client.res.write(`data: ${JSON.stringify(data)}\n\n`);
				count++;
			}
		});
		console.log(`📡 Broadcasted SSE event "${event}" to ${count} ${role}s`);
	}

	/**
	 * Envoyer à un utilisateur spécifique
	 */
	sendToUser(event: string, data: any, userId: number): void {
		this.clients.forEach((client) => {
			if (client.userId === userId) {
				client.res.write(`event: ${event}\n`);
				client.res.write(`data: ${JSON.stringify(data)}\n\n`);
			}
		});
	}

	/**
	 * Obtenir le nombre de clients connectés
	 */
	getClientCount(): number {
		return this.clients.size;
	}

	/**
	 * Envoyer un heartbeat pour maintenir la connexion
	 */
	sendHeartbeat(): void {
		this.clients.forEach((client) => {
			client.res.write(`: heartbeat\n\n`);
		});
	}
}

// Instance globale
let sseService: SSEService | null = null;

export function initSSEService(): void {
	sseService = new SSEService();
	
	// Heartbeat toutes les 30 secondes pour maintenir la connexion
	setInterval(() => {
		if (sseService) {
			sseService.sendHeartbeat();
		}
	}, 30000);
	
	console.log("✅ SSEService initialized");
}

export function getSSEService(): SSEService {
	if (!sseService) {
		throw new Error("SSEService not initialized. Call initSSEService first.");
	}
	return sseService;
}
