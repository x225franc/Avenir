"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, RegisterFormData } from "../../src/lib/validations/schemas";
import { authService } from "../../src/lib/api/auth.service";

export default function RegisterPage() {
	const router = useRouter();
	const [error, setError] = useState<string>("");
	const [success, setSuccess] = useState<string>("");
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterFormData) => {
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const response = await authService.register({
				email: data.email,
				password: data.password,
				firstName: data.firstName,
				lastName: data.lastName,
				phoneNumber: data.phoneNumber,
				address: data.address,
			});

			if (response.success) {
				setSuccess(
					"Inscription réussie ! Vérifiez votre email pour activer votre compte."
				);
				setTimeout(() => {
					router.push("/login");
				}, 2000);
			} else {
				setError(response.error || "Une erreur est survenue lors de l'inscription");
			}
		} catch (err: any) {
			setError(err.response?.data?.error || "Erreur de connexion au serveur");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						🏦 Banque AVENIR
					</h1>
					<p className="text-gray-600">Créer votre compte</p>
				</div>

				{/* Messages */}
				{error && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
						{error}
					</div>
				)}
				{success && (
					<div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
						{success}
					</div>
				)}

				{/* Formulaire */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{/* Email */}
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
							Email *
						</label>
						<input
							{...register("email")}
							type="email"
							id="email"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="votre@email.com"
						/>
						{errors.email && (
							<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
						)}
					</div>

					{/* Prénom & Nom */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
								Prénom *
							</label>
							<input
								{...register("firstName")}
								type="text"
								id="firstName"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Jean"
							/>
							{errors.firstName && (
								<p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
							)}
						</div>

						<div>
							<label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
								Nom *
							</label>
							<input
								{...register("lastName")}
								type="text"
								id="lastName"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Dupont"
							/>
							{errors.lastName && (
								<p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
							)}
						</div>
					</div>

					{/* Mot de passe */}
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
							Mot de passe *
						</label>
						<input
							{...register("password")}
							type="password"
							id="password"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="••••••••"
						/>
						{errors.password && (
							<p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
						)}
					</div>

					{/* Confirmation mot de passe */}
					<div>
						<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
							Confirmer le mot de passe *
						</label>
						<input
							{...register("confirmPassword")}
							type="password"
							id="confirmPassword"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="••••••••"
						/>
						{errors.confirmPassword && (
							<p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
						)}
					</div>

					{/* Téléphone (optionnel) */}
					<div>
						<label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
							Téléphone
						</label>
						<input
							{...register("phoneNumber")}
							type="tel"
							id="phoneNumber"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="06 12 34 56 78"
						/>
						{errors.phoneNumber && (
							<p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
						)}
					</div>

					{/* Adresse (optionnel) */}
					<div>
						<label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
							Adresse
						</label>
						<textarea
							{...register("address")}
							id="address"
							rows={2}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="123 Rue de Paris, 75001 Paris"
						/>
						{errors.address && (
							<p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
						)}
					</div>

					{/* Bouton */}
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						{loading ? "Inscription en cours..." : "S'inscrire"}
					</button>
				</form>

				{/* Lien vers connexion */}
				<p className="mt-6 text-center text-sm text-gray-600">
					Déjà inscrit ?{" "}
					<Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
						Se connecter
					</Link>
				</p>
			</div>
		</div>
	);
}
