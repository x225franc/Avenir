"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import '@flaticon/flaticon-uicons/css/all/all.css';

// Schema de validation Zod pour créer une action
const createStockSchema = z.object({
	symbol: z
		.string()
		.min(1, "Le symbole est requis")
		.max(10, "Le symbole ne peut pas dépasser 10 caractères"),
	companyName: z
		.string()
		.min(1, "Le nom de l'entreprise est requis")
		.max(255, "Le nom ne peut pas dépasser 255 caractères"),
	currentPrice: z
		.number()
		.positive("Le prix doit être positif")
		.min(0.01, "Le prix minimum est 0.01"),
	isAvailable: z.boolean(),
});

type CreateStockFormData = z.infer<typeof createStockSchema>;

interface Stock {
	id: string;
	symbol: string;
	companyName: string;
	currentPrice: number;
	currency: string;
	isAvailable: boolean;
	holdingsCount: number; // Nombre d'actions détenues par les utilisateurs
	createdAt: string;
	updatedAt: string;
}

export default function AdminInvestmentsPage() {
	const router = useRouter();
	const [stocks, setStocks] = useState<Stock[]>([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateStockFormData>({
		resolver: zodResolver(createStockSchema),
		defaultValues: {
			isAvailable: true,
		},
	});

	useEffect(() => {
		fetchStocks();
	}, []);

	const fetchStocks = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");

			if (!token) {
				router.push("/admin/login");
				return;
			}

			const response = await fetch("http://localhost:3001/api/admin/stocks", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();

			if (data.success && data.data) {
				setStocks(data.data);
			} else {
				setError("Erreur lors de la récupération des actions");
			}
		} catch (error) {
			console.error("Error fetching stocks:", error);
			setError("Erreur lors de la récupération des actions");
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = async (data: CreateStockFormData) => {
		setCreating(true);
		setError(null);
		setSuccess(null);

		try {
			const token = localStorage.getItem("token");

			if (!token) {
				router.push("/admin/login");
				return;
			}

			const response = await fetch("http://localhost:3001/api/admin/stocks", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
					symbol: data.symbol.toUpperCase().trim(),
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || "Erreur lors de la création");
			}

			if (result.success) {
				setSuccess(`Action ${data.symbol} créée avec succès !`);
				reset();
				setShowCreateForm(false);
				fetchStocks(); // Recharger la liste
			} else {
				setError(result.message || "Erreur lors de la création de l'action");
			}
		} catch (error: any) {
			console.error("Error creating stock:", error);
			setError(error.message || "Erreur lors de la création de l'action");
		} finally {
			setCreating(false);
		}
	};

	const handleToggleAvailability = async (stock: Stock) => {
		try {
			const token = localStorage.getItem("token");

			if (!token) {
				router.push("/admin/login");
				return;
			}

			const response = await fetch(
				`http://localhost:3001/api/admin/stocks/${stock.id}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						isAvailable: !stock.isAvailable,
					}),
				}
			);

			const result = await response.json();

			if (result.success) {
				setSuccess(
					`Action ${stock.symbol} ${
						!stock.isAvailable ? "activée" : "désactivée"
					} avec succès`
				);
				fetchStocks();
			} else {
				setError(result.message);
			}
		} catch (error: any) {
			console.error("Error toggling availability:", error);
			setError("Erreur lors de la modification");
		}
	};

	const handleDelete = async (stock: Stock) => {
		// Vérifier d'abord si l'action est détenue
		if (stock.holdingsCount > 0) {
			alert(
				`Impossible de supprimer cette action\n\n` +
					`${stock.holdingsCount} action(s) sont actuellement détenues par des clients.\n\n` +
					`Pour retirer cette action du marché, utilisez le bouton "Désactiver" à la place.`
			);
			return;
		}

		const confirmMessage =
			`Confirmer la suppression de l'action ${stock.symbol} (${stock.companyName}) ?\n\n` +
			`Cette action n'est détenue par aucun client (0 actions détenues).\n` +
			`La suppression est donc autorisée.\n\n` +
			`Continuer ?`;

		if (!confirm(confirmMessage)) {
			return;
		}

		try {
			const token = localStorage.getItem("token");

			if (!token) {
				router.push("/admin/login");
				return;
			}

			const response = await fetch(
				`http://localhost:3001/api/admin/stocks/${stock.id}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			const result = await response.json();

			if (result.success) {
				setSuccess(`Action ${stock.symbol} supprimée avec succès`);
				fetchStocks();
			} else {
				setError(result.message);
			}
		} catch (error: any) {
			console.error("Error deleting stock:", error);
			setError("Erreur lors de la suppression");
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8'>
			<div className='max-w-7xl mx-auto'>
				{/* Header */}
				<div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='text-3xl font-bold text-purple-900 flex items-center gap-2'>
								<i className="fi fi-rr-chart-line-up"></i>
								Gestion des Actions
							</h1>
							<p className='text-purple-600 mt-2'>
								Créez, modifiez et gérez la disponibilité des actions
							</p>
						</div>
						<Link
							href='/admin/dashboard'
							className='text-purple-600 hover:text-purple-800 font-medium'
						>
							← Retour au tableau de bord
						</Link>
					</div>
				</div>

				{/* Messages */}
				{error && (
					<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
						<p className='text-red-800 flex items-center gap-2'>
							<i className="fi fi-rr-cross-circle"></i>
							{error}
						</p>
					</div>
				)}

				{success && (
					<div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
						<p className='text-green-800 flex items-center gap-2'>
							<i className="fi fi-rr-check-circle"></i>
							{success}
						</p>
					</div>
				)}

				{/* Bouton Créer une action */}
				<div className='mb-8'>
					<button
						onClick={() => setShowCreateForm(!showCreateForm)}
						className='bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition'
					>
						{showCreateForm ? "✖ Annuler" : "+ Créer une nouvelle action"}
					</button>
				</div>

				{/* Formulaire de création */}
				{showCreateForm && (
					<div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
						<h2 className='text-xl font-bold text-gray-800 mb-6'>
							Nouvelle Action
						</h2>

						<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								{/* Symbole */}
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Symbole de l&apos;action *
									</label>
									<input
										type='text'
										{...register("symbol")}
										className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
											errors.symbol ? "border-red-500" : "border-gray-300"
										}`}
										placeholder='Ex: AAPL'
									/>
									{errors.symbol && (
										<p className='mt-1 text-sm text-red-600'>
											{errors.symbol.message}
										</p>
									)}
								</div>

								{/* Nom de l'entreprise */}
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Nom de l&apos;entreprise *
									</label>
									<input
										type='text'
										{...register("companyName")}
										className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
											errors.companyName ? "border-red-500" : "border-gray-300"
										}`}
										placeholder='Ex: Apple Inc.'
									/>
									{errors.companyName && (
										<p className='mt-1 text-sm text-red-600'>
											{errors.companyName.message}
										</p>
									)}
								</div>

								{/* Prix initial */}
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Prix initial (€) *
									</label>
									<input
										type='number'
										step='0.01'
										{...register("currentPrice", { valueAsNumber: true })}
										className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
											errors.currentPrice ? "border-red-500" : "border-gray-300"
										}`}
										placeholder='Ex: 150.25'
									/>
									{errors.currentPrice && (
										<p className='mt-1 text-sm text-red-600'>
											{errors.currentPrice.message}
										</p>
									)}
									<p className='mt-1 text-sm text-gray-500'>
										Le prix évoluera selon l&apos;offre et la demande
									</p>
								</div>

								{/* Disponibilité */}
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Disponibilité
									</label>
									<div className='flex items-center h-12'>
										<input
											type='checkbox'
											{...register("isAvailable")}
											className='w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
										/>
										<span className='ml-3 text-sm text-gray-700'>
											Action disponible à la négociation
										</span>
									</div>
								</div>
							</div>

							{/* Boutons */}
							<div className='flex gap-4 pt-4 border-t'>
								<button
									type='submit'
									disabled={creating}
									className='flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{creating ? "Création en cours..." : "Créer l'action"}
								</button>
								<button
									type='button'
									onClick={() => {
										setShowCreateForm(false);
										reset();
									}}
									className='px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition'
								>
									Annuler
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Liste des actions */}
				<div className='bg-white rounded-lg shadow-lg p-6'>
					<h2 className='text-xl font-bold text-gray-800 mb-6'>
						Actions Existantes ({stocks.length})
					</h2>

					{loading ? (
						<div className='flex items-center justify-center py-12'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
						</div>
					) : stocks.length === 0 ? (
						<div className='text-center py-12'>
							<i className="fi fi-rr-chart-line-up text-6xl text-purple-600"></i>
							<p className='mt-4 text-gray-600'>Aucune action créée</p>
							<p className='text-sm text-gray-500 mt-2'>
								Commencez par créer votre première action
							</p>
						</div>
					) : (
						<div className='overflow-x-auto'>
							<table className='min-w-full divide-y divide-gray-200'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Symbole
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Entreprise
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Prix Actuel
										</th>
										<th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Actions Détenues par les Clients
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Statut
										</th>
										<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{stocks.map((stock) => (
										<tr key={stock.id} className='hover:bg-gray-50'>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='flex items-center'>
													<div className='text-sm font-bold text-gray-900'>
														{stock.symbol}
													</div>
												</div>
											</td>
											<td className='px-6 py-4'>
												<div className='text-sm text-gray-900'>
													{stock.companyName}
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm font-semibold text-purple-600'>
													{stock.currentPrice.toFixed(2)} {stock.currency}
												</div>
												<div className='text-xs text-gray-500'>
													Mis à jour:{" "}
													{new Date(stock.updatedAt).toLocaleDateString()}
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-center'>
												<div
													className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
														stock.holdingsCount > 0
															? "bg-blue-100 text-blue-800"
															: "bg-gray-100 text-gray-600"
													}`}
												>
													{stock.holdingsCount > 0 ? (
														<>
															<i className='fi fi-rr-users text-sm mr-1'></i>
															{stock.holdingsCount}
														</>
													) : (
														"Aucune"
													)}
												</div>
												{stock.holdingsCount > 0 && (
													<div className='text-xs text-gray-500 mt-1'>
														action{stock.holdingsCount > 1 ? "s" : ""} détenue
														{stock.holdingsCount > 1 ? "s" : ""}
													</div>
												)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<span
													className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
														stock.isAvailable
															? "bg-green-100 text-green-800"
															: "bg-red-100 text-red-800"
													}`}
												>
													{stock.isAvailable ? "Disponible" : "Indisponible"}
												</span>
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
												<button
													onClick={() => handleToggleAvailability(stock)}
													className={`${
														stock.isAvailable
															? "text-orange-600 hover:text-orange-900"
															: "text-green-600 hover:text-green-900"
													}`}
													title={stock.isAvailable ? "Désactiver" : "Activer"}
												>
													<i className={`fi fi-rr-${stock.isAvailable ? "ban" : "check-circle"}`}></i>
												</button>
												<Link
													href={`/admin/investments/${stock.id}`}
													className='text-indigo-600 hover:text-indigo-900'
													title='Modifier'
												>
													<i className="fi fi-rr-edit"></i>
												</Link>
												<button
													onClick={() => handleDelete(stock)}
													disabled={stock.holdingsCount > 0}
													className={`${
														stock.holdingsCount > 0
															? "text-gray-400 cursor-not-allowed opacity-50"
															: "text-red-600 hover:text-red-900"
													}`}
													title={
														stock.holdingsCount > 0
															? `Impossible de supprimer : ${stock.holdingsCount} action(s) détenue(s)`
															: "Supprimer"
													}
												>
													<i className="fi fi-rr-trash"></i>
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Info Rules */}
				<div className='bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg mt-5 p-6 mb-8'>
					<h3 className='text-lg font-bold text-blue-900 mb-4 flex items-center'>
						<i className='fi fi-rr-bulb text-2xl mr-2'></i>
						Règles de Gestion
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800'>
						<div>
							<p className='font-semibold mb-2 flex items-center gap-1'>
								<i className="fi fi-rr-check-circle"></i>
								Vous pouvez :
							</p>
							<ul className='list-disc list-inside space-y-1 ml-2'>
								<li>Créer de nouvelles actions</li>
								<li>Modifier le symbole et le nom d&apos;une action</li>
								<li>Activer/Désactiver la disponibilité</li>
								<li>Supprimer les actions sans ordres</li>
							</ul>
						</div>
						<div>
							<p className='font-semibold mb-2 flex items-center gap-1'>
								<i className="fi fi-rr-exclamation"></i>
								Important :
							</p>
							<ul className='list-disc list-inside space-y-1 ml-2'>
								<li>Le prix évolue automatiquement (non modifiable)</li>
								<li>
									Action <strong>désactivée</strong> = plus d&apos;achat/vente
								</li>
								<li>
									Impossible de <strong>supprimer</strong> si des clients
									possèdent des ordres
								</li>
								<li>Les clients conservent toujours leurs actions</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Info importante */}
				<div className='mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6'>
					<h3 className='text-blue-900 font-semibold mb-2'>
						<i className="fi fi-rr-info"></i> Informations importantes
					</h3>
					<ul className='text-blue-800 text-sm space-y-1'>
						<li>
							• Le prix des actions évolue automatiquement selon l&apos;offre et
							la demande
						</li>
						<li>
							• Vous ne pouvez PAS modifier manuellement le prix d&apos;une
							action
						</li>
						<li>
							• Les clients ne peuvent acheter/vendre que des actions
							disponibles
						</li>
						<li>
							• La désactivation d&apos;une action empêche les nouveaux ordres
						</li>
						<li>
							• Les clients restent propriétaires de leurs actions, même si
							elles sont désactivées
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
