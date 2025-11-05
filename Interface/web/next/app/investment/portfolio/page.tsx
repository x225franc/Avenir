"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../components/contexts/AuthContext";
import {
	investmentService,
	Portfolio,
	Position,
} from "../../../components/lib/api/investment.service";

/**
 * Page du portefeuille d'investissement
 */
export default function PortfolioPage() {
	const { user } = useAuth();
	const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);


	useEffect(() => {
		if (user) {
			loadPortfolio(true); // premier chargement avec loader
			const interval = setInterval(() => {
				loadPortfolio(false); // rafraîchissement invisible
			}, 5000); // 5 secondes
			return () => clearInterval(interval);
		}
	}, [user]);

	const loadPortfolio = async (showLoader = false) => {
		try {
			if (showLoader) setLoading(true);
			setError(null);

			const response = await investmentService.getPortfolio();
			if (response.success && response.data) {
				setPortfolio(response.data);
			} else {
				setError(
					response.message || "Erreur lors du chargement du portefeuille"
				);
			}
		} catch (err) {
			console.error("Erreur lors du chargement:", err);
			setError("Une erreur inattendue s'est produite");
		} finally {
			if (showLoader) setLoading(false);
		}
	};

	const formatPercentage = (percentage: number) => {
		const sign = percentage >= 0 ? "+" : "";
		return `${sign}${percentage.toFixed(2)}%`;
	};

	const getGainLossColor = (amount: number) => {
		if (amount > 0) return "text-green-600";
		if (amount < 0) return "text-red-600";
		return "text-gray-600";
	};

	if (!user) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-gray-900 mb-4'>
						Connexion requise
					</h2>
					<p className='text-gray-600'>
						Vous devez être connecté pour voir votre portefeuille.
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
						<p className='mt-4 text-gray-600'>Chargement du portefeuille...</p>
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
						Mon Portefeuille
					</h1>
					<p className='text-xl text-gray-600'>
						Suivez la performance de vos investissements
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

				{portfolio ? (
					<>
						{/* Portfolio Summary */}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
							<div className='bg-white rounded-xl shadow-lg p-6'>
								<div className='flex items-center'>
									<div className='flex-shrink-0'>
										<div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
											<svg
												className='w-5 h-5 text-white'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
												/>
											</svg>
										</div>
									</div>
									<div className='ml-5'>
										<p className='text-sm font-medium text-gray-500'>
											Valeur totale
										</p>
										<p className='text-2xl font-bold text-gray-900'>
											{portfolio.totalValue.formatted}
										</p>
									</div>
								</div>
							</div>

							<div className='bg-white rounded-xl shadow-lg p-6'>
								<div className='flex items-center'>
									<div className='flex-shrink-0'>
										<div
											className={`w-8 h-8 rounded-lg flex items-center justify-center ${
												portfolio.totalGainLoss.amount >= 0
													? "bg-green-600"
													: "bg-red-600"
											}`}
										>
											<svg
												className='w-5 h-5 text-white'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d={
														portfolio.totalGainLoss.amount >= 0
															? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
															: "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
													}
												/>
											</svg>
										</div>
									</div>
									<div className='ml-5'>
										<p className='text-sm font-medium text-gray-500'>
											Gain/Perte
										</p>
										<p
											className={`text-2xl font-bold ${getGainLossColor(
												portfolio.totalGainLoss.amount
											)}`}
										>
											{portfolio.totalGainLoss.formatted}
										</p>
									</div>
								</div>
							</div>

							<div className='bg-white rounded-xl shadow-lg p-6'>
								<div className='flex items-center'>
									<div className='flex-shrink-0'>
										<div
											className={`w-8 h-8 rounded-lg flex items-center justify-center ${
												portfolio.totalGainLossPercentage >= 0
													? "bg-green-600"
													: "bg-red-600"
											}`}
										>
											<svg
												className='w-5 h-5 text-white'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
												/>
											</svg>
										</div>
									</div>
									<div className='ml-5'>
										<p className='text-sm font-medium text-gray-500'>
											Performance
										</p>
										<p
											className={`text-2xl font-bold ${getGainLossColor(
												portfolio.totalGainLossPercentage
											)}`}
										>
											{formatPercentage(portfolio.totalGainLossPercentage)}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Positions */}
						{portfolio.positions.length > 0 ? (
							<div className='bg-white rounded-xl shadow-lg overflow-hidden'>
								<div className='px-6 py-4 border-b border-gray-200'>
									<h3 className='text-lg font-medium text-gray-900'>
										Mes Positions
									</h3>
									<p className='text-sm text-gray-500'>
										Dernière mise à jour:{" "}
										{new Date(portfolio.lastUpdated).toLocaleString("fr-FR")}
									</p>
								</div>
								<div className='overflow-x-auto'>
									<table className='min-w-full divide-y divide-gray-200'>
										<thead className='bg-gray-50'>
											<tr>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Action
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Quantité
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Prix d'achat moyen
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Prix actuel
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Valeur totale
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Gain/Perte
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Performance
												</th>
											</tr>
										</thead>
										<tbody className='bg-white divide-y divide-gray-200'>
											{portfolio.positions.map((position: Position) => (
												<tr key={position.stockId} className='hover:bg-gray-50'>
													<td className='px-6 py-4 whitespace-nowrap'>
														<div>
															<div className='text-sm font-medium text-gray-900'>
																{position.stockSymbol}
															</div>
															<div className='text-sm text-gray-500'>
																{position.companyName}
															</div>
														</div>
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
														{position.quantity}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
														{position.averagePurchasePrice.formatted}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
														{position.currentPrice.formatted}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
														{position.totalValue.formatted}
													</td>
													<td
														className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getGainLossColor(
															position.gainLoss.amount
														)}`}
													>
														{position.gainLoss.formatted}
													</td>
													<td
														className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getGainLossColor(
															position.gainLossPercentage
														)}`}
													>
														{formatPercentage(position.gainLossPercentage)}
													</td>
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
										d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
									/>
								</svg>
								<h3 className='mt-2 text-sm font-medium text-gray-900'>
									Aucune position
								</h3>
								<p className='mt-1 text-sm text-gray-500'>
									Vous n'avez actuellement aucune position dans votre
									portefeuille.
								</p>
								<div className='mt-6'>
									<a
										href='/investment/stocks'
										className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
									>
										Découvrir les actions
									</a>
								</div>
							</div>
						)}
					</>
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
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
							/>
						</svg>
						<h3 className='mt-2 text-sm font-medium text-gray-900'>
							Erreur de chargement
						</h3>
						<p className='mt-1 text-sm text-gray-500'>
							Impossible de charger votre portefeuille.
						</p>
						<div className='mt-6'>
							<button
								onClick={() => loadPortfolio(true)}
								className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
							>
								Réessayer
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
