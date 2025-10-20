"use client";

import { usePathname } from "next/navigation";
import Header from "./ui/Header";
import Footer from "./ui/Footer";

interface LayoutWrapperProps {
	children: React.ReactNode;
}

// Configuration des pages avec/sans header/footer
const pageConfig: Record<
	string,
	{ showHeader: boolean; showFooter: boolean }
> = {
	"/": { showHeader: true, showFooter: true },
	"/login": { showHeader: false, showFooter: false },
	"/register": { showHeader: false, showFooter: false },
	"/verify-email": { showHeader: false, showFooter: false },
	"/forgot-password": { showHeader: false, showFooter: false },
	"/reset-password": { showHeader: false, showFooter: false },
	"/dashboard": { showHeader: true, showFooter: false },
	"/accounts": { showHeader: true, showFooter: false },
	"/transfers": { showHeader: true, showFooter: false },
	"/investment": { showHeader: true, showFooter: false },
	"/investment/stocks": { showHeader: true, showFooter: false },
	"/investment/portfolio": { showHeader: true, showFooter: false },
	"/investment/orders": { showHeader: true, showFooter: false },
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
	const pathname = usePathname();

	// Fonction pour déterminer la configuration
	const getConfig = () => {
		// Configuration exacte
		if (pageConfig[pathname]) {
			return pageConfig[pathname];
		}

		// Routes dynamiques du dashboard et investment (toujours header, pas de footer)
		if (pathname.startsWith("/dashboard") || pathname.startsWith("/investment")) {
			return { showHeader: true, showFooter: false };
		}

		// Par défaut: afficher header et footer
		return { showHeader: true, showFooter: true };
	};

	const config = getConfig();

	return (
		<>
			{config.showHeader && <Header />}
			<main className={config.showHeader ? "" : ""}>{children}</main>
			{config.showFooter && <Footer />}
		</>
	);
}
