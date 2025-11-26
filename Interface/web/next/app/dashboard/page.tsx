"use client";

import "@flaticon/flaticon-uicons/css/all/all.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/contexts/AuthContext";
import {
	accountService,
	Account,
} from "../../components/lib/api/account.service";

export default function DashboardPage() {
	const router = useRouter();
	const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		// Rediriger si non authentifié
		if (!authLoading && !isAuthenticated) {
			router.push("/login");
			return;
		}

		// Charger les comptes
		if (isAuthenticated) {
			loadAccounts();
		}
	}, [authLoading, isAuthenticated, router]);

	const loadAccounts = async () => {
		try {
			setLoading(true);
			setError("");
			const response = await accountService.getAll();

			if (response.success && response.data) {
				setAccounts(response.data);
			} else {
				setError(response.error || "Erreur lors du chargement des comptes");
			}
		} catch (err: any) {
			console.error("Erreur chargement comptes:", err);
			setError("Impossible de charger vos comptes");
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		logout();
		router.push("/login");
	};

	// Calculer le solde total
	const totalBalance = accounts.reduce(
		(sum, account) => sum + account.balance,
		0
	);

	// Affichage du loader pendant l'authentification
	if (authLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600'>Chargement...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
			{/* Welcome Section */}
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8'>
				<div className='bg-gradient-to-r from-blue-600 to-blue-300 rounded-xl shadow-lg p-8 text-white mb-8'>
					<h2 className='text-3xl font-bold mb-2'>
						Bienvenue, {user?.firstName} !
					</h2>
					<p className='text-blue-100'>
						Votre espace client pour gérer vos comptes et finances
					</p>
				</div>
			</div>

			{/* Contenu principal */}
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
					{/* Solde total */}
					<div className='bg-white rounded-xl shadow-lg p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600 mb-1'>Solde total</p>
								<p className='text-3xl font-bold text-gray-900'>
									{totalBalance.toLocaleString("fr-FR", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}{" "}
									€
								</p>
							</div>
							<div className='bg-blue-100 rounded-full p-3'>
								<i className='fi fi-rr-wallet text-blue-600 text-2xl'></i>
							</div>
						</div>
					</div>{" "}
					{/* Nombre de comptes */}
					<div className='bg-white rounded-xl shadow-lg p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600 mb-1'>Mes comptes</p>
								<p className='text-3xl font-bold text-gray-900'>
									{accounts.length}
								</p>
							</div>
							<div className='bg-green-100 rounded-full p-3'>
								<i className='fi fi-rr-credit-card text-green-600 text-2xl'></i>
							</div>
						</div>
					</div>
					{/* Email vérifié */}
					<div className='bg-white rounded-xl shadow-lg p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600 mb-1'>Statut du compte</p>
								<p className="text-lg font-bold flex items-center gap-2 {user?.emailVerified ? 'text-green-600' : 'text-yellow-600'}">
									{user?.emailVerified ? (
										<>
											<i className='fi fi-rr-check-circle'></i>
											Vérifié
										</>
									) : (
										<>
											<i className='fi fi-rr-exclamation'></i>
											Non vérifié
										</>
									)}
								</p>
							</div>
							<div className='bg-purple-100 rounded-full p-3'>
								<i className='fi fi-rr-shield-check text-purple-600 text-2xl'></i>
							</div>
						</div>
					</div>
					{/* Messages */}
					<div
						className='bg-white rounded-xl shadow-lg p-6 cursor-pointer'
						onClick={() => router.push("/messages")}
					>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600 mb-1'>Messagerie</p>
								<p className='text-lg font-bold text-blue-600'>
									Contacter un conseiller
								</p>
							</div>
							<div className='bg-blue-100 rounded-full p-3'>
								<i className='fi fi-rr-comment text-blue-600 text-2xl'></i>
							</div>
						</div>
					</div>
				</div>{" "}
				{/* Section des comptes */}
				<div className='bg-white rounded-xl shadow-lg p-6'>
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-2xl font-bold text-gray-900'>
							Mes comptes bancaires
						</h2>
						<button
							onClick={() => router.push("/dashboard/accounts/create")}
							className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2'
						>
							<i className='fi fi-rr-plus'></i>
							<span>Créer un compte</span>
						</button>
					</div>

					{/* Message d'erreur */}
					{error && (
						<div className='mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg'>
							{error}
						</div>
					)}

					{/* Loader */}
					{loading ? (
						<div className='text-center py-12'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
							<p className='text-gray-600'>Chargement de vos comptes...</p>
						</div>
					) : accounts.length === 0 ? (
						<div className='text-center py-12'>
							<i className='fi fi-rr-wallet text-gray-400 text-6xl mb-4 block'></i>
							<p className='text-gray-600 mb-4'>
								Aucun compte bancaire pour le moment
							</p>
							<button
								onClick={() => router.push("/dashboard/accounts/create")}
								className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
							>
								Créer votre premier compte
							</button>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							{accounts.map((account) => (
								<div
									key={account.id}
									className='border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer'
									onClick={() =>
										router.push(`/dashboard/accounts/${account.id}`)
									}
								>
									<div className='flex items-start justify-between mb-4'>
										<div>
											<h3 className='text-lg font-bold text-gray-900 mb-1'>
												{account.name}
											</h3>
											<p className='text-sm text-gray-500'>
												{account.type === "checking" && "Compte Courant"}
												{account.type === "savings" && "Compte Épargne"}
												{account.type === "investment" &&
													"Compte Investissement"}
											</p>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
												account.type === "checking"
													? "bg-blue-100 text-blue-800"
													: account.type === "savings"
													? "bg-green-100 text-green-800"
													: "bg-purple-100 text-purple-800"
											}`}
										>
											{account.type === "checking" && (
												<i className='fi fi-rr-credit-card'></i>
											)}
											{account.type === "savings" && (
												<i className='fi fi-rr-piggy-bank'></i>
											)}
											{account.type === "investment" && (
												<i className='fi fi-rr-chart-line-up'></i>
											)}
										</span>
									</div>

									<div className='mb-4'>
										<p className='text-sm text-gray-500 mb-1'>IBAN</p>
										<p className='text-sm font-mono text-gray-700'>
											{account.iban}
										</p>
									</div>

									<div className='flex items-center justify-between pt-4 border-t border-gray-200'>
										<span className='text-sm text-gray-500'>Solde</span>
										<span className='text-2xl font-bold text-gray-900'>
											{account.balance.toLocaleString("fr-FR", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}{" "}
											€
										</span>
									</div>

									{account.type === "savings" && account.interestRate && (
										<div className='mt-2 text-sm text-green-600'>
											Taux d'intérêt : {account.interestRate}%
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
