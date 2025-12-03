"use client";

import { useState } from "react";
import { userService, CreateUserDTO } from "../../../../components/lib/api/user.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useClientMetadata } from "@/components/lib/seo";
import '@flaticon/flaticon-uicons/css/all/all.css';

export default function CreateUserPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState<CreateUserDTO>({
		email: "",
		password: "",
		firstName: "",
		lastName: "",
		phoneNumber: "",
		address: "",
		role: "client",
	});

	useClientMetadata("/admin/users");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Nettoyer les champs optionnels vides
			const cleanData = {
				...formData,
				phoneNumber: formData.phoneNumber?.trim() || undefined,
				address: formData.address?.trim() || undefined,
			};

			const response = await userService.create(cleanData);
			
			if (response.success) {
				router.push("/admin/users");
			} else {
				setError(response.error || "Erreur lors de la création de l'utilisateur");
			}
		} catch (error) {
			setError("Erreur lors de la création de l'utilisateur");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev: CreateUserDTO) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-100 p-8">
			<div className="max-w-2xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-purple-900 flex items-center gap-2">
								<i className="fi fi-rr-user-add"></i>
								Créer un Utilisateur
							</h1>
							<p className="text-purple-600 mt-2">
								Ajoutez un nouvel utilisateur au système
							</p>
						</div>
						<Link
							href="/admin/users"
							className="text-purple-600 hover:text-purple-800 font-medium"
						>
							← Retour à la liste
						</Link>
					</div>
				</div>

				{/* Formulaire */}
				<div className="bg-white rounded-lg shadow-lg p-8">
					{error && (
						<div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Informations de base */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
									Prénom *
								</label>
								<input
									type="text"
									id="firstName"
									name="firstName"
									required
									value={formData.firstName}
									onChange={handleInputChange}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
									placeholder="John"
								/>
							</div>

							<div>
								<label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
									Nom *
								</label>
								<input
									type="text"
									id="lastName"
									name="lastName"
									required
									value={formData.lastName}
									onChange={handleInputChange}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
									placeholder="Doe"
								/>
							</div>
						</div>

						{/* Email */}
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
								Email *
							</label>
							<input
								type="email"
								id="email"
								name="email"
								required
								value={formData.email}
								onChange={handleInputChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								placeholder="john.doe@example.com"
							/>
						</div>

						{/* Mot de passe */}
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
								Mot de passe *
							</label>
							<input
								type="password"
								id="password"
								name="password"
								required
								value={formData.password}
								onChange={handleInputChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								placeholder="••••••••"
								minLength={6}
							/>
							<p className="text-sm text-gray-500 mt-1">
								Le mot de passe doit contenir au moins 6 caractères
							</p>
						</div>

						{/* Rôle */}
						<div>
							<label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
								Rôle *
							</label>
						<select
							id="role"
							name="role"
							required
							value={formData.role}
							onChange={handleInputChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						>
							<option value="client"><i className="fi fi-rr-user"></i> Client</option>
							<option value="advisor"><i className="fi fi-rr-user-headset"></i> Conseiller</option>
							<option value="director"><i className="fi fi-rr-briefcase"></i> Directeur</option>
						</select>
						</div>

						{/* Informations optionnelles */}
						<div className="border-t pt-6">
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Informations optionnelles
							</h3>
							
							<div className="space-y-4">
								<div>
									<label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
										Numéro de téléphone
									</label>
									<input
										type="tel"
										id="phoneNumber"
										name="phoneNumber"
										value={formData.phoneNumber}
										onChange={handleInputChange}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
										placeholder="+33 1 23 45 67 89"
									/>
								</div>

								<div>
									<label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
										Adresse
									</label>
									<textarea
										id="address"
										name="address"
										rows={3}
										value={formData.address}
										onChange={handleInputChange}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
										placeholder="123 Rue de la Paix, 75001 Paris"
									/>
								</div>
							</div>
						</div>

						{/* Boutons */}
						<div className="flex justify-end space-x-4 pt-6 border-t">
							<Link
								href="/admin/users"
								className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Annuler
							</Link>
							<button
								type="submit"
								disabled={loading}
								className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<>
										<span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span>
										Création...
									</>
								) : (
									"Créer l'utilisateur"
								)}
							</button>
						</div>
					</form>
				</div>

				{/* Aide */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
					<h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
						<i className="fi fi-rr-bulb"></i>
						Informations utiles
					</h4>
					<ul className="text-sm text-blue-800 space-y-1">
						<li>• L'utilisateur recevra un email pour vérifier son compte</li>
						<li>• Le mot de passe peut être modifié après création</li>
						<li>• Les rôles définissent les permissions d'accès au système</li>
						<li>• Les conseillers peuvent gérer les transactions en attente</li>
						<li>• Les directeurs ont accès à toutes les fonctionnalités administratives</li>
					</ul>
				</div>
			</div>
		</div>
	);
}