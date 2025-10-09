"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, User } from "../lib/api/auth.service";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider pour gérer l'authentification dans toute l'application
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	/**
	 * Récupère les informations de l'utilisateur au chargement
	 */
	useEffect(() => {
		const initAuth = async () => {
			const token = localStorage.getItem("token");

			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const response = await authService.getMe();
				if (response.success && response.data) {
					setUser(response.data);
				}
			} catch (error) {
				console.error("Erreur lors de la récupération de l'utilisateur:", error);
				localStorage.removeItem("token");
			} finally {
				setLoading(false);
			}
		};

		initAuth();
	}, []);

	/**
	 * Connexion de l'utilisateur
	 */
	const login = async (email: string, password: string) => {
		try {
			const response = await authService.login({ email, password });

			if (response.success && response.data) {
				// Récupérer les infos complètes de l'utilisateur
				try {
					const userResponse = await authService.getMe();
					if (userResponse.success && userResponse.data) {
						setUser(userResponse.data);
					} else {
						throw new Error(userResponse.error || "Impossible de récupérer les informations utilisateur");
					}
				} catch (getMeError: any) {
					// Si getMe échoue, on nettoie le token et on lance l'erreur
					localStorage.removeItem("token");
					throw new Error(getMeError.response?.data?.error || "Erreur lors de la récupération des informations utilisateur");
				}
			} else {
				throw new Error(response.error || "Email ou mot de passe incorrect");
			}
		} catch (error: any) {
			// Propager l'erreur avec un message clair
			if (error.response?.data?.error) {
				throw new Error(error.response.data.error);
			}
			throw error;
		}
	};

	/**
	 * Déconnexion de l'utilisateur
	 */
	const logout = () => {
		setUser(null);
		authService.logout();
	};

	/**
	 * Rafraîchir les informations de l'utilisateur
	 */
	const refreshUser = async () => {
		try {
			const response = await authService.getMe();
			if (response.success && response.data) {
				setUser(response.data);
			}
		} catch (error) {
			console.error("Erreur lors du rafraîchissement de l'utilisateur:", error);
		}
	};

	const value = {
		user,
		loading,
		isAuthenticated: !!user,
		login,
		logout,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook pour utiliser le contexte d'authentification
 */
export function useAuth() {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}
