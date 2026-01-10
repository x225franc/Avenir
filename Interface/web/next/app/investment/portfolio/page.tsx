"use client";

import '@flaticon/flaticon-uicons/css/all/all.css';
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../components/contexts/AuthContext";
import {
	investmentService,
	Portfolio,
	Position,
} from "../../../components/lib/api/investment.service";
import { useClientMetadata } from "@/components/lib/seo";

/**
 * Page du portefeuille d'investissement
 */
export default function PortfolioPage() {
	const { user } = useAuth();
	const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useClientMetadata("/investment/portfolio");


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
				<div className='text-center mb-12'>
					<h1 className='text-4xl font-bold text-gray-900 mb-4'>
						Mon Portefeuille
					</h1>
					<p className='text-xl text-gray-600'>
						Suivez la performance de vos investissements
					</p>
				</div>

			{error && (
				<div className='mb-8 bg-red-50 border border-red-200 rounded-lg p-4'>
					<div className='flex'>
						<div className='shrink-0'>
							<i className='fi fi-rr-cross-circle text-red-400 text-xl'></i>
						</div>
						<div className='ml-3'>
							<p className='text-sm text-red-800'>{error}</p>
						</div>
					</div>
				</div>
			)}				{portfolio ? (
					<>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
							<div className='bg-white rounded-xl shadow-lg p-6'>
								<div className='flex items-center'>
								<div className='shrink-0'>
									<div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
										<i className='fi fi-rr-wallet text-white text-xl'></i>
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
									<div className='shrink-0'>
										<div
											className={`w-8 h-8 rounded-lg flex items-center justify-center ${
												portfolio.totalGainLoss.amount >= 0
													? "bg-green-600"
													: "bg-red-600"
											}`}
										>
											<i className={`text-white text-xl ${
												portfolio.totalGainLoss.amount >= 0
													? 'fi fi-rr-arrow-trend-up'
													: 'fi fi-rr-arrow-trend-down'
											}`}></i>
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
									<div className='shrink-0'>
										<div
											className={`w-8 h-8 rounded-lg flex items-center justify-center ${
												portfolio.totalGainLossPercentage >= 0
													? "bg-green-600"
													: "bg-red-600"
											}`}
										>
											<i className='fi fi-rr-chart-histogram text-white text-xl'></i>
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
							<i className='fi fi-rr-inbox text-gray-400 text-6xl block mb-4'></i>
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
						<i className='fi fi-rr-triangle-warning text-gray-400 text-6xl block mb-4'></i>
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
