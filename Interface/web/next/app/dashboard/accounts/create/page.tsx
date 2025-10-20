"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountService } from "../../../../src/lib/api/account.service";
import { useAuth } from "../../../../src/contexts/AuthContext";

// Schéma de validation
const createAccountSchema = z.object({
	accountName: z
		.string()
		.min(3, "Le nom doit contenir au moins 3 caractères")
		.max(50, "Le nom ne peut pas dépasser 50 caractères"),
	accountType: z.enum(["checking", "savings", "investment"]),
	initialDeposit: z
		.number()
		.min(0, "Le dépôt initial ne peut pas être négatif")
		.optional(),
});

type CreateAccountForm = z.infer<typeof createAccountSchema>;

export default function CreateAccountPage() {
	const router = useRouter();
	const { user, isAuthenticated } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [success, setSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<CreateAccountForm>({
		resolver: zodResolver(createAccountSchema),
		defaultValues: {
			accountType: "checking",
			initialDeposit: 0,
		},
	});

	const selectedType = watch("accountType");

	const onSubmit = async (data: CreateAccountForm) => {
		try {
			setLoading(true);
			setError("");

			if (!isAuthenticated) {
				setError("Vous devez être connecté pour créer un compte");
				setLoading(false);
				return;
			}

			const response = await accountService.create({
				accountName: data.accountName,
				accountType: data.accountType,
				initialDeposit: data.initialDeposit,
			});

			if (response.success) {
				setSuccess(true);
				setTimeout(() => {
					router.push("/dashboard/accounts");
				}, 1500);
			} else {
				setError(response.error || "Erreur lors de la création du compte");
			}
		} catch (err: any) {
			setError(
				err.response?.data?.error || "Impossible de créer le compte"
			);
		} finally {
			setLoading(false);
		}
	};

	const accountTypes = [
		{
			value: "checking",
			label: "Compte Courant",
			description: "Pour vos dépenses quotidiennes et virements",
			icon: "💳",
			color: "blue",
		},
		{
			value: "savings",
			label: "Compte Épargne",
			description: "Pour faire fructifier votre argent avec intérêts",
			icon: "🏦",
			color: "green",
		},
		{
			value: "investment",
			label: "Compte Titres",
			description: "Pour investir dans des actions",
			icon: "📈",
			color: "purple",
		},
	];

	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							className="w-8 h-8 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Compte créé avec succès !
					</h2>
					<p className="text-gray-600">
						Redirection vers vos comptes...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<Link
						href="/dashboard/accounts"
						className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2 mb-4"
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
						<span>Retour à mes comptes</span>
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">
						Créer un nouveau compte
					</h1>
					<p className="mt-2 text-gray-600">
						Choisissez le type de compte qui correspond à vos besoins
					</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-800">{error}</p>
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Account Type Selection */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-3">
							Type de compte *
						</label>
						<div className="grid gap-4 md:grid-cols-3">
							{accountTypes.map((type) => (
								<label
									key={type.value}
									className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition ${
										selectedType === type.value
											? `border-${type.color}-500 bg-${type.color}-50`
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									<input
										type="radio"
										value={type.value}
										{...register("accountType")}
										className="sr-only"
									/>
									<div className="text-3xl mb-2">{type.icon}</div>
									<div className="font-semibold text-gray-900 mb-1">
										{type.label}
									</div>
									<div className="text-sm text-gray-600">
										{type.description}
									</div>
									{selectedType === type.value && (
										<div className="absolute top-2 right-2">
											<svg
												className={`w-6 h-6 text-${type.color}-600`}
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
									)}
								</label>
							))}
						</div>
						{errors.accountType && (
							<p className="mt-2 text-sm text-red-600">
								{errors.accountType.message}
							</p>
						)}
					</div>

					{/* Account Name */}
					<div>
						<label
							htmlFor="accountName"
							className="block text-sm font-semibold text-gray-900 mb-2"
						>
							Nom personnalisé du compte *
						</label>
						<input
							type="text"
							id="accountName"
							{...register("accountName")}
							placeholder="Ex: Mon compte principal, Épargne vacances..."
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
						{errors.accountName && (
							<p className="mt-2 text-sm text-red-600">
								{errors.accountName.message}
							</p>
						)}
					</div>

					{/* Initial Deposit (Optional) */}
					<div>
						<label
							htmlFor="initialDeposit"
							className="block text-sm font-semibold text-gray-900 mb-2"
						>
							Dépôt initial (optionnel)
						</label>
						<div className="relative">
							<input
								type="number"
								id="initialDeposit"
								step="0.01"
                                max='10000'
								{...register("initialDeposit", { valueAsNumber: true })}
								placeholder="0.00"
								className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
								<span className="text-gray-500">€</span>
							</div>
						</div>
						{errors.initialDeposit && (
							<p className="mt-2 text-sm text-red-600">
								{errors.initialDeposit.message}
							</p>
						)}
						<p className="mt-2 text-sm text-gray-600">
							Vous pourrez alimenter votre compte plus tard
						</p>
					</div>

					{/* Submit Button */}
					<div className="flex items-center space-x-4">
						<button
							type="submit"
							disabled={loading}
							className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Création en cours..." : "Créer le compte"}
						</button>
						<Link
							href="/dashboard/accounts"
							className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
						>
							Annuler
						</Link>
					</div>
				</form>

				{/* Info Box */}
				<div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<div className="flex items-start space-x-3">
						<svg
							className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
								clipRule="evenodd"
							/>
						</svg>
						<div>
							<h3 className="font-semibold text-blue-900 mb-1">
								À savoir
							</h3>
							<ul className="text-sm text-blue-800 space-y-1">
								<li>• Un IBAN unique sera automatiquement généré</li>
								<li>• Vous pouvez créer autant de comptes que vous le souhaitez</li>
								<li>• Les comptes épargne bénéficient d'un taux d'intérêt</li>
								<li>• Vous pourrez modifier ou supprimer vos comptes plus tard</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
