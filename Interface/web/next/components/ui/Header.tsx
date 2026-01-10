"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../components/contexts/AuthContext";
import { useState } from "react";
import "@flaticon/flaticon-uicons/css/all/all.css";

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
			case "director":
				return {
					dashboardPath: "/admin/dashboard",
					title: "Administration",
					color: "purple",
					links: [
						// { href: '/admin/dashboard', label: 'Accueil', icon: <i className="fi fi-rr-home"></i> },
						{
							href: "/admin/users",
							label: "Utilisateurs",
							icon: <i className='fi fi-rr-users'></i>,
						},
						{
							href: "/admin/news",
							label: "Actualités",
							icon: <i className='fi fi-rr-newspaper'></i>,
						},
						{
							href: "/admin/savings",
							label: "Epargne",
							icon: <i className='fi fi-rr-chart-pie'></i>,
						},
						{
							href: "/admin/investments",
							label: "Actions",
							icon: <i className='fi fi-rr-chart-line-up'></i>,
						},
						{
							href: "/admin/internal-chat",
							label: "Chat Interne",
							icon: <i className='fi fi-rr-messages'></i>,
						},
					],
				};
			case "advisor":
				return {
					dashboardPath: "/advisor/dashboard",
					title: "Conseiller",
					color: "green",
					links: [
						// { href: '/advisor/dashboard', label: 'Accueil', icon: <i className="fi fi-rr-home"></i> },
						{
							href: "/advisor/clients",
							label: "Clients",
							icon: <i className='fi fi-rr-users'></i>,
						},
						{
							href: "/advisor/credits/grant",
							label: "Crédits",
							icon: <i className='fi fi-rr-hand-holding-usd'></i>,
						},
						{
							href: "/advisor/transactions",
							label: "Transactions",
							icon: <i className='fi fi-rr-credit-card'></i>,
						},
						{
							href: "/advisor/news",
							label: "Actualités",
							icon: <i className='fi fi-rr-newspaper'></i>,
						},
						{
							href: "/advisor/messages",
							label: "Messages",
							icon: <i className='fi fi-rr-comment'></i>,
						},
						{
							href: "/advisor/internal-chat",
							label: "Chat Interne",
							icon: <i className='fi fi-rr-messages'></i>,
						},
					],
				};
			default: // client
				return {
					dashboardPath: "/dashboard",
					title: "Client",
					color: "blue",
					links: [
						// { href: '/dashboard', label: 'Accueil', icon: <i className="fi fi-rr-home"></i> },
						{
							href: "/dashboard/accounts",
							label: "Comptes",
							icon: <i className='fi fi-rr-credit-card'></i>,
						},
						{
							href: "/dashboard/credits",
							label: "Crédits",
							icon: <i className='fi fi-rr-hand-holding-usd'></i>,
						},
						{
							href: "/dashboard/transfers",
							label: "Virements",
							icon: <i className='fi fi-rr-exchange'></i>,
						},
						{
							href: "/investment",
							label: "Actions",
							icon: <i className='fi fi-rr-chart-line-up'></i>,
						},
						{
							href: "/news",
							label: "Actualités",
							icon: <i className='fi fi-rr-newspaper'></i>,
						},
						{
							href: "/messages",
							label: "Messages",
							icon: <i className='fi fi-rr-comment'></i>,
						},
					],
				};
		}
	};

	const navConfig = getNavigationConfig();

	return (
		<header className='bg-white shadow-md sticky top-0 z-50'>
			<nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					<Link
						href={navConfig?.dashboardPath || (user ? "/dashboard" : "/")}
						className='flex items-center space-x-3'
					>
						<div
							className={`w-10 h-10 bg-linear-to-r ${
								navConfig?.color === "purple"
									? "from-purple-600 to-purple-800"
									: navConfig?.color === "green"
									? "from-green-600 to-green-800"
									: "from-blue-600 to-blue-800"
							} rounded-lg flex items-center justify-center`}
						>
							<span className='text-white font-bold text-xl'>
								<img src="/logo.png" alt="AVENIR Logo" className="w-8 h-8" />
							</span>
						</div>
						<div className='flex flex-col justify-center'>
							<span className='text-xl font-bold text-gray-900 leading-tight'>
								AVENIR
							</span>
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
					<div className='hidden lg:flex items-center space-x-8'>
						{user && navConfig ? (
							<>
								{navConfig.links.map((link: any) => {
									const isActive =
										pathname === link.href ||
										pathname.startsWith(link.href + "/");
									const activeColorClass =
										navConfig.color === "purple"
											? "text-purple-600"
											: navConfig.color === "green"
											? "text-green-600"
											: "text-blue-600";
									const hoverColorClass =
										navConfig.color === "purple"
											? "hover:text-purple-600"
											: navConfig.color === "green"
											? "hover:text-green-600"
											: "hover:text-blue-600";

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
								<div>
									<button
										onClick={handleLogout}
										className={`px-4 py-2 text-white rounded-lg transition font-medium whitespace-nowrap ${
											navConfig.color === "purple"
												? "bg-purple-600 hover:bg-purple-700"
												: navConfig.color === "green"
												? "bg-green-600 hover:bg-green-700"
												: "bg-blue-600 hover:bg-blue-700"
										}`}
									>
										Déconnexion
									</button>
								</div>
							</>
						) : (
							<>
								<Link
									href='/login'
									className='px-4 py-2 text-blue-600 hover:text-blue-700 transition font-medium'
								>
									Se connecter
								</Link>
								<Link
									href='/register'
									className='px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium'
								>
									Ouvrir un compte
								</Link>
							</>
						)}
					</div>

					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className='lg:hidden p-2 rounded-lg hover:bg-gray-100 transition'
					>
						{isMenuOpen ? (
							<svg
								className='w-6 h-6 text-gray-700'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						) : (
							<svg
								className='w-6 h-6 text-gray-700'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M4 6h16M4 12h16M4 18h16'
								/>
							</svg>
						)}
					</button>
				</div>

				{isMenuOpen && (
					<div className='lg:hidden border-t border-gray-100 py-4 space-y-3'>
						{user && navConfig ? (
							<>
								{navConfig.links.map((link: any) => {
									const isActive =
										pathname === link.href ||
										pathname.startsWith(link.href + "/");
									const activeColorClass =
										navConfig.color === "purple"
											? "text-purple-600"
											: navConfig.color === "green"
											? "text-green-600"
											: "text-blue-600";
									const hoverColorClass =
										navConfig.color === "purple"
											? "hover:text-purple-600"
											: navConfig.color === "green"
											? "hover:text-green-600"
											: "hover:text-blue-600";

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

								<div className='pt-3 border-t border-gray-200'>
									<div className='text-sm text-gray-600 mb-3'>
										Bienvenue <b>{user.lastName}</b>
									</div>
									<button
										onClick={handleLogout}
										className={`w-full px-4 py-2 text-white rounded-lg transition font-medium ${
											navConfig.color === "purple"
												? "bg-purple-600 hover:bg-purple-700"
												: navConfig.color === "green"
												? "bg-green-600 hover:bg-green-700"
												: "bg-blue-600 hover:bg-blue-700"
										}`}
									>
										Déconnexion
									</button>
								</div>
							</>
						) : (
							<>
								<Link
									href='/login'
									onClick={() => setIsMenuOpen(false)}
									className='block px-4 py-2 text-blue-600 hover:text-blue-700 transition font-medium'
								>
									Se connecter
								</Link>
								<Link
									href='/register'
									onClick={() => setIsMenuOpen(false)}
									className='block px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium text-center'
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
