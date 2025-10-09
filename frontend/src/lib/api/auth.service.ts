import apiClient, { ApiResponse } from "./client";

/**
 * DTOs (correspondent aux DTOs du backend)
 */
export interface RegisterUserDTO {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	address?: string;
}

export interface LoginUserDTO {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	userId: string;
	email: string;
	role: string;
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
	createdAt: string;
}

/**
 * Service pour les opérations utilisateur
 */
export const authService = {
	/**
	 * Inscription d'un nouvel utilisateur
	 */
	async register(data: RegisterUserDTO): Promise<ApiResponse> {
		const response = await apiClient.post<ApiResponse>("/users/register", data);
		return response.data;
	},

	/**
	 * Connexion d'un utilisateur
	 */
	async login(data: LoginUserDTO): Promise<ApiResponse<LoginResponse>> {
		const response = await apiClient.post<ApiResponse<LoginResponse>>(
			"/users/login",
			data
		);

		// Sauvegarder le token dans le localStorage
		if (response.data.success && response.data.data?.token) {
			localStorage.setItem("token", response.data.data.token);
		}

		return response.data;
	},

	/**
	 * Déconnexion
	 */
	logout(): void {
		localStorage.removeItem("token");
		window.location.href = "/login";
	},

	/**
	 * Récupérer les informations de l'utilisateur connecté
	 */
	async getMe(): Promise<ApiResponse<User>> {
		const response = await apiClient.get<ApiResponse<User>>("/users/me");
		return response.data;
	},
};
