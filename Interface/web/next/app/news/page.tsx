"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/contexts/AuthContext";
import { newsService, News } from "../../components/lib/api/news.service";

/**
 * Page d'actualités pour les clients (lecture seule)
 */
export default function ClientNewsPage() {
	const { user } = useAuth();
	const [news, setNews] = useState<News[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedNews, setSelectedNews] = useState<News | null>(null);

	useEffect(() => {
		loadNews();
	}, []);

	const loadNews = async () => {
		try {
			setLoading(true);
			setError(null);
			// Charger seulement les actualités publiées pour les clients
			const response = await newsService.getAll(true);
			if (response.success && response.data) {
				setNews(response.data);
			} else {
				setError(response.message || "Erreur lors du chargement des actualités");
			}
		} catch (err) {
			console.error("Erreur lors du chargement des actualités:", err);
			setError("Une erreur inattendue s'est produite");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Chargement des actualités...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">Actualités Banque AVENIR</h1>
							<p className="text-blue-100">
								Restez informé des dernières nouvelles et mises à jour
							</p>
						</div>
						<div className="flex items-center space-x-2">
							<svg
								className="w-8 h-8 text-blue-200"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
								/>
							</svg>
							<span className="text-sm text-blue-200">
								{news.length} actualité{news.length > 1 ? 's' : ''} disponible{news.length > 1 ? 's' : ''}
							</span>
						</div>
					</div>
				</div>

				{/* Error Message */}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
						<div className="flex items-center">
							<svg
								className="w-5 h-5 text-red-600 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
							<p className="text-red-800">{error}</p>
						</div>
					</div>
				)}

				{/* News Grid */}
				{news.length === 0 ? (
					<div className="bg-white rounded-lg shadow-md p-12 text-center">
						<svg
							className="mx-auto h-12 w-12 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
							/>
						</svg>
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							Aucune actualité disponible
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							Les actualités apparaîtront ici dès leur publication.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* News List */}
						<div className="lg:col-span-2 space-y-6">
							{news.map((item, index) => (
								<div
									key={item.id}
									className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
										selectedNews?.id === item.id ? "ring-2 ring-blue-500" : ""
									}`}
									onClick={() => setSelectedNews(item)}
								>
									<div className="p-6">
										<div className="flex items-start justify-between mb-4">
											<div className="flex-1">
												<h2 className="text-xl font-bold text-gray-900 mb-2">
													{item.title}
												</h2>
												<p className="text-gray-600 line-clamp-3">
													{item.content}
												</p>
											</div>
											<div className="ml-4 flex-shrink-0">
												<span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
													Publié
												</span>
											</div>
										</div>
										<div className="text-sm text-gray-500 mb-2">
									{item.authorName ? (
										<span>
										Par {item.authorName}
												{item.authorRole === 'director' ? " (Administrateur)" :
												item.authorRole === 'advisor' ? " (Conseiller)" : ""}
										</span>
									) : (
										<span>Auteur inconnu</span>
									)}
								</div>
										<div className="flex items-center justify-between text-sm text-gray-500">
											<span>
												{new Date(item.createdAt).toLocaleDateString("fr-FR", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})}
											</span>
											{index === 0 && (
												<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
													<svg
														className="w-3 h-3 mr-1"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M13 10V3L4 14h7v7l9-11h-7z"
														/>
													</svg>
													Nouveau
												</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>

						{/* News Detail Sidebar */}
						<div className="lg:col-span-1">
							<div className="sticky top-24">
								{selectedNews ? (
									<div className="bg-white rounded-lg shadow-md p-6">
										<div className="flex items-center justify-between mb-4">
											<h3 className="text-lg font-semibold text-gray-900">
												Détail de l'actualité
											</h3>
											<button
												onClick={() => setSelectedNews(null)}
												className="text-gray-400 hover:text-gray-600 transition-colors"
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
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										</div>
										<div className="space-y-4">
											<div>
												<h4 className="font-bold text-gray-900 text-lg mb-2">
													{selectedNews.title}
												</h4>
										
												<div className="prose prose-sm text-gray-700 max-w-none">
													{selectedNews.content.split('\n').map((paragraph, index) => (
														<p key={index} className="mb-2">
															{paragraph}
														</p>
													))}
												</div>
												<div className="text-sm text-gray-500 mb-2">
											{selectedNews.authorName ? (
												<span>
													Par {selectedNews.authorName}
													{selectedNews.authorRole === 'director' ? " (Administrateur)" :
													selectedNews.authorRole === 'advisor' ? " (Conseiller)" : ""}
												</span>
											) : (
												<span>Auteur inconnu</span>
											)}
										</div>
											</div>
											<div className="pt-4 border-t border-gray-200">
												<div className="flex items-center justify-between text-sm text-gray-500">
													<span>
														Publié le{" "}
														{new Date(selectedNews.createdAt).toLocaleDateString("fr-FR", {
															day: "numeric",
															month: "long",
															year: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														})}
													</span>
												</div>
												{selectedNews.updatedAt !== selectedNews.createdAt && (
													<div className="text-xs text-gray-400 mt-1">
														Mise à jour le{" "}
														{new Date(selectedNews.updatedAt).toLocaleDateString("fr-FR", {
															day: "numeric",
															month: "long",
															year: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														})}
													</div>
												)}
											</div>
										</div>
									</div>
								) : (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
										<svg
											className="mx-auto h-8 w-8 text-blue-400 mb-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<p className="text-blue-700 text-sm">
											Cliquez sur une actualité pour afficher son contenu complet
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}