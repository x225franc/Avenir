import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000, // 10 secondes
});

apiClient.interceptors.request.use(
	(config) => {
		// Récupérer le token depuis le localStorage
		const token =
			typeof window !== "undefined" ? localStorage.getItem("token") : null;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

apiClient.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		// Gérer les erreurs 401 (non authentifié)
		if (error.response?.status === 401) {
			// Supprimer le token
			if (typeof window !== "undefined") {
				localStorage.removeItem("token");

				// Ne pas rediriger si on est déjà sur la page de login
				const currentPath = window.location.pathname;
				if (currentPath !== "/login" && currentPath !== "/register") {
					window.location.href = "/login";
				}
			}
		}

		return Promise.reject(error);
	}
);

export default apiClient;

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}
