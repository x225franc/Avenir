"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../components/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { newsService, News } from "../../../components/lib/api/news.service";
import '@flaticon/flaticon-uicons/css/all/all.css';

/**
 * Dashboard pour les directeurs
 */
export default function AdminDashboard() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [news, setNews] = useState<News[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!authLoading && user?.role === "director") {
			loadNews();
		}
	}, [authLoading, user]);

	const loadNews = async () => {
		try {
			setLoading(true);
			// Charger toutes les actualités (pas seulement les publiées)
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

	const handleLogout = () => {
		localStorage.removeItem("token");
		router.push("/admin/login");
	};

	if (loading || authLoading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
					<p className='mt-4 text-gray-600'>Chargement...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-linear-to-br from-purple-50 to-purple-100'>


			{/* Main Content */}
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Welcome Section */}
				<div className='bg-linear-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 text-white mb-8'>
					<h2 className='text-3xl font-bold mb-2'>
						Bienvenue, {user?.firstName} !
					</h2>
					<p className='text-purple-100'>
						Gérez votre banque, vos équipes et supervisez toutes les opérations
					</p>
				</div>

				{/* Quick Actions */}
				<div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-8'>
					<a
						href='/admin/users'
						className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
					>
						<div className='flex items-center justify-between mb-4'>
							<div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
								<i className="fi fi-rr-users text-2xl text-purple-600"></i>
							</div>
						</div>
						<h3 className='text-lg font-semibold text-gray-900 mb-1'>
							Utilisateurs
						</h3>
						<p className='text-sm text-gray-600'>
							Gérer clients & conseillers
						</p>
					</a>

					<a
						href='/admin/news'
						className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
					>
						<div className='flex items-center justify-between mb-4'>
							<div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
								<i className="fi fi-rr-newspaper text-2xl text-purple-600"></i>
							</div>
							{/* <span className='text-2xl font-bold text-gray-900'>
								{news.length}
							</span> */}
						</div>
						<h3 className='text-lg font-semibold text-gray-900 mb-1'>
							Actualités
						</h3>
						<p className='text-sm text-gray-600'>
							Superviser toutes les actualités
						</p>
					</a>

				<a
					href='/admin/savings'
					className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
				>
					<div className='flex items-center justify-between mb-4'>
						<div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
							<i className="fi fi-rr-chart-pie text-2xl text-purple-600"></i>
						</div>
					</div>
					<h3 className='text-lg font-semibold text-gray-900 mb-1'>
						Epargnes
					</h3>
					<p className='text-sm text-gray-600'>Gérer les taux d&apos;épargne</p>
				</a>
				
				<a
					href='/admin/investments'
					className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
				>
					<div className='flex items-center justify-between mb-4'>
						<div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
							<i className="fi fi-rr-chart-line-up text-2xl text-purple-600"></i>
						</div>
					</div>
					<h3 className='text-lg font-semibold text-gray-900 mb-1'>
						Actions
					</h3>
					<p className='text-sm text-gray-600'>Gérer les actions boursières</p>
				</a>

				<a
					href='/admin/internal-chat'
					className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
				>
					<div className='flex items-center justify-between mb-4'>
						<div className='w-12 h-12 bg-linear-to-br from-purple-200 to-purple-400 rounded-lg flex items-center justify-center'>
							<i className="fi fi-rr-comments text-purple-700 text-2xl"></i>
						</div>
					</div>
					<h3 className='text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2'>
						Chat Interne
					</h3>
					<p className='text-sm text-gray-600'>Communication équipe</p>
				</a>
				</div>

				{/* Recent News */}
				<div className='bg-white rounded-xl shadow-md p-6'>
					<div className='flex items-center justify-between mb-6'>
						<h3 className='text-xl font-bold text-gray-900'>
							Actualités récentes
						</h3>
						<a
							href='/admin/news'
							className='text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1'
						>
							Voir tout
							<i className="fi fi-rr-angle-right"></i>
						</a>
					</div>

					{error && (
						<div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
							<p className='text-red-800'>{error}</p>
						</div>
					)}

					{news.length === 0 ? (
						<div className='text-center py-12'>
							<i className="fi fi-rr-newspaper mx-auto text-6xl text-gray-400"></i>
							<p className='mt-2 text-sm text-gray-600'>
								Aucune actualité pour le moment
							</p>
							<a
								href='/admin/news/create'
								className='mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition'
							>
								Créer une actualité
							</a>
						</div>
					) : (
						<div className='space-y-4'>
							{news.slice(0, 5).map((item) => (
								<div
									key={item.id}
									className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition'
								>
									<div className='flex items-start justify-between'>
										<div className='flex-1'>
											<div className='flex items-center gap-2 mb-2'>
												<h4 className='font-semibold text-gray-900'>
													{item.title}
												</h4>
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
											{/* Author name and role */}
											<div className='text-xs text-gray-500 mb-1'>
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
											<p className='text-sm text-gray-600 line-clamp-2 mb-2'>
												{item.content}
											</p>
											<p className='text-xs text-gray-500'>
												{new Date(item.createdAt).toLocaleDateString("fr-FR", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})}
											</p>
										</div>
										<a
											href={`/admin/news/${item.id}`}
											className='ml-4 text-purple-600 hover:text-purple-700'
										>
											<i className="fi fi-rr-angle-right"></i>
										</a>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
