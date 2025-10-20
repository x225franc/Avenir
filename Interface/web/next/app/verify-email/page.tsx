"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import apiClient from "../../src/lib/api/client";
import { useAuth } from "../../src/contexts/AuthContext";

export default function VerifyEmailPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const { loading: authLoading, isAuthenticated } = useAuth();
	const [loading, setLoading] = useState(true);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string>("");

	useEffect(() => {
			// Rediriger si authentifié
			if (isAuthenticated) {
				router.push("/dashboard");
				return;
			}
		}, [authLoading, isAuthenticated, router]);


	useEffect(() => {
		const verifyEmail = async () => {
			if (!token) {
				setError("Token de vérification manquant");
				setLoading(false);
				return;
			}

			try {
				const response = await apiClient.get(`/users/verify-email?token=${token}`);

				if (response.data.success) {
					setSuccess(true);
					// Rediriger vers la page de connexion après 3 secondes
					setTimeout(() => {
						router.push("/login");
					}, 3000);
				} else {
					setError(response.data.error || "Erreur lors de la vérification");
				}
			} catch (err: any) {
				setError(
					err.response?.data?.error || "Erreur lors de la vérification de l'email"
				);
			} finally {
				setLoading(false);
			}
		};

		verifyEmail();
	}, [token, router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						🏦 Banque AVENIR
					</h1>
					<p className="text-gray-600">Vérification de votre email</p>
				</div>

				{/* Loading */}
				{loading && (
					<div className="py-8">
						<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">Vérification en cours...</p>
					</div>
				)}

				{/* Success */}
				{!loading && success && (
					<div className="py-8">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg
								className="w-8 h-8 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">Email vérifié !</h2>
						<p className="text-gray-600 mb-6">
							Votre email a été vérifié avec succès. Vous allez être redirigé vers la
							page de connexion...
						</p>
						<Link
							href="/login"
							className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
						>
							Se connecter maintenant
						</Link>
					</div>
				)}

				{/* Error */}
				{!loading && error && (
					<div className="py-8">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg
								className="w-8 h-8 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Erreur de vérification
						</h2>
						<p className="text-red-600 mb-6">{error}</p>
						<div className="space-y-3">
							<Link
								href="/register"
								className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
							>
								S'inscrire à nouveau
							</Link>
							<Link
								href="/login"
								className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
							>
								Retour à la connexion
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
