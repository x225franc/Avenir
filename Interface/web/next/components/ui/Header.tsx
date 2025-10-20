"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../src/contexts/AuthContext";
import { useState } from "react";

export default function Header() {
	const pathname = usePathname();
	const { user, logout } = useAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleLogout = () => {
		logout();
		setIsMenuOpen(false);
	};

	return (
		<header className="bg-white shadow-md sticky top-0 z-50">
			<nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link
						href={user ? "/dashboard" : "/"}
						className="flex items-center space-x-2"
					>
						<div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-xl">A</span>
						</div>
						<span className="text-xl font-bold text-gray-900">
							Banque AVENIR
						</span>
					</Link>

					{/* Navigation Links (desktop) */}
					<div className="hidden md:flex items-center space-x-8">
						{user ? (
							<>
								<Link
									href="/dashboard"
									className={`text-gray-700 hover:text-blue-600 transition font-medium ${
										pathname === "/dashboard" ? "text-blue-600" : ""
									}`}
								>
									Tableau de bord
								</Link>
								<Link
									href="/dashboard/accounts"
									className={`text-gray-700 hover:text-blue-600 transition font-medium ${
										pathname.startsWith("/dashboard/accounts") ? "text-blue-600" : ""
									}`}
								>
									Mes comptes
								</Link>
								<Link
									href="/dashboard/transfers"
									className={`text-gray-700 hover:text-blue-600 transition font-medium ${
										pathname === "/dashboard/transfers" ? "text-blue-600" : ""
									}`}
								>
									Virements
								</Link>
								<Link
									href="/investment"
									className={`text-gray-700 hover:text-blue-600 transition font-medium ${
										pathname.startsWith("/investment") ? "text-blue-600" : ""
									}`}
								>
									Investissements
								</Link>
								<div className="flex items-center space-x-4">
									<span className="text-sm text-gray-600">
										Bienvenue <br />
										<b>{user.lastName}</b>
									</span>
									<button
										onClick={handleLogout}
										className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
									>
										Déconnexion
									</button>
								</div>
							</>
						) : (
							<>
								<Link
									href="/login"
									className="px-4 py-2 text-blue-600 hover:text-blue-700 transition font-medium"
								>
									Se connecter
								</Link>
								<Link
									href="/register"
									className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium"
								>
									Ouvrir un compte
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
					>
						{isMenuOpen ? (
							<svg
								className="w-6 h-6 text-gray-700"
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
						) : (
							<svg
								className="w-6 h-6 text-gray-700"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden mt-2 bg-white rounded-lg shadow-lg p-4 space-y-3">
						{user ? (
							<>
								<Link
									href="/dashboard"
									onClick={() => setIsMenuOpen(false)}
									className={`block text-gray-700 hover:text-blue-600 font-medium ${
										pathname === "/dashboard" ? "text-blue-600" : ""
									}`}
								>
									Tableau de bord
								</Link>
								<Link
									href="/dashboard/accounts"
									onClick={() => setIsMenuOpen(false)}
									className={`block text-gray-700 hover:text-blue-600 font-medium ${
										pathname.startsWith("/dashboard/accounts") ? "text-blue-600" : ""
									}`}
								>
									Mes comptes
								</Link>
								<Link
									href="/dashboard/transfers"
									onClick={() => setIsMenuOpen(false)}
									className={`block text-gray-700 hover:text-blue-600 font-medium ${
										pathname === "/dashboard/transfers" ? "text-blue-600" : ""
									}`}
								>
									Virements
								</Link>
								<Link
									href="/investment"
									onClick={() => setIsMenuOpen(false)}
									className={`block text-gray-700 hover:text-blue-600 font-medium ${
										pathname.startsWith("/investment") ? "text-blue-600" : ""
									}`}
								>
									Investissements
								</Link>

								<div className="pt-3 border-t border-gray-200">
									<span className="block text-sm text-gray-600 mb-2">
										Bienvenue <b>{user.lastName}</b>
									</span>
									<button
										onClick={handleLogout}
										className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
									>
										Déconnexion
									</button>
								</div>
							</>
						) : (
							<>
								<Link
									href="/login"
									onClick={() => setIsMenuOpen(false)}
									className="block px-4 py-2 text-blue-600 hover:text-blue-700 transition font-medium"
								>
									Se connecter
								</Link>
								<Link
									href="/register"
									onClick={() => setIsMenuOpen(false)}
									className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium text-center"
								>
									Ouvrir un compte
								</Link>
							</>
						)}
					</div>
				)}
			</nav>
		</header>
	);
}
