"use client";

import React, { useState } from "react";
import { useAuth } from "../../../../components/contexts/AuthContext";
import { newsService, CreateNewsDTO } from "../../../../components/lib/api/news.service";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Page de création d'actualité pour les directeurs
 */
export default function CreateAdminNewsPage() {
	const { user } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState<CreateNewsDTO>({
		title: "",
		content: "",
		published: false,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const dataToSubmit = {
				...formData,
				published: publish,
			};

			const response = await newsService.create(dataToSubmit);

			if (response.success) {
				router.push("/admin/news");
			} else {
				setError(response.message || "Erreur lors de la création de l'actualité");
			}
		} catch (err) {
			console.error("Erreur lors de la création:", err);
			setError("Une erreur inattendue s'est produite");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 text-white mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">Nouvelle Actualité (Admin)</h1>
							<p className="text-purple-100">
								Créez une actualité officielle de la banque
							</p>
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

					<form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
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
							<p className="mt-2 text-sm text-gray-500">
								Rédigez un contenu officiel et informatif pour tous les utilisateurs de la banque.
							</p>
						</div>

						{/* Actions */}
						<div className="flex items-center justify-between pt-6 border-t border-gray-200">
							<div className="text-sm text-gray-600">
								<span className="text-red-500">*</span> Champs obligatoires
							</div>
							<div className="flex items-center space-x-4">
								<button
									type="submit"
									disabled={loading || !formData.title.trim() || !formData.content.trim()}
									className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
								>
									{loading ? (
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
									<span>Enregistrer comme brouillon</span>
								</button>
								<button
									type="button"
									onClick={(e) => handleSubmit(e, true)}
									disabled={loading || !formData.title.trim() || !formData.content.trim()}
									className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
								>
									{loading ? (
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
									<span>Publier l'actualité</span>
								</button>
							</div>
						</div>
					</form>
				</div>

				{/* Help Section */}
				<div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
					<h3 className="text-lg font-semibold text-purple-800 mb-4">
						💼 Conseils pour les actualités administratives
					</h3>
					<ul className="space-y-2 text-purple-700">
						<li className="flex items-start">
							<span className="text-purple-600 mr-2">•</span>
							<span>Utilisez un ton professionnel et officiel</span>
						</li>
						<li className="flex items-start">
							<span className="text-purple-600 mr-2">•</span>
							<span>Mentionnez les impacts sur les clients et conseillers</span>
						</li>
						<li className="flex items-start">
							<span className="text-purple-600 mr-2">•</span>
							<span>Incluez les dates importantes et échéances</span>
						</li>
						<li className="flex items-start">
							<span className="text-purple-600 mr-2">•</span>
							<span>Relisez attentivement avant publication</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}