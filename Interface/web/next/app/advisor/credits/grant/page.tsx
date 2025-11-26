"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../components/contexts/AuthContext";
import { creditService } from "../../../../components/lib/api/credit.service";
import { accountService, Account } from "../../../../components/lib/api/account.service";
import { userService, User as ApiUser } from "../../../../components/lib/api/user.service";
import '@flaticon/flaticon-uicons/css/all/all.css';

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role?: string;
}

export default function GrantCreditPage() {
	const router = useRouter();
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const [users, setUsers] = useState<User[]>([]);
	const [accounts, setAccounts] = useState<Account[]>([]);

	const [formData, setFormData] = useState({
		userId: "",
		accountId: "",
		principalAmount: "",
		annualInterestRate: "0.05",
		insuranceRate: "0.003",
		durationMonths: "120",
	});

	const [calculation, setCalculation] = useState<{
		totalAmount: number;
		totalInterest: number;
		totalInsurance: number;
		monthlyCost: number;
	} | null>(null);

	useEffect(() => {
		if (!user || (user.role !== "advisor" && user.role !== "director")) {
			router.push("/advisor/login");
			return;
		}

		loadInitialData();
	}, [user, router]);

	const loadInitialData = async () => {
		try {
			setLoadingData(true);
			// Charger la liste des clients (utilisateurs non-conseillers)
			const usersResponse = await userService.getAllForAdvisor();
			if (usersResponse.success && usersResponse.data) {
				setUsers(
					usersResponse.data.filter((u: any) => u.role === "client" || !u.role)
				);
			}
		} catch (err) {
			console.error("Error loading data:", err);
			setError("Erreur lors du chargement des données");
		} finally {
			setLoadingData(false);
		}
	};

	const loadUserAccounts = async (userId: string) => {
		try {
			const accountsResponse = await accountService.getUserAccounts(userId);
			if (accountsResponse.success && accountsResponse.data) {
				setAccounts(accountsResponse.data);
			}
		} catch (err) {
			console.error("Error loading accounts:", err);
			setError("Erreur lors du chargement des comptes");
		}
	};

	const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const userId = e.target.value;
		setFormData({ ...formData, userId, accountId: "" });
		setAccounts([]);
		if (userId) {
			loadUserAccounts(userId);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleCalculate = async () => {
		if (
			!formData.principalAmount ||
			!formData.annualInterestRate ||
			!formData.insuranceRate ||
			!formData.durationMonths
		) {
			setError("Veuillez remplir tous les champs pour calculer");
			return;
		}

		try {
			const result = await creditService.calculateCredit(
				parseFloat(formData.principalAmount),
				parseFloat(formData.annualInterestRate),
				parseFloat(formData.insuranceRate),
				parseInt(formData.durationMonths)
			);

			if (result.success) {
				setCalculation(result);
				setError(null);
			}
		} catch (err) {
			console.error("Error calculating credit:", err);
			setError("Erreur lors du calcul");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		// Validation
		if (
			!formData.userId ||
			!formData.accountId ||
			!formData.principalAmount ||
			!formData.annualInterestRate ||
			!formData.insuranceRate ||
			!formData.durationMonths
		) {
			setError("Veuillez remplir tous les champs");
			return;
		}

		try {
			setLoading(true);

			const result = await creditService.grantCredit({
				userId: parseInt(formData.userId),
				accountId: parseInt(formData.accountId),
				principalAmount: parseFloat(formData.principalAmount),
				annualInterestRate: parseFloat(formData.annualInterestRate),
				insuranceRate: parseFloat(formData.insuranceRate),
				durationMonths: parseInt(formData.durationMonths),
			});

			if (result.success) {
				setSuccess(true);
				setFormData({
					userId: "",
					accountId: "",
					principalAmount: "",
					annualInterestRate: "0.05",
					insuranceRate: "0.003",
					durationMonths: "120",
				});
				setAccounts([]);
				setCalculation(null);
				setTimeout(() => {
					router.push("/advisor/dashboard");
				}, 2000);
			}
		} catch (err: any) {
			console.error("Error granting credit:", err);
			setError(
				err.response?.data?.message ||
					"Une erreur est survenue lors de l'octroi du crédit"
			);
		} finally {
			setLoading(false);
		}
	};

	if (loadingData) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-3xl mx-auto">
				<div className="bg-white shadow-xl rounded-lg overflow-hidden">
					<div className="px-6 py-8">
						<h2 className="text-3xl font-bold text-gray-900 mb-6">
							Octroyer un crédit
						</h2>

						{/* Success Message */}
						{success && (
							<div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
							<div className="flex">
								<div className="flex-shrink-0">
									<i className="fi fi-rr-check-circle text-green-600 text-xl"></i>
								</div>
								<div className="ml-3">
										<p className="text-sm text-green-800">
											Crédit octroyé avec succès ! Redirection...
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Error Message */}
						{error && (
							<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
							<div className="flex">
								<div className="flex-shrink-0">
									<i className="fi fi-rr-cross-circle text-red-600 text-xl"></i>
								</div>
								<div className="ml-3">
										<p className="text-sm text-red-800">{error}</p>
									</div>
								</div>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Client Selection */}
							<div>
								<label
									htmlFor="userId"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Client
								</label>
								<select
									id="userId"
									name="userId"
									value={formData.userId}
									onChange={handleUserChange}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="">Sélectionner un client</option>
									{users.map((u) => (
										<option key={u.id} value={u.id}>
											{u.firstName} {u.lastName} ({u.email})
										</option>
									))}
								</select>
							</div>

							{/* Account Selection */}
							<div>
								<label
									htmlFor="accountId"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Compte
								</label>
								<select
									id="accountId"
									name="accountId"
									value={formData.accountId}
									onChange={handleChange}
									required
									disabled={!formData.userId}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
								>
									<option value="">Sélectionner un compte</option>
									{accounts.map((account) => (
										<option key={account.id} value={account.id}>
											{account.name} ({account.iban}) -{" "}
											{account.balance.toLocaleString("fr-FR", {
												style: "currency",
												currency: account.currency || "EUR",
											})}
										</option>
									))}
								</select>
							</div>

							{/* Principal Amount */}
							<div>
								<label
									htmlFor="principalAmount"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Montant du crédit (€)
								</label>
								<input
									type="number"
									id="principalAmount"
									name="principalAmount"
									value={formData.principalAmount}
									onChange={handleChange}
									step="0.01"
									min="0"
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Ex: 10000"
								/>
							</div>

							{/* Annual Interest Rate */}
							<div>
								<label
									htmlFor="annualInterestRate"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Taux d'intérêt annuel (ex: 0.05 pour 5%)
								</label>
								<input
									type="number"
									id="annualInterestRate"
									name="annualInterestRate"
									value={formData.annualInterestRate}
									onChange={handleChange}
									step="0.0001"
									min="0"
									max="1"
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							{/* Insurance Rate */}
							<div>
								<label
									htmlFor="insuranceRate"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Taux d'assurance (ex: 0.003 pour 0.3%)
								</label>
								<input
									type="number"
									id="insuranceRate"
									name="insuranceRate"
									value={formData.insuranceRate}
									onChange={handleChange}
									step="0.0001"
									min="0"
									max="1"
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							{/* Duration */}
							<div>
								<label
									htmlFor="durationMonths"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Durée (en mois)
								</label>
								<input
									type="number"
									id="durationMonths"
									name="durationMonths"
									value={formData.durationMonths}
									onChange={handleChange}
									min="1"
									max="360"
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							{/* Calculate Button */}
							<div>
								<button
									type="button"
									onClick={handleCalculate}
									className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
								>
									Calculer les mensualités
								</button>
							</div>

							{/* Calculation Result */}
							{calculation && (
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<h3 className="text-lg font-semibold text-blue-900 mb-3">
										Résumé du crédit
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-blue-700">Mensualité :</span>
											<span className="font-bold text-blue-900">
												{calculation.monthlyCost.toLocaleString("fr-FR", {
													style: "currency",
													currency: "EUR",
												})}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-blue-700">Coût total :</span>
											<span className="font-semibold text-blue-900">
												{calculation.totalAmount.toLocaleString("fr-FR", {
													style: "currency",
													currency: "EUR",
												})}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-blue-700">
												Total des intérêts :
											</span>
											<span className="text-blue-900">
												{calculation.totalInterest.toLocaleString("fr-FR", {
													style: "currency",
													currency: "EUR",
												})}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-blue-700">
												Total de l'assurance :
											</span>
											<span className="text-blue-900">
												{calculation.totalInsurance.toLocaleString("fr-FR", {
													style: "currency",
													currency: "EUR",
												})}
											</span>
										</div>
									</div>
								</div>
							)}

							{/* Submit Button */}
							<div>
								<button
									type="submit"
									disabled={loading}
									className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400"
								>
									{loading ? "Octroi en cours..." : "Octroyer le crédit"}
								</button>
							</div>

							<div className="text-center">
								<button
									type="button"
									onClick={() => router.push("/advisor/dashboard")}
									className="text-blue-600 hover:text-blue-800 text-sm"
								>
									Retour au dashboard
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
