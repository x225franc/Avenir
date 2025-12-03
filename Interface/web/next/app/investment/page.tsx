"use client";

import '@flaticon/flaticon-uicons/css/all/all.css';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../components/contexts/AuthContext";
import { investmentService } from "../../components/lib/api/investment.service";
import { useClientMetadata } from "@/components/lib/seo";

/**
 * Page d'accueil des investissements
 */
export default function InvestmentHomePage() {
	const { user } = useAuth();
	const [transactionFee, setTransactionFee] = useState<number>(1); // Défaut 1€
	const [feeLoading, setFeeLoading] = useState(true);

	// Métadonnées SEO
	useClientMetadata("/investment");

	// Récupérer les frais d'investissement au chargement
	useEffect(() => {
		const fetchInvestmentFee = async () => {
			try {
				const response = await investmentService.getInvestmentFee();
				if (response.success && response.data) {
					setTransactionFee(response.data.fee);
				}
			} catch (error) {
				console.error('Erreur lors de la récupération des frais:', error);
				// Garder la valeur par défaut
			} finally {
				setFeeLoading(false);
			}
		};

		fetchInvestmentFee();
	}, []);

	if (!user) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-gray-900 mb-4'>
						Connexion requise
					</h2>
					<p className='text-gray-600'>
						Vous devez être connecté pour accéder aux investissements.
					</p>
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
						Plateforme d'Investissement
					</h1>
					<p className='text-xl text-gray-600 max-w-3xl mx-auto'>
						Investissez dans les actions avec des frais réduits et suivez votre
						portefeuille en temps réel
					</p>
				</div>

				{/* Features */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
					<div className='bg-white rounded-xl shadow-lg p-8 text-center'>
						<div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
							<i className='fi fi-rr-chart-line-up text-blue-600 text-2xl'></i>
						</div>
						<h3 className='text-xl font-semibold text-gray-900 mb-2'>
							Actions disponibles
						</h3>
						<p className='text-gray-600'>
							Investissez dans une sélection d'actions de qualité avec des prix
							en temps réel
						</p>
					</div>

					<div className='bg-white rounded-xl shadow-lg p-8 text-center'>
						<div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
							<i className='fi fi-rr-wallet text-green-600 text-2xl'></i>
						</div>
						<h3 className='text-xl font-semibold text-gray-900 mb-2'>
							Frais réduits
						</h3>
						<p className='text-gray-600'>
							{feeLoading ? 'Chargement...' : `Seulement ${transactionFee}€ de frais par transaction, que ce soit pour l'achat ou la vente`}
						</p>
					</div>

					<div className='bg-white rounded-xl shadow-lg p-8 text-center'>
						<div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
							<i className='fi fi-rr-chart-histogram text-purple-600 text-2xl'></i>
						</div>
						<h3 className='text-xl font-semibold text-gray-900 mb-2'>
							Suivi en temps réel
						</h3>
						<p className='text-gray-600'>
							Suivez la performance de votre portefeuille avec des gains/pertes
							calculés automatiquement
						</p>
					</div>
				</div>

				{/* Action Cards */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					<Link
						href='/investment/stocks'
						className='bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 group'
					>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-lg font-semibold text-gray-900'>
								Actions disponibles
							</h3>
							<i className='fi fi-rr-angle-right text-blue-600 text-xl group-hover:translate-x-1 transition-transform'></i>
						</div>
						<p className='text-gray-600 mb-4'>
							Consultez toutes les actions disponibles à l'investissement et
							passez vos ordres
						</p>
						<div className='flex items-center text-blue-600 font-medium'>
							<span>Explorer les actions</span>
						</div>
					</Link>

					<Link
						href='/investment/portfolio'
						className='bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 group'
					>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-lg font-semibold text-gray-900'>
								Mon portefeuille
							</h3>
							<i className='fi fi-rr-angle-right text-green-600 text-xl group-hover:translate-x-1 transition-transform'></i>
						</div>
						<p className='text-gray-600 mb-4'>
							Suivez vos positions, gains/pertes et la performance globale de
							vos investissements
						</p>
						<div className='flex items-center text-green-600 font-medium'>
							<span>Voir mon portefeuille</span>
						</div>
					</Link>

					<Link
						href='/investment/orders'
						className='bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 group'
					>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-lg font-semibold text-gray-900'>
								Historique des ordres
							</h3>
							<i className='fi fi-rr-angle-right text-purple-600 text-xl group-hover:translate-x-1 transition-transform'></i>
						</div>
						<p className='text-gray-600 mb-4'>
							Consultez l'historique de tous vos ordres d'achat et de vente
							d'actions
						</p>
						<div className='flex items-center text-purple-600 font-medium'>
							<span>Voir mes ordres</span>
						</div>
					</Link>
				</div>

				{/* Info Banner */}
				<div className='mt-12 bg-blue-50 rounded-xl p-8 border border-blue-200'>
					<div className='flex items-start'>
						<div className='shrink-0'>
							<i className='fi fi-rr-bulb text-blue-600 text-xl'></i>
						</div>
						<div className='ml-3'>
							<h4 className='text-lg font-medium text-blue-900 mb-2'>
								Informations importantes
							</h4>
							<div className='text-blue-800 space-y-2'>
								<p>
									• Les frais de transaction sont de {feeLoading ? '...' : `${transactionFee}€`} par ordre (achat ou
									vente)
								</p>
								<p>
									• Les ordres sont exécutés immédiatement au prix du marché
								</p>
								<p>• Votre portefeuille est mis à jour en temps réel</p>
								<p>
									• Vous pouvez annuler un ordre tant qu'il n'est pas exécuté
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
