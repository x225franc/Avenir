"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "../components/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import { useUiShell } from "./contexts/UiShellContext";

interface LayoutWrapperProps {
	children: React.ReactNode;
}

// Configuration des pages avec layout et permissions
const pageConfig: Record<
	string,
	{ 
		showHeader: boolean; 
		showFooter: boolean; 
		allowedRoles?: string[]; // Si undefined = route publique
	}
> = {
	// Pages publiques (pas de allowedRoles = accès libre)
	"/": { showHeader: true, showFooter: true },
	"/login": { showHeader: false, showFooter: false },
	"/register": { showHeader: false, showFooter: false },
	"/verify-email": { showHeader: false, showFooter: false },
	"/forgot-password": { showHeader: false, showFooter: false },
	"/reset-password": { showHeader: false, showFooter: false },
	"/admin/login": { showHeader: false, showFooter: false },
	"/admin/register": { showHeader: false, showFooter: false },
	"/advisor/login": { showHeader: false, showFooter: false },
	"/advisor/register": { showHeader: false, showFooter: false },

	// Routes client
	"/dashboard": { showHeader: true, showFooter: false, allowedRoles: ["client"] },
	"/accounts": { showHeader: true, showFooter: false, allowedRoles: ["client"] },
	"/transfers": { showHeader: true, showFooter: false, allowedRoles: ["client"] },
	"/investment": { showHeader: true, showFooter: false, allowedRoles: ["client"] },
	"/investment/stocks": { showHeader: true, showFooter: false, allowedRoles: ["client"] },
	"/investment/portfolio": { showHeader: true, showFooter: false, allowedRoles: ["client"] },
	"/investment/orders": { showHeader: true, showFooter: false, allowedRoles: ["client"] },
	"/news": { showHeader: true, showFooter: false, allowedRoles: ["client"] },
	"/messages": { showHeader: true, showFooter: false, allowedRoles: ["client"] },

	// Routes admin
	"/admin/dashboard": { showHeader: true, showFooter: false, allowedRoles: ["director"] },
	"/admin/users": { showHeader: true, showFooter: false, allowedRoles: ["director"] },
	"/admin/users/create": { showHeader: true, showFooter: false, allowedRoles: ["director"] },
	"/admin/news": { showHeader: true, showFooter: false, allowedRoles: ["director"] },
	"/admin/news/create": { showHeader: true, showFooter: false, allowedRoles: ["director"] },
	"/admin/savings": { showHeader: true, showFooter: false, allowedRoles: ["director"] },
	"/admin/investment": { showHeader: true, showFooter: false, allowedRoles: ["director"] },

	// Routes conseiller
	"/advisor/dashboard": { showHeader: true, showFooter: false, allowedRoles: ["advisor"] },
	"/advisor/clients": { showHeader: true, showFooter: false, allowedRoles: ["advisor"] },
	"/advisor/transactions": { showHeader: true, showFooter: false, allowedRoles: ["advisor"] },
	"/advisor/news": { showHeader: true, showFooter: false, allowedRoles: ["advisor"] },
	"/advisor/news/create": { showHeader: true, showFooter: false, allowedRoles: ["advisor"] },
	"/advisor/appointments": { showHeader: true, showFooter: false, allowedRoles: ["advisor"] },
	"/advisor/messages": { showHeader: true, showFooter: false, allowedRoles: ["advisor"] },
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
	const pathname = usePathname();
	const { user, loading } = useAuth();
	const router = useRouter();
    const { showHeader, showFooter, setVisibility, resetVisibility } = useUiShell();

	// Fonction pour déterminer la configuration d'affichage
	const getConfig = () => {
		// Configuration exacte
		if (pageConfig[pathname]) {
			return pageConfig[pathname];
		}

		// Routes dynamiques du dashboard et investment (client)
		if (pathname.startsWith("/dashboard") || pathname.startsWith("/investment")) {
			return { showHeader: true, showFooter: false, allowedRoles: ["client"] };
		}

		// Routes admin dynamiques
		if (pathname.startsWith("/admin")) {
			return { showHeader: true, showFooter: false, allowedRoles: ["director"] };
		}

		// Routes advisor dynamiques
		if (pathname.startsWith("/advisor")) {
			return { showHeader: true, showFooter: false, allowedRoles: ["advisor"] };
		}

		// Par défaut: route publique avec header et footer
		return { showHeader: true, showFooter: true };
	};

	const config = getConfig();

	// Fonction pour vérifier l'accès à la route
	const checkRouteAccess = () => {
		// Si on est encore en train de charger, on attend
		if (loading) return;

		// Obtenir la configuration de la route actuelle
		const config = getConfig();

		// Si pas de rôles requis, c'est une route publique
		if (!config.allowedRoles) return;

		// Si pas d'utilisateur connecté sur une route protégée
		if (!user) {
			// Rediriger vers la page de connexion appropriée selon la route
			if (pathname.startsWith("/admin")) {
				router.push("/admin/login");
			} else if (pathname.startsWith("/advisor")) {
				router.push("/advisor/login");
			} else {
				router.push("/login");
			}
			return;
		}

		// Vérifier l'accès basé sur le rôle
		if (!config.allowedRoles.includes(user.role)) {
			// Rediriger vers le dashboard approprié selon le rôle
			switch (user.role) {
				case "director":
					router.push("/admin/dashboard");
					break;
				case "advisor":
					router.push("/advisor/dashboard");
					break;
				case "client":
					router.push("/dashboard");
					break;
				default:
					router.push("/login");
			}
			return;
		}
	};

	// Vérifier l'accès à chaque changement de route ou d'utilisateur
	useEffect(() => {
		checkRouteAccess();
	}, [pathname, user, loading]);

	// Synchronise la visibilité calculée avec le contexte global (toujours appelé)
	useEffect(() => {
		setVisibility({ showHeader: config.showHeader, showFooter: config.showFooter });
		return () => {
			resetVisibility();
		};
	}, [config.showHeader, config.showFooter, setVisibility, resetVisibility]);

	// Si on est en train de charger, afficher un loader
	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Chargement...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			{showHeader && <Header />}
			<main className={showHeader ? "" : ""}>{children}</main>
			{showFooter && <Footer />}
		</>
	);
}

