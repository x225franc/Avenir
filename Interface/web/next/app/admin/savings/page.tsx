"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema de validation Zod
const savingsRateSchema = z.object({
	rate: z
		.number()
		.min(0, "Le taux ne peut pas être négatif")
		.max(100, "Le taux ne peut pas dépasser 100%"),
});

type SavingsRateFormData = z.infer<typeof savingsRateSchema>;

export default function SavingsRatePage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [loadingRate, setLoadingRate] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [currentRate, setCurrentRate] = useState<number | null>(null);
	const [updateResult, setUpdateResult] = useState<{
		oldRate: number;
		newRate: number;
		notifiedUsers: number;
	} | null>(null);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<SavingsRateFormData>({
		resolver: zodResolver(savingsRateSchema),
	});

	// Récupérer le taux actuel au chargement
	useEffect(() => {
		fetchCurrentRate();
	}, []);

	const fetchCurrentRate = async () => {
		try {
			setLoadingRate(true);
			const token = localStorage.getItem("token");

			if (!token) {
				router.push("/admin/login");
				return;
			}

			const response = await fetch(
				"http://localhost:3001/api/admin/savings-rate",
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			const data = await response.json();

			if (data.success && data.data) {
				setCurrentRate(data.data.rate);
				setValue("rate", data.data.rate);
			} else {
				setError("Erreur lors de la récupération du taux actuel");
			}
		} catch (error) {
			console.error("Error fetching rate:", error);
			setError("Erreur lors de la récupération du taux actuel");
		} finally {
			setLoadingRate(false);
		}
	};

	const onSubmit = async (data: SavingsRateFormData) => {
		setLoading(true);
		setError(null);
		setSuccess(null);
		setUpdateResult(null);

		try {
			const token = localStorage.getItem("token");

			if (!token) {
				router.push("/admin/login");
				return;
			}

			const response = await fetch(
				"http://localhost:3001/api/admin/savings-rate",
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ rate: data.rate }),
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || "Erreur lors de la mise à jour");
			}

			if (result.success) {
				setSuccess(result.message);
				setUpdateResult(result.data);
				setCurrentRate(result.data.newRate);
				setValue("rate", result.data.newRate);
			} else {
				setError(result.message || "Erreur lors de la mise à jour du taux");
			}
		} catch (error: any) {
			console.error("Error updating rate:", error);
			setError(
				error.message || "Erreur lors de la mise à jour du taux d'épargne"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-purple-900">
								📊 Gestion du Taux d&apos;Épargne
							</h1>
							<p className="text-purple-600 mt-2">
								Définissez le taux d&apos;intérêt annuel pour les comptes
								d&apos;épargne
							</p>
						</div>
						<Link
							href="/admin/dashboard"
							className="text-purple-600 hover:text-purple-800 font-medium"
						>
							← Retour au tableau de bord
						</Link>
					</div>
				</div>

				{/* Taux actuel */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<h2 className="text-xl font-bold text-gray-800 mb-4">
						Taux Actuel
					</h2>
					{loadingRate ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
						</div>
					) : (
						<div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-8 text-center">
							<p className="text-white text-sm font-medium mb-2">
								Taux d&apos;Intérêt Annuel
							</p>
							<p className="text-white text-6xl font-bold">
								{currentRate !== null ? `${currentRate}%` : "N/A"}
							</p>
						</div>
					)}
				</div>

				{/* Formulaire de modification */}
				<div className="bg-white rounded-lg shadow-lg p-6">
					<h2 className="text-xl font-bold text-gray-800 mb-6">
						Modifier le Taux d&apos;Épargne
					</h2>

					{/* Messages d'erreur/succès */}
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-800">❌ {error}</p>
						</div>
					)}

					{success && (
						<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
							<p className="text-green-800 font-medium">✅ {success}</p>
							{updateResult && (
								<div className="mt-3 text-sm text-green-700">
									<p>• Ancien taux : {updateResult.oldRate}%</p>
									<p>• Nouveau taux : {updateResult.newRate}%</p>
									<p>
										• Notifications envoyées : {updateResult.notifiedUsers}{" "}
										client(s)
									</p>
								</div>
							)}
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						{/* Champ Taux */}
						<div>
							<label
								htmlFor="rate"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Nouveau Taux d&apos;Intérêt Annuel (%)
							</label>
							<div className="relative">
								<input
									type="number"
									id="rate"
									step="0.01"
									{...register("rate", { valueAsNumber: true })}
									className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
										errors.rate ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="Ex: 2.5"
								/>
								<span className="absolute right-3 top-3 text-gray-500">%</span>
							</div>
							{errors.rate && (
								<p className="mt-1 text-sm text-red-600">
									{errors.rate.message}
								</p>
							)}
							<p className="mt-2 text-sm text-gray-500">
								⚠️ La modification du taux enverra automatiquement une
								notification par email à tous les clients possédant un compte
								d&apos;épargne.
							</p>
						</div>

						{/* Informations importantes */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h3 className="text-blue-900 font-semibold mb-2">
								ℹ️ Informations importantes
							</h3>
							<ul className="text-blue-800 text-sm space-y-1">
								<li>
									• Le nouveau taux sera appliqué immédiatement à tous les
									comptes d&apos;épargne
								</li>
								<li>
									• Les intérêts sont calculés quotidiennement sur le solde
									actuel
								</li>
								<li>
									• Tous les clients avec un compte d&apos;épargne recevront un
									email de notification
								</li>
								<li>
									• Le taux doit être compris entre 0% et 100%
								</li>
							</ul>
						</div>

						{/* Boutons */}
						<div className="flex gap-4">
							<button
								type="submit"
								disabled={loading || loadingRate}
								className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<span className="flex items-center justify-center">
										<svg
											className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Mise à jour en cours...
									</span>
								) : (
									"Mettre à jour et notifier les clients"
								)}
							</button>

							<button
								type="button"
								onClick={fetchCurrentRate}
								disabled={loading || loadingRate}
								className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
							>
								🔄 Actualiser
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
