"use client";

import { useState, useEffect } from "react";
import { transactionService, Transaction } from "../../../components/lib/api/transaction.service";
import '@flaticon/flaticon-uicons/css/all/all.css';

export default function AdvisorTransactionsPage() {
	const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [processingId, setProcessingId] = useState<string | null>(null);

	useEffect(() => {
		loadTransactions();
	}, []);

	const loadTransactions = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await transactionService.getPendingTransactions();

			if (response.success && response.data) {
				setPendingTransactions(response.data);
			} else {
				setError(response.error || "Erreur lors du chargement des transactions en attente");
			}
		} catch (error) {
			setError("Erreur lors du chargement des transactions");
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async (transactionId: string) => {
		try {
			setProcessingId(transactionId);
			const response = await transactionService.approveTransaction(transactionId);
			
			if (response.success) {
				await loadTransactions(); // Recharger les données
			} else {
				setError(response.error || "Erreur lors de l'approbation");
			}
		} catch (error) {
			setError("Erreur lors de l'approbation");
		} finally {
			setProcessingId(null);
		}
	};

	const handleReject = async (transactionId: string, reason?: string) => {
		try {
			setProcessingId(transactionId);
			const response = await transactionService.rejectTransaction(transactionId, reason);
			
			if (response.success) {
				await loadTransactions(); // Recharger les données
			} else {
				setError(response.error || "Erreur lors du rejet");
			}
		} catch (error) {
			setError("Erreur lors du rejet");
		} finally {
			setProcessingId(null);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			pending: { color: "bg-yellow-100 text-yellow-800", icon: <i className="fi fi-rr-hourglass"></i>, label: "En attente" },
			completed: { color: "bg-green-100 text-green-800", icon: <i className="fi fi-rr-check-circle"></i>, label: "Complété" },
			failed: { color: "bg-red-100 text-red-800", icon: <i className="fi fi-rr-cross-circle"></i>, label: "Échoué" },
			cancelled: { color: "bg-gray-100 text-gray-800", icon: <i className="fi fi-rr-ban"></i>, label: "Annulé" },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
		return config;
	};

	const formatAmount = (amount: number, currency: string) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: currency || "EUR",
		}).format(amount);
	};

	const currentTransactions = pendingTransactions;

	if (loading) {
		return (
			<div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 p-8">
				<div className="max-w-6xl mx-auto">
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
						<p className="mt-4 text-green-600">Chargement des transactions...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 p-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-green-900">
								<i className="fi fi-rr-credit-card"></i> Gestion des Transactions
							</h1>
							<p className="text-green-600 mt-2">
								Approuvez ou rejetez les transactions en attente
							</p>
						</div>
					</div>
				</div>

				{/* Message d'erreur */}
				{error && (
					<div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
						{error}
					</div>
				)}

				{/* Liste des transactions */}
				<div className="bg-white rounded-lg shadow-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-green-600 text-white">
								<tr>
									<th className="px-6 py-4 text-left">Numero Transaction</th>
									<th className="px-6 py-4 text-left">Expéditeur</th>
									<th className="px-6 py-4 text-left">Destinataire</th>
									<th className="px-6 py-4 text-left">Montant</th>
									<th className="px-6 py-4 text-left">Description</th>
									<th className="px-6 py-4 text-left">Date</th>
									<th className="px-6 py-4 text-left">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{currentTransactions.map((transaction) => {
									const statusConfig = getStatusBadge(transaction.status);
									return (
										<tr key={transaction.id} className="hover:bg-green-50">
											<td className="px-6 py-4">
												<div className="font-mono text-sm break-all">
													{transaction.id}
												</div>
											</td>
											<td className="px-6 py-4">
												<div>
									{transaction.sourceAccount?.user ? (
										<>
											<div className="font-medium text-gray-900 wrap-break-word">
												{transaction.sourceAccount.user.firstName} {transaction.sourceAccount.user.lastName}
											</div>
											<div className="text-sm text-gray-500 break-all">
												{transaction.sourceAccount.iban
													? transaction.sourceAccount.iban.replace(/^(.{4}).+(.{4})$/, "$1 ••••••••••")
													: ""}
											</div>
										</>
									) : (
										<span className="text-gray-400">Non disponible</span>
									)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div>
									{transaction.destinationAccount?.user ? (
										<>
											<div className="font-medium text-gray-900 wrap-break-word">
												{transaction.destinationAccount.user.firstName} {transaction.destinationAccount.user.lastName}
											</div>
											<div className="text-sm text-gray-500 break-all">
												{transaction.destinationAccount.iban
													? transaction.destinationAccount.iban.replace(/^(.{4}).+(.{4})$/, "$1 ••••••••••")
													: ""}
											</div>
										</>
									) : transaction.destinationAccount ? (
										<>
											<div className="font-medium text-gray-900">Compte interne</div>
											<div className="text-sm text-gray-500 break-all">
												{transaction.destinationAccount.iban
													? transaction.destinationAccount.iban.replace(/^(.{4}).+(.{4})$/, "$1 ••••••••••")
													: ""}
											</div>
										</>
									) : transaction.destinationIBAN ? (
										<>
											<div className="font-medium text-gray-900">Compte externe</div>
											<div className="text-sm text-gray-500 break-all">
												{transaction.destinationIBAN.replace(/^(.{4}).+(.{4})$/, "$1 ••••••••••")}
											</div>
										</>
									) : (
										<span className="text-gray-400">Non disponible</span>
									)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="font-bold text-lg text-gray-900">
													{formatAmount(transaction.amount, transaction.currency)}
												</div>
											</td>
											<td className="px-6 py-4">
								<div className="max-w-xs text-gray-700 wrap-break-word">
									{transaction.description ? (
										<>
											{/* <span>Description</span> */}
											<span>
												{(() => {
													const desc = transaction.description;
													const censoredDesc = desc.replace(/FR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{3}/gi, (match) => {
														return match.slice(0, 4) + " ••••••••••";
													});
													return censoredDesc.length > 50
														? (
															<>
																{censoredDesc.slice(0, 50)}
																<br />
																{censoredDesc.slice(50)}
															</>
														)
														: censoredDesc;
												})()}
											</span>
										</>
									) : (
										<span>Aucune description</span>
									)}
								</div>
											</td>
											<td className="px-6 py-4 text-sm text-gray-500">
												{new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
													day: "2-digit",
													month: "2-digit",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</td>
										<td className="px-6 py-4">
											<div className="flex space-x-2">
												<button
													onClick={() => handleApprove(transaction.id)}
													disabled={processingId === transaction.id}
													className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
												>
													{processingId === transaction.id ? "..." : (
														<>
															<i className="fi fi-rr-check"></i>
															Approuver
														</>
													)}
												</button>
												<button
													onClick={() => handleReject(transaction.id)}
													disabled={processingId === transaction.id}
													className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
												>
													{processingId === transaction.id ? "..." : (
														<>
															<i className="fi fi-rr-cross"></i>
															Rejeter
														</>
													)}
												</button>
											</div>
										</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{currentTransactions.length === 0 && (
						<div className="text-center py-8 text-gray-500">
							<p className="text-lg flex items-center justify-center gap-2">
								<i className="fi fi-rr-party-horn"></i>
								Aucune transaction en attente
							</p>
							<p className="text-sm mt-2">Toutes les transactions ont été traitées</p>
						</div>
					)}
				</div>

				{/* Statistiques */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
					<div className="bg-white rounded-lg shadow-lg p-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-orange-600">
								{pendingTransactions.length}
							</div>
							<div className="text-gray-600">En attente d'approbation</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-lg p-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-green-600">
								{pendingTransactions.filter((t) => t.status === "pending").length}
							</div>
							<div className="text-gray-600">Nouveaux</div>
						</div>
					</div>
				</div>

				{/* Informations importantes */}
				<div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
					<h4 className="font-medium text-green-900 mb-2"><i className="fi fi-rr-info"></i> Instructions</h4>
					<ul className="text-sm text-green-800 space-y-1">
						<li>• <strong>Approuver</strong> : La transaction sera exécutée et les comptes mis à jour</li>
						<li>• <strong>Rejeter</strong> : La transaction sera annulée et les fonds recrédités au compte source</li>
						<li>• Les transactions approuvées ne peuvent plus être modifiées</li>
						<li>• Vérifiez toujours les montants et les comptes avant validation</li>
					</ul>
				</div>
			</div>
		</div>
	);
}