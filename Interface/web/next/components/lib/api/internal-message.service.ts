import apiClient, { ApiResponse } from "./client";

export interface InternalMessage {
	id: number;
	fromUserId: number;
	toUserId: number | null;
	content: string;
	isGroupMessage: boolean;
	isRead: boolean;
	createdAt: string;
}

export interface StaffMember {
	id: number;
	firstName: string;
	lastName: string;
	fullName: string;
	email: string;
	role: "advisor" | "director";
}

export const internalMessageApi = {
	/**
	 * Envoyer un message interne (groupe ou direct)
	 */
	sendMessage: async (
		fromUserId: string,
		content: string,
		isGroupMessage: boolean = true,
		toUserId?: string
	): Promise<{ success: boolean; data?: InternalMessage; error?: string }> => {
		try {
			const response = await apiClient.post("/internal-messages", {
				fromUserId,
				content,
				isGroupMessage,
				toUserId,
			});
			return response.data;
		} catch (error: any) {
			console.error("Error sending internal message:", error);
			return {
				success: false,
				error: error.response?.data?.error || error.message,
			};
		}
	},

	/**
	 * Récupérer les messages internes
	 */
	getMessages: async (
		userId: string,
		type: "group" | "direct" = "group",
		otherUserId?: string
	): Promise<{ success: boolean; data?: InternalMessage[]; error?: string }> => {
		try {
			const params = new URLSearchParams({ userId, type });
			if (otherUserId) params.append("otherUserId", otherUserId);

			const response = await apiClient.get(
				`/internal-messages?${params.toString()}`
			);
			return response.data;
		} catch (error: any) {
			console.error("Error fetching internal messages:", error);
			return {
				success: false,
				error: error.response?.data?.error || error.message,
			};
		}
	},

	/**
	 * Récupérer tous les conseillers et directeurs
	 */
	getStaffMembers: async (): Promise<{
		success: boolean;
		data?: StaffMember[];
		error?: string;
	}> => {
		try {
			const response = await apiClient.get("/internal-messages/staff-members");
			return response.data;
		} catch (error: any) {
			console.error("Error fetching staff members:", error);
			return {
				success: false,
				error: error.response?.data?.error || error.message,
			};
		}
	},
};
