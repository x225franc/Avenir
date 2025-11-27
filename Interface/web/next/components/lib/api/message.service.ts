import apiClient, { ApiResponse } from "./client";

export interface Message {
	id?: number;
	fromUserId: string | null;
	toUserId: string | null;
	content: string;
	isRead: boolean;
	isSystem: boolean;
	createdAt: Date | string;
}

export interface Conversation {
	id: string;
	clientId: string;
	advisorId: string | null;
	isClosed: boolean;
	isAssigned: boolean;
	unreadCount: number;
	lastMessageAt: Date | string;
	createdAt: Date | string;
	messages: Message[];
}

export const messageApi = {
	/**
	 * Envoyer un message
	 */
	sendMessage: async (
		conversationId: string,
		fromUserId: number,
		content: string,
		toUserId?: number
	): Promise<{ success: boolean; data?: any; error?: string }> => {
		try {
			const response = await apiClient.post("/messages/send", {
				conversationId,
				fromUserId,
				toUserId,
				content,
			});
			return response.data;
		} catch (error: any) {
			console.error("Error sending message:", error);
			return {
				success: false,
				error: error.response?.data?.error || error.message,
			};
		}
	},

	/**
	 * Récupérer les conversations d'un utilisateur
	 */
	getConversations: async (
		userId: number,
		role: "client" | "advisor"
	): Promise<{ success: boolean; data?: Conversation[]; error?: string }> => {
		try {
			const response = await apiClient.get(
				`/messages/conversations?userId=${userId}&role=${role}`
			);
			return response.data;
		} catch (error: any) {
			console.error("Error fetching conversations:", error);
			return {
				success: false,
				error: error.response?.data?.error || error.message,
			};
		}
	},

	/**
	 * Récupérer une conversation spécifique
	 */
	getConversation: async (
		conversationId: string
	): Promise<{ success: boolean; data?: Conversation; error?: string }> => {
		try {
			const response = await apiClient.get(
				`/messages/conversation/${conversationId}`
			);
			return response.data;
		} catch (error: any) {
			console.error("Error fetching conversation:", error);
			return {
				success: false,
				error: error.response?.data?.error || error.message,
			};
		}
	},

	/**
	 * Assigner une conversation à un conseiller
	 */
	assignConversation: async (
		conversationId: string,
		advisorId: number
	): Promise<{ success: boolean; error?: string }> => {
		try {
			const response = await apiClient.post("/messages/assign", {
				conversationId,
				advisorId,
			});
			return response.data;
		} catch (error: any) {
			console.error("Error assigning conversation:", error);
			return {
				success: false,
				error: error.response?.data?.error || error.message,
			};
		}
	},

	/**
	 * Transférer une conversation
	 */
	transferConversation: async (
		conversationId: string,
		newAdvisorId: number,
		currentAdvisorId: number
	): Promise<{ success: boolean; error?: string }> => {
		try {
			const response = await apiClient.post("/messages/transfer", {
				conversationId,
				newAdvisorId,
				currentAdvisorId,
			});
			return response.data;
		} catch (error: any) {
			console.error("Error transferring conversation:", error);
			return {
				success: false,
				error: error.response?.data?.error || error.message,
			};
		}
	},

	/**
	 * Clôturer une conversation
	 */
	closeConversation: async (
		conversationId: string,
		advisorId: number
	): Promise<{ success: boolean; error?: string }> => {
		try {
			const response = await apiClient.post("/messages/close", {
				conversationId,
				advisorId,
			});
			return response.data;
		} catch (error: any) {
			console.error("Error closing conversation:", error);
			return {
				success: false,
				error: error.response?.data?.error || error.message,
			};
		}
	},

	/**
	 * Marquer une conversation comme lue
	 */
	markAsRead: async (
		conversationId: string,
		userId: number
	): Promise<{ success: boolean; error?: string }> => {
		try {
			const response = await apiClient.post("/messages/mark-read", {
				conversationId,
				userId,
			});
			return response.data;
		} catch (error: any) {
			console.error("Error marking as read:", error);
			return {
				success: false,
				error: error.response?.data?.error || error.message,
			};
		}
	},

	/**
	 * Vérifier si un client a une conversation ouverte
	 */
	checkOpenConversation: async (
		clientId: number
	): Promise<{
		success: boolean;
		data?: { hasOpenConversation: boolean };
		error?: string;
	}> => {
		try {
			const response = await apiClient.get(`/messages/check-open/${clientId}`);
			return response.data;
		} catch (error: any) {
			console.error("Error checking open conversation:", error);
			return {
				success: false,
				error: error.response?.data?.error || error.message,
			};
		}
	},
};
