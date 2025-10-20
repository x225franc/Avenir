"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../src/contexts/AuthContext";
import {
	investmentService,
	InvestmentOrder,
} from "../../../src/lib/api/investment.service";

/**
 * Page d'historique des ordres d'investissement
 */
export default function OrdersPage() {
	const { user } = useAuth();
	const [orders, setOrders] = useState<InvestmentOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

	useEffect(() => {
		if (user) {
			loadOrders();
		}
	}, [user]);

	const loadOrders = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await investmentService.getOrderHistory();
			if (response.success && response.data) {
				setOrders(response.data);
			} else {
				setError(response.message || "Erreur lors du chargement des ordres");
			}
		} catch (err) {
			console.error("Erreur lors du chargement:", err);
			setError("Une erreur inattendue s'est produite");
		} finally {
			setLoading(false);
		}
	};

	const handleCancelOrder = async (orderId: string) => {
		try {
			setCancellingOrder(orderId);
			const response = await investmentService.cancelOrder(orderId);

			if (response.success) {
				// Recharger la liste des ordres
				await loadOrders();
			} else {
				setError(response.message || "Erreur lors de l'annulation");
			}
		} catch (err) {
			console.error("Erreur:", err);
			setError("Une erreur inattendue s'est produite");
		} finally {
			setCancellingOrder(null);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "pending":
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
						En attente
					</span>
				);
			case "executed":
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
						Exécuté
					</span>
				);
			case "cancelled":
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
						Annulé
					</span>
				);
			default:
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
						{status}
					</span>
				);
		}
	};

	const getOrderTypeColor = (orderType: string) => {
		return orderType === "buy" ? "text-green-600" : "text-red-600";
	};

	if (!user) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-gray-900 mb-4'>
						Connexion requise
					</h2>
					<p className='text-gray-600'>
						Vous devez être connecté pour voir vos ordres.
					</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50 py-12'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
						<p className='mt-4 text-gray-600'>Chargement des ordres...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 py-12'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Header */}
				<div className='text-center mb-12'>
					<h1 className='text-4xl font-bold text-gray-900 mb-4'>
						Historique des Ordres
					</h1>
					<p className='text-xl text-gray-600'>
						Suivez tous vos ordres d'investissement
					</p>
				</div>

				{/* Error Alert */}
				{error && (
					<div className='mb-8 bg-red-50 border border-red-200 rounded-lg p-4'>
						<div className='flex'>
							<div className='flex-shrink-0'>
								<svg
									className='h-5 w-5 text-red-400'
									viewBox='0 0 20 20'
									fill='currentColor'
								>
									<path
										fillRule='evenodd'
										d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
										clipRule='evenodd'
									/>
								</svg>
							</div>
							<div className='ml-3'>
								<p className='text-sm text-red-800'>{error}</p>
							</div>
						</div>
					</div>
				)}

				{/* Orders Table */}
				{orders.length > 0 ? (
					<div className='bg-white rounded-xl shadow-lg overflow-hidden'>
						<div className='px-6 py-4 border-b border-gray-200'>
							<h3 className='text-lg font-medium text-gray-900'>
								Mes Ordres ({orders.length})
							</h3>
						</div>
						<div className='overflow-x-auto'>
							<table className='min-w-full divide-y divide-gray-200'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Date
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Action
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Type
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Quantité
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Prix
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Total
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Statut
										</th>
										{/* <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Actions
										</th> */}
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{orders.map((order) => (
										<tr key={order.id} className='hover:bg-gray-50'>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
												{new Date(order.createdAt).toLocaleDateString("fr-FR")}
												<div className='text-xs text-gray-500'>
													{new Date(order.createdAt).toLocaleTimeString(
														"fr-FR"
													)}
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm font-medium text-gray-900'>
													Action #{order.stockId}
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<span
													className={`text-sm font-medium ${getOrderTypeColor(
														order.orderType
													)}`}
												>
													{order.orderType === "buy" ? "Achat" : "Vente"}
												</span>
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
												{order.quantity}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
												{order.pricePerShare.formatted}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
												{order.totalAmount.formatted}
												<div className='text-xs text-gray-500'>
													(frais: {order.fees.formatted})
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{getStatusBadge(order.status)}
												{order.executedAt && (
													<div className='text-xs text-gray-500 mt-1'>
														Exécuté le{" "}
														{new Date(order.executedAt).toLocaleDateString(
															"fr-FR"
														)}
													</div>
												)}
											</td>
											{/* <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
												{order.status === "pending" && (
													<button
														onClick={() => handleCancelOrder(order.id)}
														disabled={cancellingOrder === order.id}
														className='text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed'
													>
														{cancellingOrder === order.id
															? "Annulation..."
															: "Annuler"}
													</button>
												)}
											</td> */}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : (
					<div className='text-center py-12'>
						<svg
							className='mx-auto h-12 w-12 text-gray-400'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
							/>
						</svg>
						<h3 className='mt-2 text-sm font-medium text-gray-900'>
							Aucun ordre
						</h3>
						<p className='mt-1 text-sm text-gray-500'>
							Vous n'avez encore passé aucun ordre d'investissement.
						</p>
						<div className='mt-6'>
							<a
								href='/investment/stocks'
								className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
							>
								Passer mon premier ordre
							</a>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
