"use client";

import { useState, useEffect } from "react";
import { userService, User } from "../../../components/lib/api/user.service";
import { useClientMetadata } from "@/components/lib/seo";
import '@flaticon/flaticon-uicons/css/all/all.css';

export default function AdvisorClientsPage() {
	const [clients, setClients] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [showNotificationModal, setShowNotificationModal] = useState(false);
	const [selectedClient, setSelectedClient] = useState<User | null>(null);
	const [notificationSubject, setNotificationSubject] = useState("");
	const [notificationMessage, setNotificationMessage] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [notificationSuccess, setNotificationSuccess] = useState(false);

	useClientMetadata("/advisor/clients");

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

	const handleOpenNotificationModal = (client: User) => {
		setSelectedClient(client);
		setNotificationSubject("");
		setNotificationMessage("");
		setNotificationSuccess(false);
		setShowNotificationModal(true);
	};

	const handleCloseNotificationModal = () => {
		setShowNotificationModal(false);
		setSelectedClient(null);
		setNotificationSubject("");
		setNotificationMessage("");
		setNotificationSuccess(false);
	};

	const handleSendNotification = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedClient || !notificationSubject.trim() || !notificationMessage.trim()) return;

		setIsSending(true);
		try {
			const response = await fetch("http://localhost:3001/api/advisor/notify-client", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					clientId: selectedClient.id,
					subject: notificationSubject,
					message: notificationMessage,
				}),
			});

			const data = await response.json();
			if (data.success) {
				setNotificationSuccess(true);
				setTimeout(() => {
					handleCloseNotificationModal();
				}, 2000);
			} else {
				alert(data.error || "Erreur lors de l'envoi");
			}
		} catch (error) {
			alert("Erreur réseau lors de l'envoi de la notification");
		} finally {
			setIsSending(false);
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
			<div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 p-8">
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
		<div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 p-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-green-900 flex items-center gap-2">
								<i className="fi fi-rr-users"></i>
								Liste des Clients
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
							<label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
								<i className="fi fi-rr-search"></i>
								Rechercher un client
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
									<th className="px-6 py-4 text-left">Actions</th>
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
												{client.role === "director" && "Directeur"}
												{client.role === "advisor" && "Conseiller"}
												{client.role === "client" && "Client"}
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="space-y-1">
												{client.isBanned ? (
													<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
														<i className="fi fi-rr-ban"></i>
														Banni
													</span>
												) : (
													<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
														<i className="fi fi-rr-check-circle"></i>
														Actif
													</span>
												)}
												{client.emailVerified ? (
													<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
														<i className="fi fi-rr-envelope-marker"></i>
														Vérifié
													</span>
												) : (
													<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
														<i className="fi fi-rr-exclamation"></i>
														Non vérifié
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
										<td className="px-6 py-4">
											<button
												onClick={() => handleOpenNotificationModal(client)}
												className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
												title="Envoyer une notification par email"
											>
												<i className="fi fi-rr-envelope"></i>
												Notifier
											</button>
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

				{/* Notification Modal */}
				{showNotificationModal && selectedClient && (
					<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6 border-b border-gray-200">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
											<i className="fi fi-rr-envelope text-green-600"></i>
											Envoyer une notification
										</h3>
										<p className="text-gray-600 mt-1">
											Destinataire : <span className="font-semibold">{selectedClient.fullName}</span>
										</p>
										<p className="text-sm text-gray-500">{selectedClient.email}</p>
									</div>
									<button
										onClick={handleCloseNotificationModal}
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										<i className="fi fi-rr-cross-circle text-2xl"></i>
									</button>
								</div>
							</div>

							{notificationSuccess ? (
								<div className="p-8 text-center">
									<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
										<i className="fi fi-rr-check-circle text-3xl text-green-600"></i>
									</div>
									<h4 className="text-xl font-bold text-gray-900 mb-2">Notification envoyée !</h4>
									<p className="text-gray-600">Le client recevra votre message par email.</p>
								</div>
							) : (
								<form onSubmit={handleSendNotification} className="p-6 space-y-6">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Objet de la notification
										</label>
										<input
											type="text"
											value={notificationSubject}
											onChange={(e) => setNotificationSubject(e.target.value)}
											placeholder="Ex: Mise à jour importante de votre compte"
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											required
											disabled={isSending}
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Message personnalisé
										</label>
										<textarea
											value={notificationMessage}
											onChange={(e) => setNotificationMessage(e.target.value)}
											placeholder="Rédigez votre message personnalisé pour le client..."
											rows={8}
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
											required
											disabled={isSending}
										/>
										<p className="text-xs text-gray-500 mt-1">
											Le client recevra ce message directement par email.
										</p>
									</div>

									<div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
										<button
											type="button"
											onClick={handleCloseNotificationModal}
											className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
											disabled={isSending}
										>
											Annuler
										</button>
										<button
											type="submit"
											disabled={isSending || !notificationSubject.trim() || !notificationMessage.trim()}
											className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
										>
											{isSending ? (
												<>
													<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
													Envoi en cours...
												</>
											) : (
												<>
													<i className="fi fi-rr-paper-plane"></i>
													Envoyer la notification
												</>
											)}
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				)}

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
				<div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
					<h4 className="font-medium text-green-900 mb-1"><i className="fi fi-rr-info"></i> Information</h4>
					<p className="text-sm text-green-800">
						Cette vue est en <strong>lecture seule</strong>. En tant que conseiller, vous pouvez consulter les informations des clients 
						mais ne pouvez pas les modifier. Pour toute modification, contactez un administrateur.
					</p>
				</div>
			</div>
		</div>
	);
}