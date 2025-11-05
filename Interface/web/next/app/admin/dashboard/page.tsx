"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../components/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { newsService, News } from "../../../components/lib/api/news.service";

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
		<div className='min-h-screen bg-gradient-to-br from-purple-50 to-purple-100'>


			{/* Main Content */}
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Welcome Section */}
				<div className='bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 text-white mb-8'>
					<h2 className='text-3xl font-bold mb-2'>
						Bienvenue, {user?.firstName} !
					</h2>
					<p className='text-purple-100'>
						Gérez votre banque, vos équipes et supervisez toutes les opérations
					</p>
				</div>

				{/* Quick Actions */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
					<a
						href='/admin/news'
						className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
					>
						<div className='flex items-center justify-between mb-4'>
							<div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
								<svg
									className='w-6 h-6 text-purple-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
									/>
								</svg>
							</div>
							<span className='text-2xl font-bold text-gray-900'>
								{news.length}
							</span>
						</div>
						<h3 className='text-lg font-semibold text-gray-900 mb-1'>
							Actualités
						</h3>
						<p className='text-sm text-gray-600'>
							Superviser toutes les actualités
						</p>
					</a>

					<div className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'>
						<div className='flex items-center justify-between mb-4'>
							<div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
								<svg
									className='w-6 h-6 text-purple-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
									/>
								</svg>
							</div>
						</div>
						<h3 className='text-lg font-semibold text-gray-900 mb-1'>
							Utilisateurs
						</h3>
						<p className='text-sm text-gray-600'>Gérer clients & conseillers</p>
					</div>

				<a
					href='/admin/savings'
					className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
				>
					<div className='flex items-center justify-between mb-4'>
						<div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
							<svg
								className='w-6 h-6 text-purple-600'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
								/>
							</svg>
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
							<svg
								className='w-6 h-6 text-purple-600'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
								/>
							</svg>
						</div>
					</div>
					<h3 className='text-lg font-semibold text-gray-900 mb-1'>
						Actions
					</h3>
					<p className='text-sm text-gray-600'>Gérer les actions boursières</p>
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
							className='text-purple-600 hover:text-purple-700 font-medium flex items-center'
						>
							Voir tout
							<svg
								className='w-5 h-5 ml-1'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M9 5l7 7-7 7'
								/>
							</svg>
						</a>
					</div>

					{error && (
						<div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
							<p className='text-red-800'>{error}</p>
						</div>
					)}

					{news.length === 0 ? (
						<div className='text-center py-12'>
							<svg
								className='mx-auto h-12 w-12 text-gray-400'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
								/>
							</svg>
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
											<svg
												className='w-5 h-5'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M9 5l7 7-7 7'
												/>
											</svg>
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
