"use client";

import React, { useState } from "react";
import { useAuth } from "../../../../components/contexts/AuthContext";
import { newsService, CreateNewsDTO } from "../../../../components/lib/api/news.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useClientMetadata } from "@/components/lib/seo";
import '@flaticon/flaticon-uicons/css/all/all.css';

/**
 * Page de création d'actualité pour les conseillers
 */
export default function CreateNewsPage() {
	const { user } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState<CreateNewsDTO>({
		title: "",
		content: "",
		published: false,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useClientMetadata("/advisor/news");

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
				router.push("/advisor/news");
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
		<div className="min-h-screen bg-linear-to-br from-green-50 to-green-100">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="bg-linear-to-r from-green-600 to-green-800 rounded-xl shadow-lg p-8 text-white mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">Nouvelle Actualité</h1>
							<p className="text-green-100">
								Créez une actualité pour informer vos clients
							</p>
						</div>
						<Link
							href="/advisor/news"
							className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center space-x-2"
						>
							<i className="fi fi-rr-arrow-left"></i>
							<span>Retour</span>
						</Link>
					</div>
				</div>

				{/* Form */}
				<div className="bg-white rounded-lg shadow-md p-8">
					{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
						<div className="flex items-center">
							<i className="fi fi-rr-exclamation text-red-600 text-xl mr-2"></i>
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
							<p className="mt-2 text-sm text-gray-500">
								Rédigez un contenu clair et informatif pour vos clients.
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
										<i className="fi fi-rr-disk"></i>
									)}
									<span>Enregistrer comme brouillon</span>
								</button>
								<button
									type="button"
									onClick={(e) => handleSubmit(e, true)}
									disabled={loading || !formData.title.trim() || !formData.content.trim()}
									className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
								>
									{loading ? (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									) : (
										<i className="fi fi-rr-check-circle"></i>
									)}
									<span>Publier l'actualité</span>
								</button>
							</div>
						</div>
					</form>
				</div>

			</div>
		</div>
	);
}