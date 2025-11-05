"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../components/contexts/AuthContext";
import { newsService, News } from "../../../components/lib/api/news.service";
import Link from "next/link";

/**
 * Page de gestion des actualités pour les directeurs
 */
export default function AdminNewsPage() {
	const { user } = useAuth();
	const [news, setNews] = useState<News[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

	useEffect(() => {
		loadNews();
	}, []);

	const loadNews = async () => {
		try {
			setLoading(true);
			setError(null);
			// Charger toutes les actualités (pas seulement publiées)
			const response = await newsService.getAll(false);
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

	const handleDelete = async (id: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer cette actualité ?")) {
			return;
		}

		try {
			const response = await newsService.delete(id);
			if (response.success) {
				setNews((prev) => prev.filter((item) => item.id !== id));
			} else {
				setError(response.message || "Erreur lors de la suppression");
			}
		} catch (err) {
			console.error("Erreur lors de la suppression:", err);
			setError("Une erreur inattendue s'est produite");
		}
	};

	const filteredNews = news.filter((item) => {
		if (filter === "published") return item.published;
		if (filter === "draft") return !item.published;
		return true;
	});

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Chargement des actualités...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 text-white mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">Administration des Actualités</h1>
							<p className="text-purple-100">
								Gérez toutes les actualités de la banque
							</p>
						</div>
						<Link
							href="/admin/news/create"
							className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2"
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
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
							<span>Nouvelle actualité</span>
						</Link>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<div className="flex items-center space-x-4">
						<span className="text-sm font-medium text-gray-700">Filtrer par :</span>
						<div className="flex space-x-2">
							{[
								{ key: "all", label: "Toutes", count: news.length },
								{ key: "published", label: "Publiées", count: news.filter(n => n.published).length },
								{ key: "draft", label: "Brouillons", count: news.filter(n => !n.published).length },
							].map((filterOption) => (
								<button
									key={filterOption.key}
									onClick={() => setFilter(filterOption.key as any)}
									className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
										filter === filterOption.key
											? "bg-purple-600 text-white"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{filterOption.label} ({filterOption.count})
								</button>
							))}
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

				{/* News List */}
				<div className="bg-white rounded-lg shadow-md">
					{filteredNews.length === 0 ? (
						<div className="text-center py-12">
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
								{filter === "all" && "Aucune actualité"}
								{filter === "published" && "Aucune actualité publiée"}
								{filter === "draft" && "Aucun brouillon"}
							</h3>
							<p className="mt-1 text-sm text-gray-500">
								Commencez en créant une nouvelle actualité.
							</p>
							<div className="mt-6">
								<Link
									href="/admin/news/create"
									className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
								>
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 6v6m0 0v6m0-6h6m-6 0H6"
										/>
									</svg>
									Nouvelle actualité
								</Link>
							</div>
						</div>
					) : (
						<div className="divide-y divide-gray-200">
							{filteredNews.map((item) => (
								<div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<h3 className="text-lg font-semibold text-gray-900">
													{item.title}
												</h3>
								<div className="text-xs text-gray-500">
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
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${
														item.published
															? "bg-green-100 text-green-800"
															: "bg-gray-100 text-gray-800"
													}`}
												>
													{item.published ? "Publiée" : "Brouillon"}
												</span>
											</div>
											<p className="text-gray-600 line-clamp-2 mb-3">
												{item.content}
											</p>
											<div className="flex items-center text-sm text-gray-500 space-x-4">
												<span>
													Créée le{" "}
													{new Date(item.createdAt).toLocaleDateString("fr-FR", {
														day: "numeric",
														month: "long",
														year: "numeric",
													})}
												</span>
												{item.updatedAt !== item.createdAt && (
													<span>
														Modifiée le{" "}
														{new Date(item.updatedAt).toLocaleDateString("fr-FR", {
															day: "numeric",
															month: "long",
															year: "numeric",
														})}
													</span>
												)}
											</div>
										</div>
										<div className="flex items-center space-x-2 ml-4">
											<Link
												href={`/admin/news/${item.id}`}
												className="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50 transition-colors"
												title="Modifier"
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
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
											</Link>
											<button
												onClick={() => handleDelete(item.id)}
												className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
												title="Supprimer"
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
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}