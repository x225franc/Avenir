"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/contexts/AuthContext";
import { creditService, Credit } from "../../../components/lib/api/credit.service";

export default function MyCreditsPage() {
	const router = useRouter();
	const { user, loading: authLoading, isAuthenticated } = useAuth();
	const [credits, setCredits] = useState<Credit[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/login");
			return;
		}

		if (isAuthenticated && user) {
			loadCredits();
		}
	}, [authLoading, isAuthenticated, user, router]);

	const loadCredits = async () => {
		if (!user?.id) return;

		try {
			setLoading(true);
			setError(null);

			const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
			const response = await creditService.getUserCredits(userId);
			
			if (response.success) {
				setCredits(response.credits || []);
			} else {
				setError("Erreur lors du chargement des crédits");
			}
		} catch (err: any) {
			console.error("Error loading credits:", err);
			// Ne pas afficher d'erreur si c'est une erreur d'authentification (l'utilisateur sera redirigé)
			if (err.response?.status !== 401) {
				setError("Erreur lors du chargement des crédits");
			}
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return (
					<span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
						Actif
					</span>
				);
			case "paid_off":
				return (
					<span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
						Remboursé
					</span>
				);
			case "defaulted":
				return (
					<span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
						En défaut
					</span>
				);
			default:
				return null;
		}
	};

	if (authLoading || loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">Chargement des crédits...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Mes Crédits
					</h1>
					<p className="text-xl text-gray-600">
						Consultez l'état de vos crédits en cours
					</p>
				</div>

				{error && (
					<div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-sm text-red-800">{error}</p>
					</div>
				)}

				{credits.length > 0 ? (
					<div className="space-y-6">
						{credits.map((credit) => (
							<div
								key={credit.id}
								className="bg-white rounded-xl shadow-lg overflow-hidden"
							>
								<div className="p-6">
									<div className="flex justify-between items-start mb-4">
										<div>
											<h3 className="text-2xl font-bold text-gray-900">
												Crédit #{credit.id}
											</h3>
											<p className="text-sm text-gray-500 mt-1">
												Créé le{" "}
												{new Date(credit.createdAt).toLocaleDateString("fr-FR")}
											</p>
										</div>
										{getStatusBadge(credit.status)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
										<div className="bg-gray-50 rounded-lg p-4">
											<p className="text-sm text-gray-500 mb-1">
												Capital initial
											</p>
											<p className="text-2xl font-bold text-gray-900">
												{credit.principalAmount.toLocaleString("fr-FR", {
													style: "currency",
													currency: "EUR",
												})}
											</p>
										</div>

										<div className="bg-gray-50 rounded-lg p-4">
											<p className="text-sm text-gray-500 mb-1">
												Capital restant
											</p>
											<p className="text-2xl font-bold text-gray-900">
												{credit.remainingBalance.toLocaleString("fr-FR", {
													style: "currency",
													currency: "EUR",
												})}
											</p>
										</div>

										<div className="bg-gray-50 rounded-lg p-4">
											<p className="text-sm text-gray-500 mb-1">Mensualité</p>
											<p className="text-2xl font-bold text-blue-600">
												{credit.monthlyPayment.toLocaleString("fr-FR", {
													style: "currency",
													currency: "EUR",
												})}
											</p>
										</div>
									</div>

									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
										<div>
											<p className="text-gray-500">Durée totale</p>
											<p className="font-semibold text-gray-900">
												{credit.durationMonths} mois
											</p>
										</div>
										<div>
											<p className="text-gray-500">Mois restants</p>
											<p className="font-semibold text-gray-900">
												{credit.remainingMonths} mois
											</p>
										</div>
										<div>
											<p className="text-gray-500">Taux annuel</p>
											<p className="font-semibold text-gray-900">
												{(credit.annualInterestRate * 100).toFixed(2)}%
											</p>
										</div>
										<div>
											<p className="text-gray-500">Taux assurance</p>
											<p className="font-semibold text-gray-900">
												{(credit.insuranceRate * 100).toFixed(2)}%
											</p>
										</div>
									</div>

								{credit.status === "active" && (
									<div className="mt-6 bg-blue-50 rounded-lg p-4">
										<div className="flex items-start">
											<i className="fi fi-rr-bulb text-blue-600 text-xl mt-0.5 mr-2"></i>
											<p className="text-sm text-blue-800">
													Les mensualités sont prélevées automatiquement chaque
													mois sur votre compte.
												</p>
											</div>
										</div>
									)}

								{credit.status === "paid_off" && (
									<div className="mt-6 bg-green-50 rounded-lg p-4">
										<div className="flex items-start">
											<i className="fi fi-rr-check-circle text-green-600 text-xl mt-0.5 mr-2"></i>
											<p className="text-sm text-green-800">
													Félicitations ! Ce crédit a été entièrement remboursé.
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12 bg-white rounded-xl shadow-lg">
						<i className="fi fi-rr-document text-gray-400 text-6xl mb-3 block"></i>
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							Aucun crédit
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							Vous n'avez actuellement aucun crédit actif.
						</p>
						<div className="mt-6">
							<a
								href="/dashboard"
								className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
							>
								Retour au dashboard
							</a>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
