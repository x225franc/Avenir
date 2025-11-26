"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../components/contexts/AuthContext";
import { newsService, News, UpdateNewsDTO } from "../../../../components/lib/api/news.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import '@flaticon/flaticon-uicons/css/all/all.css';

interface EditAdminNewsPageProps {
	params: {
		id: string;
	};
}

/**
 * Page d'édition d'actualité pour les directeurs
 */
export default function EditAdminNewsPage({ params }: EditAdminNewsPageProps) {
	const { user } = useAuth();
	const router = useRouter();
	const [news, setNews] = useState<News | null>(null);
	const [formData, setFormData] = useState<UpdateNewsDTO>({
		title: "",
		content: "",
		published: false,
	});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadNews();
	}, [params.id]);

	const loadNews = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await newsService.getById(params.id);
			
			if (response.success && response.data) {
				setNews(response.data);
				setFormData({
					title: response.data.title,
					content: response.data.content,
					published: response.data.published,
				});
			} else {
				setError(response.message || "Actualité introuvable");
			}
		} catch (err) {
			console.error("Erreur lors du chargement:", err);
			setError("Une erreur inattendue s'est produite");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
		e.preventDefault();
		setError(null);
		setSaving(true);

		try {
			const dataToSubmit = {
				...formData,
				published: publish !== undefined ? publish : formData.published,
			};

			const response = await newsService.update(params.id, dataToSubmit);

			if (response.success) {
				router.push("/admin/news");
			} else {
				setError(response.message || "Erreur lors de la mise à jour");
			}
		} catch (err) {
			console.error("Erreur lors de la mise à jour:", err);
			setError("Une erreur inattendue s'est produite");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Chargement de l'actualité...</p>
				</div>
			</div>
		);
	}

	if (error && !news) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
				<div className="text-center">
					<i className="fi fi-rr-exclamation mx-auto text-6xl text-gray-400"></i>
					<h3 className="mt-2 text-sm font-medium text-gray-900">Actualité introuvable</h3>
					<p className="mt-1 text-sm text-gray-500">{error}</p>
					<div className="mt-6">
						<Link
							href="/admin/news"
							className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
						>
							Retour aux actualités
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 text-white mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">Modifier l'Actualité (Admin)</h1>
							<p className="text-purple-100">
								Mettez à jour cette actualité officielle
							</p>
							{news && (
								<div className="flex items-center mt-2 space-x-4 text-sm text-purple-100">
									<span>
										Créée le {new Date(news.createdAt).toLocaleDateString("fr-FR")}
									</span>
									{news.updatedAt !== news.createdAt && (
										<span>
											Modifiée le {new Date(news.updatedAt).toLocaleDateString("fr-FR")}
										</span>
									)}
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${
											news.published
												? "bg-green-100 text-green-800"
												: "bg-white text-gray-800"
										}`}
									>
										{news.published ? "Publiée" : "Brouillon"}
									</span>
								</div>
							)}
						</div>
						<Link
							href="/admin/news"
							className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2"
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
							<span>Retour</span>
						</Link>
					</div>
				</div>

				{/* Form */}
				<div className="bg-white rounded-lg shadow-md p-8">
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
						<div className="flex items-center">
							<i className="fi fi-rr-exclamation text-xl text-red-600 mr-2"></i>
							<p className="text-red-800">{error}</p>
						</div>
					</div>
				)}					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Title */}
						<div>
							<label
								htmlFor="title"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Titre de l'actualité <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="title"
								name="title"
								value={formData.title}
								onChange={handleInputChange}
								required
								maxLength={255}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
								placeholder="Entrez le titre de l'actualité..."
							/>
						</div>

						{/* Content */}
						<div>
							<label
								htmlFor="content"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Contenu <span className="text-red-500">*</span>
							</label>
							<textarea
								id="content"
								name="content"
								value={formData.content}
								onChange={handleInputChange}
								required
								rows={12}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-vertical"
								placeholder="Rédigez le contenu de votre actualité..."
							/>
						</div>

						{/* Actions */}
						<div className="flex items-center justify-between pt-6 border-t border-gray-200">
							<div className="text-sm text-gray-600">
								<span className="text-red-500">*</span> Champs obligatoires
							</div>
							<div className="flex items-center space-x-4">
								{formData.published ? (
									// Si déjà publié, proposer de dépublier et de sauvegarder
									<>
										<button
											type="button"
											onClick={(e) => handleSubmit(e, false)}
											disabled={saving || !formData.title.trim() || !formData.content.trim()}
											className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
										>
											{saving ? (
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											) : (
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
														d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 01.614-2.025M5.6 6.4A5.999 5.999 0 0112 5c2.454 0 4.614 1.474 5.54 3.599M15 12a3 3 0 11-6 0 3 3 0 016 0z"
													/>
												</svg>
											)}
											<span>Dépublier</span>
										</button>
										<button
											type="submit"
											disabled={saving || !formData.title.trim() || !formData.content.trim()}
											className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
										>
											{saving ? (
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											) : (
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
														d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
													/>
												</svg>
											)}
											<span>Mettre à jour</span>
										</button>
									</>
								) : (
									// Si brouillon, proposer de sauvegarder et de publier
									<>
										<button
											type="submit"
											disabled={saving || !formData.title.trim() || !formData.content.trim()}
											className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
										>
											{saving ? (
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											) : (
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
														d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
													/>
												</svg>
											)}
											<span>Sauvegarder</span>
										</button>
										<button
											type="button"
											onClick={(e) => handleSubmit(e, true)}
											disabled={saving || !formData.title.trim() || !formData.content.trim()}
											className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
										>
											{saving ? (
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											) : (
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
														d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
													/>
												</svg>
											)}
											<span>Publier</span>
										</button>
									</>
								)}
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}