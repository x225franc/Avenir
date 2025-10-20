"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../src/contexts/AuthContext";

export default function Home() {
	const router = useRouter();
	const { isAuthenticated, loading } = useAuth();

	useEffect(() => {
		// Si l'utilisateur est connecté, rediriger vers le dashboard
		if (!loading && isAuthenticated) {
			router.push("/dashboard");
		}
	}, [isAuthenticated, loading, router]);

	// Afficher un loader pendant la vérification
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Chargement...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
			<section className="relative overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
					<div className="text-center">
						<h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-6">
							<span className="block">Bienvenue chez</span>
							<span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								Banque AVENIR
							</span>
						</h1>
						<p className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600">
							Alliance de Valeurs Économiques et Nationnales Investies
							Responsablement
						</p>
						<p className="mt-4 max-w-3xl mx-auto text-lg text-gray-500">
							Gérez vos finances en toute simplicité avec notre plateforme
							moderne et sécurisée
						</p>
						<div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								href="/register"
								className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
							>
								Ouvrir un compte
							</Link>
							<Link
								href="/login"
								className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl border-2 border-gray-200"
							>
								Se connecter
							</Link>
						</div>
					</div>
				</div>

				<div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
					<div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
					<div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
					<div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
				</div>
			</section>

			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Vos finances, simplifiées
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Des outils puissants pour gérer votre argent comme un pro
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow">
							<div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
								<svg
									className="w-8 h-8 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-3">
								Sécurité maximale
							</h3>
							<p className="text-gray-600">
								Vos données sont protégées par un chiffrement de niveau
								bancaire et une authentification à double facteur.
							</p>
						</div>

						<div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-shadow">
							<div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
								<svg
									className="w-8 h-8 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
									/>
								</svg>
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-3">
								Investissement facile
							</h3>
							<p className="text-gray-600">
								Investissez dans des actions avec des frais réduits et suivez
								votre portefeuille en temps réel.
							</p>
						</div>

						<div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow">
							<div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
								<svg
									className="w-8 h-8 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-3">
								Épargne rémunérée
							</h3>
							<p className="text-gray-600">
								Faites fructifier votre argent avec nos comptes d'épargne à
								taux compétitifs, calculés quotidiennement.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-4xl font-bold text-gray-900 mb-6">
						Prêt à commencer ?
					</h2>
					<p className="text-xl text-gray-600 mb-10">
						Ouvrez votre compte en quelques minutes et profitez de tous nos
						services dès aujourd'hui.
					</p>
					<Link
						href="/register"
						className="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
					>
						Ouvrir un compte gratuitement
					</Link>
				</div>
			</section>
		</div>
	);
}
