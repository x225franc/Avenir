"use client";

import { useState, useEffect } from "react";
import { userService, User } from "../../../components/lib/api/user.service";
import Link from "next/link";
import { useClientMetadata } from "@/components/lib/seo";
import '@flaticon/flaticon-uicons/css/all/all.css';

export default function AdminUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: User | null }>({
		show: false,
		user: null,
	});

	useClientMetadata("/admin/users");

	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = async () => {
		try {
			setLoading(true);
			const response = await userService.getAll();
			if (response.success) {
				setUsers(response.data ?? []);
			} else {
				setError(response.error || "Erreur lors du chargement des utilisateurs");
			}
		} catch (error) {
			setError("Erreur lors du chargement des utilisateurs");
		} finally {
			setLoading(false);
		}
	};

	const handleBanToggle = async (userId: string, isBanned: boolean) => {
		try {
			const response = isBanned 
				? await userService.unban(userId)
				: await userService.ban(userId);
				
			if (response.success) {
				loadUsers(); // Recharger la liste
			} else {
				setError(response.error || "Erreur lors de la modification");
			}
		} catch (error) {
			setError("Erreur lors de la modification");
		}
	};

	const handleDelete = async () => {
		if (!deleteModal.user) return;

		try {
			const response = await userService.delete(deleteModal.user.id);
			if (response.success) {
				setDeleteModal({ show: false, user: null });
				loadUsers(); // Recharger la liste
			} else {
				setError(response.error || "Erreur lors de la suppression");
			}
		} catch (error) {
			setError("Erreur lors de la suppression");
		}
	};

	const getRoleBadge = (role: string) => {
		const colors = {
			client: "bg-blue-100 text-blue-800",
			advisor: "bg-green-100 text-green-800",
			director: "bg-purple-100 text-purple-800",
		};
		return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-100 p-8">
				<div className="max-w-6xl mx-auto">
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
						<p className="mt-4 text-purple-600">Chargement des utilisateurs...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-100 p-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-purple-900 flex items-center gap-2">
								<i className="fi fi-rr-users"></i>
								Gestion des Utilisateurs
							</h1>
							<p className="text-purple-600 mt-2">
								Administrez les comptes utilisateurs et leurs permissions
							</p>
						</div>
						<Link
							href="/admin/users/create"
							className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
						>
							<i className="fi fi-rr-plus"></i>
							Créer un utilisateur
						</Link>
					</div>
				</div>

				{/* Message d'erreur */}
				{error && (
					<div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
						{error}
					</div>
				)}

				{/* Liste des utilisateurs */}
				<div className="bg-white rounded-lg shadow-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-purple-600 text-white">
								<tr>
									<th className="px-6 py-4 text-left">Utilisateur</th>
									<th className="px-6 py-4 text-left">Email</th>
									<th className="px-6 py-4 text-left">Rôle</th>
									<th className="px-6 py-4 text-left">Statut</th>
									<th className="px-6 py-4 text-left">Créé le</th>
									<th className="px-6 py-4 text-left">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{users.map((user) => (
									<tr key={user.id} className="hover:bg-purple-50">
										<td className="px-6 py-4">
											<div>
												<div className="font-medium text-gray-900">
													{user.fullName}
												</div>
												<div className="text-sm text-gray-500">
													ID: {user.id.slice(0, 8)}...
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-gray-900">{user.email}</div>
											{user.phone && (
												<div className="text-sm text-gray-500">{user.phone}</div>
											)}
										</td>
										<td className="px-6 py-4">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
													user.role
												)}`}
											>
												{user.role === "director" && "Directeur"}
												{user.role === "advisor" && "Conseiller"}
												{user.role === "client" && "Client"}
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="space-y-1">
												{user.isBanned ? (
													<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
														<i className="fi fi-rr-ban"></i> Banni
													</span>
												) : (
													<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
														<i className="fi fi-rr-check-circle"></i> Actif
													</span>
												)}
												{user.emailVerified ? (
													<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
														<i className="fi fi-rr-envelope-marker"></i> Vérifié
													</span>
												) : (
													<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
														<i className="fi fi-rr-exclamation"></i> Non vérifié
													</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 text-sm text-gray-500">
											{new Date(user.createdAt).toLocaleDateString("fr-FR")}
										</td>
										<td className="px-6 py-4">
											<div className="flex space-x-2">
												<Link
													href={`/admin/users/${user.id}`}
													className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
												>
													<i className="fi fi-rr-edit"></i> Modifier
												</Link>
												<button
													onClick={() => handleBanToggle(user.id, user.isBanned)}
													className={`text-sm font-medium flex items-center gap-1 ${
														user.isBanned
															? "text-green-600 hover:text-green-800"
															: "text-orange-600 hover:text-orange-800"
													}`}
												>
													{user.isBanned ? (
														<><i className="fi fi-rr-unlock"></i> Débannir</>
													) : (
														<><i className="fi fi-rr-ban"></i> Bannir</>
													)}
												</button>
												<button
													onClick={() => setDeleteModal({ show: true, user })}
													className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
												>
													<i className="fi fi-rr-trash"></i> Supprimer
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{users.length === 0 && (
						<div className="text-center py-8 text-gray-500">
							<p>Aucun utilisateur trouvé</p>
						</div>
					)}
				</div>

				{/* Statistiques */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
					<div className="bg-white rounded-lg shadow-lg p-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-purple-600">
								{users.length}
							</div>
							<div className="text-gray-600">Total Utilisateurs</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-lg p-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600">
								{users.filter((u) => u.role === "client").length}
							</div>
							<div className="text-gray-600">Clients</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-lg p-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-green-600">
								{users.filter((u) => u.role === "advisor").length}
							</div>
							<div className="text-gray-600">Conseillers</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-lg p-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-red-600">
								{users.filter((u) => u.isBanned).length}
							</div>
							<div className="text-gray-600">Bannis</div>
						</div>
					</div>
				</div>
			</div>

			{/* Modal de confirmation de suppression */}
			{deleteModal.show && (
				<div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Confirmer la suppression
						</h3>
						<p className="text-gray-700 mb-6">
							Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
							<strong>{deleteModal.user?.fullName}</strong> ? Cette action est
							irréversible.
						</p>
						<div className="flex justify-end space-x-4">
							<button
								onClick={() => setDeleteModal({ show: false, user: null })}
								className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
							>
								Annuler
							</button>
							<button
								onClick={handleDelete}
								className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
							>
								Supprimer
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}