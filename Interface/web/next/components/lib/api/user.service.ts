import apiClient, { ApiResponse } from "./client";

/**
 * DTOs pour la gestion des utilisateurs
 */
export interface CreateUserDTO {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	address?: string;
	role: "client" | "advisor" | "director";
}

export interface UpdateUserDTO {
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	address?: string;
	role?: "client" | "advisor" | "director";
	emailVerified?: boolean;
}

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	phone?: string;
	address?: string;
	role: string;
	emailVerified: boolean;
	isBanned: boolean;
	createdAt: string;
	updatedAt: string;
}

/**
 * Service pour les opérations administratives sur les utilisateurs
 * Réservé aux directeurs (admins)
 */
export const userService = {
	/**
	 * Récupérer tous les utilisateurs (admin uniquement)
	 */
	async getAll(): Promise<ApiResponse<User[]>> {
		const response = await apiClient.get<ApiResponse<User[]>>("/admin/users");
		return response.data;
	},

	/**
	 * Récupérer un utilisateur par son ID (admin uniquement)
	 */
	async getById(userId: string): Promise<ApiResponse<User>> {
		const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${userId}`);
		return response.data;
	},

	/**
	 * Créer un nouvel utilisateur (admin uniquement)
	 */
	async create(data: CreateUserDTO): Promise<ApiResponse<{ userId: string }>> {
		const response = await apiClient.post<ApiResponse<{ userId: string }>>(
			"/admin/users",
			data
		);
		return response.data;
	},

	/**
	 * Mettre à jour un utilisateur (admin uniquement)
	 */
	async update(userId: string, data: UpdateUserDTO): Promise<ApiResponse<User>> {
		const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${userId}`, data);
		return response.data;
	},

	/**
	 * Supprimer un utilisateur (admin uniquement)
	 */
	async delete(userId: string): Promise<ApiResponse<void>> {
		const response = await apiClient.delete<ApiResponse<void>>(`/admin/users/${userId}`);
		return response.data;
	},

	/**
	 * Bannir un utilisateur (admin uniquement)
	 */
	async ban(userId: string): Promise<ApiResponse<User>> {
		const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${userId}/ban`);
		return response.data;
	},

	/**
	 * Débannir un utilisateur (admin uniquement)
	 */
	async unban(userId: string): Promise<ApiResponse<User>> {
		const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${userId}/unban`);
		return response.data;
	},

	/**
	 * Récupérer tous les utilisateurs pour consultation (advisor)
	 */
	async getAllForAdvisor(): Promise<ApiResponse<User[]>> {
		const response = await apiClient.get<ApiResponse<User[]>>("/advisor/clients");
		return response.data;
	},
};