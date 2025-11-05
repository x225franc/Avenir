"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../components/contexts/AuthContext";
import { useState } from "react";

export default function Header() {
	const pathname = usePathname();
	const { user, logout } = useAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleLogout = () => {
		logout();
		setIsMenuOpen(false);
	};

	// Configuration de navigation selon le rôle
	const getNavigationConfig = () => {
		if (!user) return null;

		switch (user.role) {
			case 'director':
				return {
					dashboardPath: '/admin/dashboard',
					title: 'Administration',
					color: 'purple',
					links: [
						{ href: '/admin/dashboard', label: 'Accueil', icon: '👔' },
						{ href: '/admin/users', label: 'Utilisateurs', icon: '👥' },
						{ href: '/admin/news', label: 'Actualités', icon: '📰' },
						{ href: '/admin/savings', label: 'Epargne', icon: '📊' },
						{ href: '/admin/investments', label: 'Actions', icon: '📈' },
					]
				};
			case 'advisor':
				return {
					dashboardPath: '/advisor/dashboard',
					title: 'Conseiller',
					color: 'green',
					links: [
						{ href: '/advisor/dashboard', label: 'Accueil', icon: '💼' },
						{ href: '/advisor/clients', label: 'Clients', icon: '👥' },
						{ href: '/advisor/transactions', label: 'Transactions', icon: '💳' },
						{ href: '/advisor/news', label: 'Actualités', icon: '📰' },
						{ href: '/advisor/messages', label: 'Messages', icon: '💬' },
					]
				};
			default: // client
				return {
					dashboardPath: '/dashboard',
					title: 'Client',
					color: 'blue',
					links: [
						{ href: '/dashboard', label: 'Accueil', icon: '🏠' },
						{ href: '/dashboard/accounts', label: 'Mes comptes', icon: '💳' },
						{ href: '/dashboard/transfers', label: 'Virements', icon: '💸' },
						{ href: '/investment', label: 'Actions', icon: '📈' },
						{ href: '/news', label: 'Actualités', icon: '📰' },
					]
				};
		}
	};

	const navConfig = getNavigationConfig();

	return (
		<header className="bg-white shadow-md sticky top-0 z-50">
			<nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link
						href={navConfig?.dashboardPath || (user ? "/dashboard" : "/")}
						className="flex items-center space-x-3"
					>
						<div
							className={`w-10 h-10 bg-gradient-to-r ${
								navConfig?.color === "purple"
									? "from-purple-600 to-purple-800"
									: navConfig?.color === "green"
									? "from-green-600 to-green-800"
									: "from-blue-600 to-blue-800"
							} rounded-lg flex items-center justify-center`}
						>
							<span className="text-white font-bold text-xl">A</span>
						</div>
						<div className="flex flex-col justify-center">
							<span className="text-xl font-bold text-gray-900 leading-tight">AVENIR</span>
							{navConfig?.title && (
								<div
									className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
										navConfig?.color === "purple"
											? "bg-purple-100 text-purple-800"
											: navConfig?.color === "green"
											? "bg-green-100 text-green-800"
											: "bg-blue-100 text-blue-800"
									}`}
								>
									{navConfig?.title}
								</div>
							)}
						</div>
					</Link>
					{/* Navigation Links (desktop) */}
					<div className="hidden md:flex items-center space-x-8">
						{user && navConfig ? (
							<>
								{navConfig.links.map((link: any) => {
									const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
									const activeColorClass = 
										navConfig.color === 'purple' ? 'text-purple-600' :
										navConfig.color === 'green' ? 'text-green-600' :
										'text-blue-600';
									const hoverColorClass = 
										navConfig.color === 'purple' ? 'hover:text-purple-600' :
										navConfig.color === 'green' ? 'hover:text-green-600' :
										'hover:text-blue-600';
									
									return (
										<Link
											key={link.href}
											href={link.href}
											className={`text-gray-700 ${hoverColorClass} transition font-medium flex items-center space-x-1 ${
												isActive ? activeColorClass : ""
											}`}
										>
											<span>{link.icon}</span>
											<span>{link.label}</span>
										</Link>
									);
								})}
								<div className="flex items-center space-x-4">
									<div className="text-sm text-gray-600">
										
										<div>
											Bienvenue <b>{user.lastName}</b>
										</div>
									</div>
									<button
										onClick={handleLogout}
										className={`px-4 py-2 text-white rounded-lg transition font-medium ${
											navConfig.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
											navConfig.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
											'bg-blue-600 hover:bg-blue-700'
										}`}
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
						{user && navConfig ? (
							<>
								{navConfig.links.map((link: any) => {
									const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
									const activeColorClass = 
										navConfig.color === 'purple' ? 'text-purple-600' :
										navConfig.color === 'green' ? 'text-green-600' :
										'text-blue-600';
									const hoverColorClass = 
										navConfig.color === 'purple' ? 'hover:text-purple-600' :
										navConfig.color === 'green' ? 'hover:text-green-600' :
										'hover:text-blue-600';
									
									return (
										<Link
											key={link.href}
											href={link.href}
											onClick={() => setIsMenuOpen(false)}
											className={`block text-gray-700 ${hoverColorClass} font-medium flex items-center space-x-2 ${
												isActive ? activeColorClass : ""
											}`}
										>
											<span>{link.icon}</span>
											<span>{link.label}</span>
										</Link>
									);
								})}

								<div className="pt-3 border-t border-gray-200">
									<div className="text-sm text-gray-600 mb-3">
										Bienvenue <b>{user.lastName}</b>
									</div>
									<button
										onClick={handleLogout}
										className={`w-full px-4 py-2 text-white rounded-lg transition font-medium ${
											navConfig.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
											navConfig.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
											'bg-blue-600 hover:bg-blue-700'
										}`}
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
