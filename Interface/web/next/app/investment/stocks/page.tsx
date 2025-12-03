"use client";

import '@flaticon/flaticon-uicons/css/all/all.css';
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../components/contexts/AuthContext";
import {
	investmentService,
	Stock,
} from "../../../components/lib/api/investment.service";
import { accountService, Account } from "../../../components/lib/api/account.service";
import { Position } from "../../../components/lib/api/investment.service";
import { NotificationModal } from "../../../components/ui/NotificationModal";
import { useClientMetadata } from "@/components/lib/seo";

// État pour suivre les variations de prix
interface PriceChange {
	[stockId: string]: {
		previousPrice: number;
		change: number; // en pourcentage
		direction: 'up' | 'down' | 'neutral';
	};
}

/**
 * Page des actions disponibles pour l'investissement
 */
export default function StocksPage() {
	const { user, loading: authLoading } = useAuth();
	const [stocks, setStocks] = useState<Stock[]>([]);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useClientMetadata("/investment/stocks");
	const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
	const [showOrderModal, setShowOrderModal] = useState(false);
	const [hasInvestmentAccount, setHasInvestmentAccount] = useState<boolean | null>(null);
	const [priceChanges, setPriceChanges] = useState<PriceChange>({});
	const [userPositions, setUserPositions] = useState<Map<string, number>>(new Map()); // stockId -> quantity
	
	// États pour la modale d'ordre
	const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
	const [accountId, setAccountId] = useState("");
	const [quantity, setQuantity] = useState<number>(1);
	const [orderLoading, setOrderLoading] = useState(false);
	const [orderError, setOrderError] = useState<string | null>(null);
	const [transactionFee, setTransactionFee] = useState<number>(1);
	const [userPosition, setUserPosition] = useState<Position | null>(null);
	
	// États pour les notifications
	const [showNotification, setShowNotification] = useState(false);
	const [notificationType, setNotificationType] = useState<"success" | "error" | "info">("success");
	const [notificationTitle, setNotificationTitle] = useState("");
	const [notificationMessage, setNotificationMessage] = useState("");

	// Fonction utilitaire pour afficher une notification
	const showNotificationModal = (
		type: "success" | "error" | "info",
		title: string,
		message: string
	) => {
		setNotificationType(type);
		setNotificationTitle(title);
		setNotificationMessage(message);
		setShowNotification(true);
	};

	useEffect(() => {
		// Attendre que l'authentification soit chargée avant de charger les données
		if (!authLoading) {
			loadData();
			// WebSocket (Socket.IO) - connexion pour les mises à jour temps réel
			const wsUrl = process.env.NEXT_PUBLIC_API_WS_URL || "http://localhost:3001";
			// Import socket.io-client dynamiquement pour éviter les erreurs de compilation
			import("socket.io-client").then(({ io }) => {
				const socket = io(wsUrl, { transports: ["websocket"] });

				socket.on("connect", () => {
				// Socket connected
				});

				socket.on("stock_price_update", (payload: any) => {
				// Update the stock in local state
				setStocks((prev) => {
					const idx = prev.findIndex((s) => s.id === payload.stockId);
					if (idx === -1) return prev;
					const updated = [...prev];
					const old = updated[idx];
					updated[idx] = {
						...old,
						currentPrice: {
							amount: payload.price,
							currency: old.currentPrice.currency,
							formatted: payload.price.toFixed(2) + ' €',
						},
					};
					return updated;
				});

				// Show a short variation indicator
				setPriceChanges((prev) => ({
					...prev,
					[payload.stockId]: {
						previousPrice: payload.previousPrice,
						change: payload.change,
						direction: payload.change > 0 ? 'up' : (payload.change < 0 ? 'down' : 'neutral'),
					},
				}));

			});

			return () => {
				socket.disconnect();
			};
			
			// Recharger les prix toutes les 30 secondes (synchronisé avec le service backend)
			const interval = setInterval(() => {
				refreshStockPrices();
			}, 30000); // 30 secondes
			
			return () => {
				socket.disconnect();
				clearInterval(interval);
			};
		});
	}
	}, [authLoading, user]);

	const loadData = async () => {
		try {
			setLoading(true);
			setError(null);

			// Vérifier d'abord si l'utilisateur est connecté
			if (!user) {
				setError("Vous devez être connecté pour accéder aux investissements");
				setLoading(false);
				return;
			}

			// Charger les comptes de l'utilisateur d'abord
			const accountsResponse = await accountService.getAll();
			if (accountsResponse.success && accountsResponse.data) {
				// Filtrer pour ne garder que les comptes d'investissement
				const investmentAccounts = accountsResponse.data.filter(
					(account: Account) => account.type === "investment"
				);
				setAccounts(investmentAccounts);
				setHasInvestmentAccount(investmentAccounts.length > 0);
				
				// Si pas de compte d'investissement, on peut arrêter là
				if (investmentAccounts.length === 0) {
					setLoading(false);
					return;
				}
			} else {
				setError("Erreur lors du chargement des comptes");
				setLoading(false);
				return;
			}

			// Charger les actions disponibles seulement si l'utilisateur a un compte d'investissement
			const stocksResponse = await investmentService.getAvailableStocks();
			if (stocksResponse.success && stocksResponse.data) {
				setStocks(stocksResponse.data);
			} else {
				setError(
					stocksResponse.message || "Erreur lors du chargement des actions"
				);
			}

			// Charger le portefeuille pour connaître les positions actuelles
			const portfolioResponse = await investmentService.getPortfolio();
			if (portfolioResponse.success && portfolioResponse.data) {
				// Créer une Map stockId -> quantity
				const positionsMap = new Map<string, number>();
				portfolioResponse.data.positions.forEach(position => {
					positionsMap.set(position.stockId, position.quantity);
				});
				setUserPositions(positionsMap);
			}

		} catch (err) {
			console.error("Erreur lors du chargement:", err);
			setError("Une erreur inattendue s'est produite");
		} finally {
			setLoading(false);
		}
	};

	const refreshStockPrices = async () => {
		try {
			// Ne pas afficher de loader lors du rafraîchissement
			const stocksResponse = await investmentService.getAvailableStocks();
			if (stocksResponse.success && stocksResponse.data) {
				const newStocks = stocksResponse.data;
				const changes: PriceChange = {};
				
				// Calculer les variations de prix
				newStocks.forEach(newStock => {
					const oldStock = stocks.find(s => s.id === newStock.id);
					if (oldStock) {
						const oldPrice = oldStock.currentPrice.amount;
						const newPrice = newStock.currentPrice.amount;
						const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
						
						if (changePercent !== 0) {
							changes[newStock.id] = {
								previousPrice: oldPrice,
								change: changePercent,
								direction: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral'
							};
						}
					}
				});
				
				setStocks(newStocks);
				setPriceChanges(changes);
				
				// Effacer les indicateurs de changement après 5 secondes
				setTimeout(() => {
					setPriceChanges({});
				}, 5000);
			}
		} catch (err) {
			console.error("Erreur lors du rafraîchissement des prix:", err);
			// Ne pas afficher d'erreur à l'utilisateur pour un simple refresh
		}
	};

	const handlePlaceOrder = async (stock: Stock) => {
		if (!user) {
			setError("Vous devez être connecté pour passer un ordre");
			return;
		}

		if (!hasInvestmentAccount || accounts.length === 0) {
			setError(
				"Vous devez avoir un compte d'investissement pour passer un ordre"
			);
			return;
		}

		setSelectedStock(stock);
		setAccountId(accounts[0]?.id || "");
		setOrderType("buy");
		setQuantity(1);
		setOrderError(null);
		
		// Charger les données spécifiques à cette action
		await loadOrderData(stock);
		setShowOrderModal(true);
	};

	const loadOrderData = async (stock: Stock) => {
		try {
			// Récupérer les frais d'investissement
			const feeResponse = await investmentService.getInvestmentFee();
			if (feeResponse.success && feeResponse.data) {
				setTransactionFee(feeResponse.data.fee);
			}

			// Récupérer le portefeuille pour vérifier la position actuelle
			const portfolioResponse = await investmentService.getPortfolio();
			if (portfolioResponse.success && portfolioResponse.data) {
				const position = portfolioResponse.data.positions.find(
					(pos) => pos.stockId === stock.id
				);
				setUserPosition(position || null);
			}
		} catch (error) {
			console.error("Erreur lors de la récupération des données:", error);
		}
	};

	const handleSubmitOrder = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!selectedStock || !accountId || quantity <= 0) {
			setOrderError("Veuillez remplir tous les champs correctement");
			return;
		}

		const stockCost = selectedStock.currentPrice.amount * quantity;
		const fees = transactionFee;
		const totalCost = orderType === "buy" ? stockCost + fees : stockCost - fees;
		const selectedAccount = accounts.find((acc) => acc.id === accountId);

		// Vérifications pour l'achat
		if (orderType === "buy" && selectedAccount) {
			if (selectedAccount.balance < totalCost) {
				setOrderError(
					`Solde insuffisant. Nécessaire: ${totalCost.toFixed(
						2
					)}€, Disponible: ${selectedAccount.balance.toFixed(2)}€`
				);
				return;
			}
		}

		// Vérifications pour la vente
		if (orderType === "sell") {
			const canSell = userPosition && userPosition.quantity > 0;
			const maxSellQuantity = userPosition?.quantity || 0;
			
			if (!canSell) {
				setOrderError("Vous ne possédez aucune action de cette entreprise");
				return;
			}
			if (quantity > maxSellQuantity) {
				setOrderError(
					`Quantité insuffisante. Vous possédez ${maxSellQuantity} action(s)`
				);
				return;
			}
		}

		setOrderLoading(true);
		setOrderError(null);

		try {
			const response = await investmentService.placeOrder({
				accountId,
				stockId: selectedStock.id,
				orderType,
				quantity,
			});

			if (response.success) {
				const action = orderType === "buy" ? "achat" : "vente";
				
				// Fermer la modale et afficher la notification
				closeOrderModal();
				showNotificationModal(
					"success",
					"Ordre placé avec succès !",
					`Ordre ${action === 'achat' ? 'd’achat' : 'de vente'} passé avec succès ! ${quantity} action(s) ${selectedStock.companyName} - Total: ${Math.abs(totalCost).toFixed(2)}€`
				);
				
				// Recharger les données
				loadData();
			} else {
				setOrderError(response.message || "Erreur lors du placement de l'ordre");
			}
		} catch (err: any) {
			console.error("Erreur placement ordre:", err);
			setOrderError(
				err.response?.data?.message || "Erreur lors du placement de l'ordre"
			);
		} finally {
			setOrderLoading(false);
		}
	};

	const closeOrderModal = () => {
		setShowOrderModal(false);
		setSelectedStock(null);
		setOrderError(null);
	};

	if (loading || authLoading) {
		return (
			<div className='min-h-screen bg-gray-50 py-12'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
						<p className='mt-4 text-gray-600'>Chargement des actions...</p>
					</div>
				</div>
			</div>
		);
	}

	// Vérification si l'utilisateur n'est pas connecté
	if (!user) {
		return (
			<div className='min-h-screen bg-gray-50 py-12'>
				<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='bg-white rounded-xl shadow-lg p-8 text-center'>
						<div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
							<i className='fi fi-rr-triangle-warning text-red-600 text-2xl'></i>
						</div>
						<h1 className='text-2xl font-bold text-gray-900 mb-4'>
							Connexion requise
						</h1>
						<p className='text-gray-600 mb-6'>
							Vous devez être connecté pour accéder aux investissements.
						</p>
						<a
							href='/auth/login'
							className='inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors'
						>
							Se connecter
						</a>
					</div>
				</div>
			</div>
		);
	}

	// Vérification si l'utilisateur n'a pas de compte d'investissement
	if (hasInvestmentAccount === false) {
		return (
			<div className='min-h-screen bg-gray-50 py-12'>
				<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='bg-white rounded-xl shadow-lg p-8 text-center'>
						<div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6'>
							<i className='fi fi-rr-piggy-bank text-yellow-600 text-2xl'></i>
						</div>
						<h1 className='text-2xl font-bold text-gray-900 mb-4'>
							Compte d'investissement requis
						</h1>
						<p className='text-gray-600 mb-6'>
							Pour investir en bourse, vous devez d'abord ouvrir un compte d'investissement.
						</p>
						<div className='space-y-4'>
							<div className='bg-blue-50 rounded-lg p-4 text-left'>
								<h3 className='font-semibold text-blue-900 mb-2'>
									Avantages du compte d'investissement :
								</h3>
								<ul className='text-sm text-blue-800 space-y-1'>
									<li>• Frais réduits sur toutes les transactions</li>
									<li>• Accès à un large choix d'actions</li>
									<li>• Gestion de portefeuille en temps réel</li>
									<li>• Suivi des performances et gains/pertes</li>
								</ul>
							</div>
							<a
								href='/dashboard/accounts'
								className='inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors'
							>
								<i className='fi fi-rr-plus mr-2'></i>
								Ouvrir un compte d'investissement
							</a>
						</div>
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
						Actions Disponibles
					</h1>
					<p className='text-xl text-gray-600 max-w-2xl mx-auto'>
						Investissez dans les meilleures entreprises avec des frais réduits
					</p>
				</div>

				{/* Error Alert */}
				{error && (
					<div className='mb-8 bg-red-50 border border-red-200 rounded-lg p-4'>
						<div className='flex'>
							<div className='shrink-0'>
								<i className='fi fi-rr-cross-circle text-red-400 text-xl'></i>
							</div>
							<div className='ml-3'>
								<p className='text-sm text-red-800'>{error}</p>
								{error.includes("compte d'investissement") && (
									<div className='mt-2'>
										<a
										href='/dashboard/accounts'
										className='text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors inline-flex items-center'
									>
										<i className='fi fi-rr-plus mr-1 text-xs'></i>
										Créer un compte d'investissement
										</a>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Stocks Grid */}
				{stocks.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{stocks.map((stock) => (
							<div
								key={stock.id}
								className='bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden'
							>
								<div className='p-6'>
									{/* Stock Header */}
									<div className='flex items-center justify-between mb-4'>
										<div>
											<h3 className='text-lg font-bold text-gray-900'>
												{stock.symbol}
											</h3>
											<p className='text-sm text-gray-600'>
												{stock.companyName}
											</p>
										</div>
										<div className='flex flex-col gap-2 items-end'>
											<div
												className={`px-3 py-1 rounded-full text-xs font-medium ${
													stock.isAvailable
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{stock.isAvailable ? "Disponible" : "Indisponible"}
											</div>
											{userPositions.has(stock.id) && userPositions.get(stock.id)! > 0 && (
											<div className='px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1'>
												<i className='fi fi-rr-user text-xs'></i>
												{userPositions.get(stock.id)} action{userPositions.get(stock.id)! > 1 ? 's' : ''} détenue{userPositions.get(stock.id)! > 1 ? 's' : ''}
												</div>
											)}
										</div>
									</div>

									{/* Price with variation indicator */}
									<div className='mb-6'>
										<div className='flex items-center gap-2'>
											<div className='text-3xl font-bold text-gray-900'>
												{stock.currentPrice.formatted}
											</div>
											{priceChanges[stock.id] && (
												<div className={`flex items-center px-2 py-1 rounded-full text-sm font-medium ${
													priceChanges[stock.id].direction === 'up' 
														? 'bg-green-100 text-green-700' 
														: 'bg-red-100 text-red-700'
												}`}>
													{priceChanges[stock.id].direction === 'up' ? (
														<i className="fi fi-rr-arrow-up mr-1"></i>
													) : (
														<i className="fi fi-rr-arrow-down mr-1"></i>
													)}
													{Math.abs(priceChanges[stock.id].change).toFixed(2)}%
												</div>
											)}
										</div>
										<div className='text-sm text-gray-500 flex items-center gap-2'>
											Prix par action
											<span className="inline-flex items-center">
												<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
												<span className="ml-1 text-xs text-gray-400">Live</span>
											</span>
										</div>
									</div>

									{/* Fees Info */}
									<div className='bg-blue-50 rounded-lg p-3 mb-6'>
										<div className='flex items-center justify-between'>
											<span className='text-sm font-medium text-blue-900'>
												Frais de transaction
											</span>
											<span className='text-sm font-bold text-blue-900'>
												{stock.fees.formatted}
											</span>
										</div>
										<p className='text-xs text-blue-700 mt-1'>
											Frais fixes par ordre (achat ou vente)
										</p>
									</div>

									{/* Action Buttons */}
									<div className='space-y-2'>
										{stock.isAvailable ? (
											<button
												onClick={() => handlePlaceOrder(stock)}
												className='w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center'
											>
												<i className='fi fi-rr-chart-line-up mr-2'></i>
												Passer un ordre
											</button>
										) : (
											<button
												disabled
												className='w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed'
											>
												Action indisponible
											</button>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className='text-center py-12'>
						<i className='fi fi-rr-inbox text-gray-400 text-6xl'></i>
						<h3 className='mt-2 text-sm font-medium text-gray-900'>
							Aucune action disponible
						</h3>
						<p className='mt-1 text-sm text-gray-500'>
							Il n'y a actuellement aucune action disponible à l'investissement.
						</p>
					</div>
				)}
			</div>

			{/* Modal de placement d'ordre intégrée */}
			{showOrderModal && selectedStock && (
				<div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							{/* Header */}
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold text-gray-900">
									Placer un ordre
								</h2>
								<button
									onClick={closeOrderModal}
									className="text-gray-400 hover:text-gray-600 transition"
								>
									<i className='fi fi-rr-cross text-xl'></i>
								</button>
							</div>

							{/* Formulaire de commande */}
								<form onSubmit={handleSubmitOrder} className="space-y-6">
									{/* Informations de l'action */}
									<div className="bg-gray-50 rounded-lg p-4">
										<div className="flex items-center justify-between">
											<div>
												<h3 className="font-bold text-gray-900">{selectedStock.symbol}</h3>
												<p className="text-sm text-gray-600">{selectedStock.companyName}</p>
											</div>
											<div className="text-right">
												<p className="text-lg font-bold text-blue-600">
													{selectedStock.currentPrice.amount.toFixed(2)} €
												</p>
												<p className="text-xs text-gray-500">par action</p>
											</div>
										</div>
									</div>

									{/* Type d'ordre */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-3">
											Type d'ordre
										</label>
										<div className="grid grid-cols-2 gap-3">
											<button
												type="button"
												onClick={() => setOrderType("buy")}
												className={`p-3 rounded-lg border-2 text-center transition ${
													orderType === "buy"
														? "border-green-500 bg-green-50 text-green-700"
														: "border-gray-300 hover:border-gray-400"
												}`}
											>
												<div className="font-medium">Acheter</div>
												<div className="text-xs text-gray-500">Acquérir des actions</div>
											</button>
											<button
												type="button"
												onClick={() => setOrderType("sell")}
												disabled={!userPosition || userPosition.quantity === 0}
												className={`p-3 rounded-lg border-2 text-center transition ${
													orderType === "sell"
														? "border-red-500 bg-red-50 text-red-700"
														: (!userPosition || userPosition.quantity === 0)
														? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
														: "border-gray-300 hover:border-gray-400"
												}`}
											>
												<div className="font-medium">Vendre</div>
												<div className="text-xs text-gray-500">
													{(!userPosition || userPosition.quantity === 0) 
														? "Aucune action possédée" 
														: "Céder des actions"}
												</div>
											</button>
										</div>
									</div>

									{/* Compte */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Compte d'investissement
										</label>
										<select
											value={accountId}
											onChange={(e) => setAccountId(e.target.value)}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										>
											<option value="">Sélectionnez un compte</option>
											{accounts
												.filter((account) => account.type === "investment")
												.map((account) => (
													<option key={account.id} value={account.id}>
														{account.name} - {account.balance.toFixed(2)} €
													</option>
												))}
										</select>
									</div>

									{/* Quantité */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Quantité
										</label>
										<input
											type="number"
											min="1"
											max={orderType === "sell" ? userPosition?.quantity || 0 : undefined}
											value={quantity}
											onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
										{orderType === "sell" && userPosition && (
											<p className="mt-1 text-xs text-gray-500">
												Vous possédez {userPosition.quantity} action(s)
											</p>
										)}
									</div>

									{/* Récapitulatif */}
									<div className="bg-blue-50 rounded-lg p-4">
										<h4 className="font-medium text-blue-900 mb-2">Récapitulatif</h4>
										<div className="space-y-1 text-sm">
											<div className="flex justify-between">
												<span>Prix unitaire:</span>
												<span>{selectedStock.currentPrice.amount.toFixed(2)} €</span>
											</div>
											<div className="flex justify-between">
												<span>Quantité:</span>
												<span>{quantity}</span>
											</div>
											<div className="flex justify-between">
												<span>Sous-total:</span>
												<span>{(selectedStock.currentPrice.amount * quantity).toFixed(2)} €</span>
											</div>
											<div className="flex justify-between">
												<span>Frais de transaction:</span>
												<span>{transactionFee.toFixed(2)} €</span>
											</div>
											<div className="border-t border-blue-200 pt-1 mt-2">
												<div className="flex justify-between font-bold">
													<span>Total:</span>
													<span className={orderType === "buy" ? "text-red-600" : "text-green-600"}>
														{orderType === "buy" ? "-" : "+"}{Math.abs(
															orderType === "buy" 
																? (selectedStock.currentPrice.amount * quantity) + transactionFee
																: (selectedStock.currentPrice.amount * quantity) - transactionFee
														).toFixed(2)} €
													</span>
												</div>
											</div>
										</div>
									</div>

									{/* Erreur */}
									{orderError && (
										<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
											{orderError}
										</div>
									)}

									{/* Boutons */}
									<div className="flex gap-3">
										<button
											type="button"
											onClick={closeOrderModal}
											className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
										>
											Annuler
										</button>
										<button
											type="submit"
											disabled={orderLoading}
											className={`flex-1 px-4 py-2 rounded-lg text-white transition ${
												orderType === "buy"
													? "bg-green-600 hover:bg-green-700"
													: "bg-red-600 hover:bg-red-700"
											} disabled:opacity-50 disabled:cursor-not-allowed`}
										>
											{orderLoading ? "Traitement..." : orderType === "buy" ? "Acheter" : "Vendre"}
										</button>
									</div>
								</form>
						</div>
					</div>
				</div>
			)}

			{/* Modal de notification */}
			<NotificationModal
				isOpen={showNotification}
				type={notificationType}
				title={notificationTitle}
				message={notificationMessage}
				onClose={() => setShowNotification(false)}
			/>
		</div>
	);
}
