"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, LoginFormData } from "../../src/lib/validations/schemas";
import { useAuth } from "../../src/contexts/AuthContext";

export default function LoginPage() {
	const router = useRouter();
	const { login } = useAuth();
	const { loading: authLoading, isAuthenticated } = useAuth();
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	useEffect(() => {
			// Rediriger si authentifié
			if (isAuthenticated) {
				router.push("/dashboard");
				return;
			}
		}, [authLoading, isAuthenticated, router]);

	const onSubmit = async (data: LoginFormData) => {
		setLoading(true);
		setError("");

		try {
			await login(data.email, data.password);
			// Succès : redirection vers le dashboard
			router.push("/dashboard");
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
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						🏦 Banque AVENIR
					</h1>
					<p className="text-gray-600">Connectez-vous à votre compte</p>
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
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						{loading ? "Connexion..." : "Se connecter"}
					</button>
				</form>

				{/* Lien vers inscription */}
				<p className="mt-6 text-center text-sm text-gray-600">
					Pas encore de compte ?{" "}
					<Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
						S'inscrire
					</Link>
				</p>
			</div>
		</div>
	);
}
