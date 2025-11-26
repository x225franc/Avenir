"use client";

import React, { useState, useEffect, use } from "react";
import { useAuth } from "../../../../components/contexts/AuthContext";
import { newsService, News, UpdateNewsDTO } from "../../../../components/lib/api/news.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import '@flaticon/flaticon-uicons/css/all/all.css';

interface EditNewsPageProps {
	params: Promise<{
		id: string;
	}>;
}

/**
 * Page d'édition d'actualité pour les conseillers
 */
export default function EditNewsPage({ params }: EditNewsPageProps) {
	const { user } = useAuth();
	const router = useRouter();
	const { id } = use(params);
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
	}, [id]);

	const loadNews = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await newsService.getById(id);
			
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

			const response = await newsService.update(id, dataToSubmit);

			if (response.success) {
				router.push("/advisor/news");
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
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Chargement de l'actualité...</p>
				</div>
			</div>
		);
	}

	if (error && !news) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
				<div className="text-center">
					<i className="fi fi-rr-exclamation mx-auto text-6xl text-gray-400"></i>
					<h3 className="mt-2 text-sm font-medium text-gray-900">Actualité introuvable</h3>
					<p className="mt-1 text-sm text-gray-500">{error}</p>
					<div className="mt-6">
						<Link
							href="/advisor/news"
							className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							Retour aux actualités
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-lg p-8 text-white mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">Modifier l'Actualité</h1>
							<p className="text-green-100">
								Mettez à jour votre actualité
							</p>
							{news && (
								<div className="flex items-center mt-2 space-x-4 text-sm text-green-100">
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
						href="/advisor/news"
						className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center space-x-2"
					>
						<i className="fi fi-rr-arrow-left"></i>
						<span>Retour</span>
					</Link>
				</div>
			</div>				{/* Form */}
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
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical"
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
											<i className="fi fi-rr-eye-crossed"></i>
										)}
										<span>Dépublier</span>
										</button>
										<button
											type="submit"
											disabled={saving || !formData.title.trim() || !formData.content.trim()}
											className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
										>
											{saving ? (
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											) : (
												<i className="fi fi-rr-cloud-upload"></i>
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
												<i className="fi fi-rr-disk"></i>
											)}
											<span>Sauvegarder</span>
										</button>
										<button
											type="button"
											onClick={(e) => handleSubmit(e, true)}
											disabled={saving || !formData.title.trim() || !formData.content.trim()}
											className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
										>
											{saving ? (
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											) : (
												<i className="fi fi-rr-check-circle"></i>
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