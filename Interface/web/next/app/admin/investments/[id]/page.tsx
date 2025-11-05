"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema de validation Zod pour éditer une action
const editStockSchema = z.object({
	symbol: z
		.string()
		.min(1, "Le symbole est requis")
		.max(10, "Le symbole ne peut pas dépasser 10 caractères"),
	companyName: z
		.string()
		.min(1, "Le nom de l'entreprise est requis")
		.max(255, "Le nom ne peut pas dépasser 255 caractères"),
	isAvailable: z.boolean(),
});

type EditStockFormData = z.infer<typeof editStockSchema>;

interface Stock {
	id: string;
	symbol: string;
	companyName: string;
	currentPrice: number;
	currency: string;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
}

export default function EditStockPage() {
	const router = useRouter();
	const params = useParams();
	const stockId = params.id as string;

	const [stock, setStock] = useState<Stock | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<EditStockFormData>({
		resolver: zodResolver(editStockSchema),
	});

	useEffect(() => {
		fetchStock();
	}, [stockId]);

	const fetchStock = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");

			if (!token) {
				router.push("/admin/login");
				return;
			}

			// Récupérer toutes les actions et trouver celle-ci
			const response = await fetch("http://localhost:3001/api/admin/stocks", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();

			if (data.success && data.data) {
				const foundStock = data.data.find((s: Stock) => s.id === stockId);
				if (foundStock) {
					setStock(foundStock);
					setValue("symbol", foundStock.symbol);
					setValue("companyName", foundStock.companyName);
					setValue("isAvailable", foundStock.isAvailable);
				} else {
					setError("Action non trouvée");
				}
			} else {
				setError("Erreur lors de la récupération de l'action");
			}
		} catch (error) {
			console.error("Error fetching stock:", error);
			setError("Erreur lors de la récupération de l'action");
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = async (data: EditStockFormData) => {
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			const token = localStorage.getItem("token");

			if (!token) {
				router.push("/admin/login");
				return;
			}

			const response = await fetch(
				`http://localhost:3001/api/admin/stocks/${stockId}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						...data,
						symbol: data.symbol.toUpperCase().trim(),
					}),
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || "Erreur lors de la mise à jour");
			}

			if (result.success) {
				setSuccess("Action mise à jour avec succès !");
				setTimeout(() => {
					router.push("/admin/investments");
				}, 1500);
			} else {
				setError(result.message || "Erreur lors de la mise à jour de l'action");
			}
		} catch (error: any) {
			console.error("Error updating stock:", error);
			setError(error.message || "Erreur lors de la mise à jour de l'action");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Chargement...</p>
				</div>
			</div>
		);
	}

	if (!stock) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
				<div className="max-w-2xl mx-auto">
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h1 className="text-2xl font-bold text-red-600 mb-4">
							Action non trouvée
						</h1>
						<Link
							href="/admin/investments"
							className="text-purple-600 hover:text-purple-800 font-medium"
						>
							← Retour à la liste
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-purple-900">
								✏️ Modifier l&apos;Action
							</h1>
							<p className="text-purple-600 mt-2">
								{stock.symbol} - {stock.companyName}
							</p>
						</div>
						<Link
							href="/admin/investments"
							className="text-purple-600 hover:text-purple-800 font-medium"
						>
							← Retour à la liste
						</Link>
					</div>
				</div>

				{/* Messages */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-800">❌ {error}</p>
					</div>
				)}

				{success && (
					<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
						<p className="text-green-800">✅ {success}</p>
					</div>
				)}

				{/* Info prix */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
					<h3 className="text-blue-900 font-semibold mb-2">
						💡 Prix actuel (non modifiable)
					</h3>
					<div className="text-3xl font-bold text-blue-800">
						{stock.currentPrice.toFixed(2)} {stock.currency}
					</div>
					<p className="text-sm text-blue-700 mt-2">
						Le prix évolue automatiquement selon l&apos;offre et la demande. Vous
						ne pouvez pas le modifier manuellement.
					</p>
				</div>

				{/* Formulaire d'édition */}
				<div className="bg-white rounded-lg shadow-lg p-6">
					<h2 className="text-xl font-bold text-gray-800 mb-6">
						Informations Modifiables
					</h2>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						{/* Symbole */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Symbole de l&apos;action *
							</label>
							<input
								type="text"
								{...register("symbol")}
								className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
									errors.symbol ? "border-red-500" : "border-gray-300"
								}`}
								placeholder="Ex: AAPL"
							/>
							{errors.symbol && (
								<p className="mt-1 text-sm text-red-600">
									{errors.symbol.message}
								</p>
							)}
						</div>

						{/* Nom de l'entreprise */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Nom de l&apos;entreprise *
							</label>
							<input
								type="text"
								{...register("companyName")}
								className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
									errors.companyName ? "border-red-500" : "border-gray-300"
								}`}
								placeholder="Ex: Apple Inc."
							/>
							{errors.companyName && (
								<p className="mt-1 text-sm text-red-600">
									{errors.companyName.message}
								</p>
							)}
						</div>

						{/* Disponibilité */}
						<div className="border-t pt-6">
							<label className="flex items-center space-x-3 cursor-pointer">
								<input
									type="checkbox"
									{...register("isAvailable")}
									className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
								/>
								<div>
									<span className="text-sm font-medium text-gray-900">
										Action disponible à la négociation
									</span>
									<p className="text-sm text-gray-500">
										Si désactivée, les clients ne pourront plus acheter/vendre
										cette action
									</p>
								</div>
							</label>
						</div>

						{/* Boutons */}
						<div className="flex gap-4 pt-6 border-t">
							<button
								type="submit"
								disabled={saving}
								className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{saving ? "Enregistrement..." : "Enregistrer les modifications"}
							</button>
							<Link
								href="/admin/investments"
								className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-center"
							>
								Annuler
							</Link>
						</div>
					</form>
				</div>

				{/* Métadonnées */}
				<div className="mt-8 bg-gray-50 rounded-lg p-6">
					<h3 className="text-gray-800 font-semibold mb-4">Métadonnées</h3>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="text-gray-600">ID:</span>
							<span className="ml-2 font-mono text-gray-900">{stock.id}</span>
						</div>
						<div>
							<span className="text-gray-600">Devise:</span>
							<span className="ml-2 font-mono text-gray-900">
								{stock.currency}
							</span>
						</div>
						<div>
							<span className="text-gray-600">Créée le:</span>
							<span className="ml-2 text-gray-900">
								{new Date(stock.createdAt).toLocaleString("fr-FR")}
							</span>
						</div>
						<div>
							<span className="text-gray-600">Dernière mise à jour:</span>
							<span className="ml-2 text-gray-900">
								{new Date(stock.updatedAt).toLocaleString("fr-FR")}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
