"use client";

import { useState, useEffect } from "react";
import { userService, User } from "../../../components/lib/api/user.service";

export default function AdvisorClientsPage() {
	const [clients, setClients] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		loadClients();
	}, []);

	const loadClients = async () => {
		try {
			setLoading(true);
			const response = await userService.getAllForAdvisor();
			if (response.success && response.data) {
				setClients(response.data);
			} else {
				setError(response.error || "Erreur lors du chargement des clients");
			}
		} catch (error) {
			setError("Erreur lors du chargement des clients");
		} finally {
			setLoading(false);
		}
	};

	const filteredClients = clients.filter(
		(client) =>
			client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
	);

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
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
				<div className="max-w-6xl mx-auto">
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
						<p className="mt-4 text-green-600">Chargement des clients...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-green-900">
								🏦 Liste des Clients
							</h1>
							<p className="text-green-600 mt-2">
								Consultez les informations des clients (lecture seule)
							</p>
						</div>
						<div className="text-right">
							<div className="text-2xl font-bold text-green-600">
								{filteredClients.length}
							</div>
							<div className="text-sm text-green-500">
								client{filteredClients.length > 1 ? "s" : ""} trouvé{filteredClients.length > 1 ? "s" : ""}
							</div>
						</div>
					</div>
				</div>

				{/* Barre de recherche */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<div className="flex items-center space-x-4">
						<div className="flex-1">
							<label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
								🔍 Rechercher un client
							</label>
							<input
								type="text"
								id="search"
								placeholder="Nom, email ou téléphone..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							/>
						</div>
						{searchTerm && (
							<button
								onClick={() => setSearchTerm("")}
								className="px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
							>
								Effacer
							</button>
						)}
					</div>
				</div>

				{/* Message d'erreur */}
				{error && (
					<div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
						{error}
					</div>
				)}

				{/* Liste des clients */}
				<div className="bg-white rounded-lg shadow-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-green-600 text-white">
								<tr>
									<th className="px-6 py-4 text-left">Client</th>
									<th className="px-6 py-4 text-left">Contact</th>
									<th className="px-6 py-4 text-left">Rôle</th>
									<th className="px-6 py-4 text-left">Statut</th>
									<th className="px-6 py-4 text-left">Membre depuis</th>
									<th className="px-6 py-4 text-left">Adresse</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{filteredClients.map((client) => (
									<tr key={client.id} className="hover:bg-green-50">
										<td className="px-6 py-4">
											<div>
												<div className="font-medium text-gray-900">
													{client.fullName}
												</div>
												<div className="text-sm text-gray-500">
													ID: {client.id.slice(0, 8)}...
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div>
												<div className="text-gray-900">{client.email}</div>
												{client.phone && (
													<div className="text-sm text-gray-500">{client.phone}</div>
												)}
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
													client.role
												)}`}
											>
												{client.role === "director" && "🎯 Directeur"}
												{client.role === "advisor" && "🏦 Conseiller"}
												{client.role === "client" && "👤 Client"}
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="space-y-1">
												{client.isBanned ? (
													<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
														🚫 Banni
													</span>
												) : (
													<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
														✅ Actif
													</span>
												)}
												{client.emailVerified ? (
													<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
														📧 Vérifié
													</span>
												) : (
													<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
														⚠️ Non vérifié
													</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 text-sm text-gray-500">
											{new Date(client.createdAt).toLocaleDateString("fr-FR")}
										</td>
										<td className="px-6 py-4">
											{client.address ? (
												<div className="text-sm text-gray-700 max-w-xs truncate">
													{client.address}
												</div>
											) : (
												<span className="text-gray-400 text-sm">Non renseignée</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{filteredClients.length === 0 && (
						<div className="text-center py-8 text-gray-500">
							{searchTerm ? (
								<>
									<p>Aucun client trouvé pour "{searchTerm}"</p>
									<button
										onClick={() => setSearchTerm("")}
										className="mt-2 text-green-600 hover:text-green-800"
									>
										Afficher tous les clients
									</button>
								</>
							) : (
								<p>Aucun client disponible</p>
							)}
						</div>
					)}
				</div>

				{/* Statistiques */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
					<div className="bg-white rounded-lg shadow-lg p-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-green-600">
								{clients.length}
							</div>
							<div className="text-gray-600">Total Clients</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-lg p-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600">
								{clients.filter((c) => c.role === "client").length}
							</div>
							<div className="text-gray-600">Clients Particuliers</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-lg p-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-emerald-600">
								{clients.filter((c) => c.emailVerified).length}
							</div>
							<div className="text-gray-600">Emails Vérifiés</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-lg p-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-red-600">
								{clients.filter((c) => c.isBanned).length}
							</div>
							<div className="text-gray-600">Comptes Suspendus</div>
						</div>
					</div>
				</div>

				{/* Information importante */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
					<h4 className="font-medium text-blue-900 mb-2">ℹ️ Information</h4>
					<p className="text-sm text-blue-800">
						Cette vue est en <strong>lecture seule</strong>. En tant que conseiller, vous pouvez consulter les informations des clients 
						mais ne pouvez pas les modifier. Pour toute modification, contactez un administrateur.
					</p>
				</div>
			</div>
		</div>
	);
}