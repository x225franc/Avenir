"use client";

import { useState, useEffect } from "react";
import { userService, User, UpdateUserDTO } from "../../../../components/lib/api/user.service";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditUserPage() {
	const router = useRouter();
	const params = useParams();
	const userId = params.id as string;

	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState<UpdateUserDTO>({
		firstName: "",
		lastName: "",
		phoneNumber: "",
		address: "",
		role: "client",
		emailVerified: false,
	});

	useEffect(() => {
		loadUser();
	}, [userId]);

	const loadUser = async () => {
		try {
			setLoading(true);
			const response = await userService.getById(userId);
			if (response.success && response.data) {
				const userData = response.data;
				setUser(userData);
				setFormData({
					firstName: userData.firstName,
					lastName: userData.lastName,
					phoneNumber: userData.phone || "",
					address: userData.address || "",
					role: userData.role as "client" | "advisor" | "director",
					emailVerified: userData.emailVerified,
				});
			} else {
				setError(response.error || "Erreur lors du chargement de l'utilisateur");
			}
		} catch (error) {
			setError("Erreur lors du chargement de l'utilisateur");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);

		try {
			// Nettoyer les champs optionnels vides
			const cleanData: UpdateUserDTO = {
				...formData,
				phoneNumber: formData.phoneNumber?.trim() || undefined,
				address: formData.address?.trim() || undefined,
			};

			const response = await userService.update(userId, cleanData);
			
			if (response.success) {
				router.push("/admin/users");
			} else {
				setError(response.error || "Erreur lors de la mise à jour de l'utilisateur");
			}
		} catch (error) {
			setError("Erreur lors de la mise à jour de l'utilisateur");
		} finally {
			setSubmitting(false);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	) => {
		const { name, value, type } = e.target;
		setFormData((prev: UpdateUserDTO) => ({
			...prev,
			[name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
				<div className="max-w-2xl mx-auto">
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
						<p className="mt-4 text-purple-600">Chargement de l'utilisateur...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
				<div className="max-w-2xl mx-auto">
					<div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
						Utilisateur non trouvé
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
			<div className="max-w-2xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-purple-900">
								✏️ Modifier l'Utilisateur
							</h1>
							<p className="text-purple-600 mt-2">
								Éditez les informations de {user.fullName}
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

				{/* Informations utilisateur */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Informations système</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<span className="text-sm text-gray-500">ID Utilisateur</span>
							<p className="font-mono text-sm">{user.id}</p>
						</div>
						<div>
							<span className="text-sm text-gray-500">Email</span>
							<p className="font-medium">{user.email}</p>
						</div>
						<div>
							<span className="text-sm text-gray-500">Créé le</span>
							<p>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</p>
						</div>
						<div>
							<span className="text-sm text-gray-500">Statut</span>
							<div className="space-x-2">
								{user.isBanned ? (
									<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
										🚫 Banni
									</span>
								) : (
									<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
										✅ Actif
									</span>
								)}
							</div>
						</div>
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
						{/* Informations personnelles */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Informations personnelles
							</h3>
							
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
									/>
								</div>
							</div>
						</div>

						{/* Contact */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Informations de contact
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
									/>
								</div>
							</div>
						</div>

						{/* Paramètres système */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Paramètres système
							</h3>
							
							<div className="space-y-4">
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
										<option value="client">👤 Client</option>
										<option value="advisor">🏦 Conseiller</option>
										<option value="director">🎯 Directeur</option>
									</select>
								</div>

								<div>
									<label className="flex items-center">
										<input
											type="checkbox"
											name="emailVerified"
											checked={formData.emailVerified}
											onChange={handleInputChange}
											className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
										/>
										<span className="ml-2 text-sm text-gray-700">
											Email vérifié
										</span>
									</label>
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
								disabled={submitting}
								className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{submitting ? (
									<>
										<span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span>
										Mise à jour...
									</>
								) : (
									"Mettre à jour"
								)}
							</button>
						</div>
					</form>
				</div>

				{/* Actions spéciales */}
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
					<h4 className="font-medium text-yellow-900 mb-2">⚠️ Actions spéciales</h4>
					<p className="text-sm text-yellow-800 mb-3">
						Ces actions sont disponibles depuis la liste des utilisateurs :
					</p>
					<ul className="text-sm text-yellow-800 space-y-1">
						<li>• Bannir/Débannir l'utilisateur</li>
						<li>• Supprimer définitivement le compte</li>
						<li>• Réinitialiser le mot de passe (via l'interface utilisateur)</li>
					</ul>
				</div>
			</div>
		</div>
	);
}