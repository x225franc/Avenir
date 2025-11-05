"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../components/contexts/AuthContext";
import { accountService, Account } from "../../../components/lib/api/account.service";

export default function AccountsPage() {
	const router = useRouter();
	const { isAuthenticated, loading: authLoading } = useAuth();
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/login");
			return;
		}

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

	const getAccountTypeLabel = (type: string) => {
		switch (type) {
			case "checking":
				return "Compte Courant";
			case "savings":
				return "Compte Épargne";
			case "investment":
				return "Compte Titres";
			default:
				return type;
		}
	};

	const getAccountTypeColor = (type: string) => {
		switch (type) {
			case "checking":
				return "bg-blue-100 text-blue-800";
			case "savings":
				return "bg-green-100 text-green-800";
			case "investment":
				return "bg-purple-100 text-purple-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatBalance = (amount: number) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "EUR",
		}).format(amount);
	};

	if (authLoading || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Chargement...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Mes Comptes</h1>
						<p className="mt-2 text-gray-600">
							Gérez tous vos comptes bancaires
						</p>
					</div>
					<Link
						href="/dashboard/accounts/create"
						className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg flex items-center space-x-2"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 4v16m8-8H4"
							/>
						</svg>
						<span>Nouveau compte</span>
					</Link>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-800">{error}</p>
					</div>
				)}

				{/* Accounts List */}
				{accounts.length === 0 ? (
					<div className="bg-white rounded-xl shadow-md p-12 text-center">
						<svg
							className="w-16 h-16 text-gray-400 mx-auto mb-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
							/>
						</svg>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Aucun compte
						</h3>
						<p className="text-gray-600 mb-6">
							Vous n'avez pas encore de compte bancaire.
						</p>
						<Link
							href="/dashboard/accounts/create"
							className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
						>
							Créer mon premier compte
						</Link>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{accounts.map((account) => (
							<Link
								key={account.id}
								href={`/dashboard/accounts/${account.id}`}
								className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-blue-300"
							>
								{/* Account Type Badge */}
								<div className="flex items-center justify-between mb-4">
									<span
										className={`px-3 py-1 rounded-full text-sm font-semibold ${getAccountTypeColor(
											account.type
										)}`}
									>
										{getAccountTypeLabel(account.type)}
									</span>
									{account.isActive ? (
										<span className="w-3 h-3 bg-green-500 rounded-full"></span>
									) : (
										<span className="w-3 h-3 bg-red-500 rounded-full"></span>
									)}
								</div>

								{/* Account Name */}
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									{account.name}
								</h3>

								{/* IBAN */}
								<p className="text-sm text-gray-500 mb-4 font-mono">
									{account.iban}
								</p>

								{/* Balance */}
								<div className="pt-4 border-t border-gray-200">
									<p className="text-sm text-gray-600 mb-1">Solde actuel</p>
									<p className="text-2xl font-bold text-gray-900">
										{formatBalance(account.balance)}
									</p>
								</div>

								{/* Interest Rate for Savings */}
								{account.type === "savings" && account.interestRate && (
									<div className="mt-3 flex items-center text-sm text-green-600">
										<svg
											className="w-4 h-4 mr-1"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
												clipRule="evenodd"
											/>
										</svg>
										<span>
											{(account.interestRate * 100).toFixed(2)}% / an
										</span>
									</div>
								)}
							</Link>
						))}
					</div>
				)}

				{/* Back to Dashboard */}
				<div className="mt-8">
					<Link
						href="/dashboard"
						className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						<span>Retour au tableau de bord</span>
					</Link>
				</div>
			</div>
		</div>
	);
}
