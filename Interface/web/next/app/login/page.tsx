"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { loginSchema, LoginFormData } from "../../components/lib/validations/schemas";
import { useAuth } from "../../components/contexts/AuthContext";
import '@flaticon/flaticon-uicons/css/all/all.css';

export default function LoginPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { login, user } = useAuth();
	const { loading: authLoading, isAuthenticated } = useAuth();
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(false);

	// Détecter le type d'utilisateur basé sur l'URL
	const getUserTypeFromPath = () => {
		if (pathname.includes('/admin')) return 'director';
		if (pathname.includes('/advisor')) return 'advisor';
		return 'client';
	};

	const userType = getUserTypeFromPath();

	// Configuration des thèmes selon le type d'utilisateur
	const getThemeConfig = () => {
		switch (userType) {
			case 'director':
				return {
					title: 'Administration AVENIR',
					subtitle: 'Connexion directeur',
					gradient: 'from-purple-50 to-purple-100',
					buttonColor: 'bg-purple-600 hover:bg-purple-700',
					ringColor: 'focus:ring-purple-500',
					linkColor: 'text-purple-600 hover:text-purple-700',
					icon: <i className="fi fi-rr-briefcase text-purple-600"></i>
				};
			case 'advisor':
				return {
					title: 'Conseillers AVENIR',
					subtitle: 'Connexion conseiller',
					gradient: 'from-green-50 to-green-100',
					buttonColor: 'bg-green-600 hover:bg-green-700',
					ringColor: 'focus:ring-green-500',
					linkColor: 'text-green-600 hover:text-green-700',
					icon: <i className="fi fi-rr-user-headset text-green-600"></i>
				};
			default:
				return {
					title: 'Banque AVENIR',
					subtitle: 'Connectez-vous à votre compte',
					gradient: 'from-blue-50 to-indigo-100',
					buttonColor: 'bg-blue-600 hover:bg-blue-700',
					ringColor: 'focus:ring-blue-500',
					linkColor: 'text-blue-600 hover:text-blue-700',
					icon: <i className="fi fi-rr-user text-blue-600"></i>
				};
		}
	};

	const theme = getThemeConfig();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	useEffect(() => {
		// Rediriger si déjà authentifié au chargement de la page
		if (!authLoading && isAuthenticated && user) {
			if (user.role === 'director') {
				router.push("/admin/dashboard");
			} else if (user.role === 'advisor') {
				router.push("/advisor/dashboard");
			} else {
				router.push("/dashboard");
			}
		}
	}, [authLoading, isAuthenticated, user, router]);

	const onSubmit = async (data: LoginFormData) => {
		setLoading(true);
		setError("");

		try {
			const result = await login(data.email, data.password);
			// Redirection selon le rôle réel de l'utilisateur
			if (result.role === 'director') {
				router.push("/admin/dashboard");
			} else if (result.role === 'advisor') {
				router.push("/advisor/dashboard");
			} else {
				router.push("/dashboard");
			}
		} catch (err: any) {
			// Afficher l'erreur
			const errorMessage = err.message || "Email ou mot de passe incorrect";
			setError(errorMessage);
			console.error("Erreur de connexion:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={`min-h-screen flex items-center justify-center bg-linear-to-br ${theme.gradient} px-4`}>
			<div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						{theme.title}
					</h1>
					<p className="text-gray-600 flex items-center justify-center gap-2">
						{theme.icon}
						{theme.subtitle}
					</p>
				</div>

				{/* Message d'erreur */}
				{error && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
						{error}
					</div>
				)}

				{/* Formulaire */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Email */}
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							{...register("email")}
							type="email"
							id="email"
							className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${theme.ringColor} focus:border-transparent`}
							placeholder="votre@email.com"
						/>
						{errors.email && (
							<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
						)}
					</div>

					{/* Mot de passe */}
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
							Mot de passe
						</label>
						<input
							{...register("password")}
							type="password"
							id="password"
							className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${theme.ringColor} focus:border-transparent`}
							placeholder="••••••••"
						/>
						{errors.password && (
							<p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
						)}
					</div>

					{/* Lien mot de passe oublié */}
					<div className="text-right">
						<Link
							href="/forgot-password"
							className="text-sm text-blue-600 hover:text-blue-700"
						>
							Mot de passe oublié ?
						</Link>
					</div>

					{/* Bouton */}
					<button
						type="submit"
						disabled={loading}
						className={`w-full ${theme.buttonColor} text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed`}
					>
						{loading ? "Connexion..." : "Se connecter"}
					</button>
				</form>

				{/* Lien vers inscription */}
				<p className="mt-6 text-center text-sm text-gray-600">
					Pas encore de compte ?{" "}
					<Link 
						href={userType === 'client' ? '/register' : `/${userType === 'director' ? 'admin' : userType}/register`} 
						className={`${theme.linkColor} font-semibold`}
					>
						S'inscrire
					</Link>
				</p>
			</div>
		</div>
	);
}
