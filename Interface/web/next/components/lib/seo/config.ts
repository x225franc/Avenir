import { Metadata } from "next";

/**
 * Configuration centralisée des métadonnées SEO pour toutes les pages
 */

export interface PageMetadata {
	title: string;
	description: string;
	keywords?: string[];
	openGraph?: {
		title?: string;
		description?: string;
		images?: string[];
	};
}

/**
 * Métadonnées par route
 */
export const pagesMetadata: Record<string, PageMetadata> = {
	// Page d'accueil
	// "/home": {
	// 	title: "AVENIR - Votre banque moderne et innovante",
	// 	description:
	// 		"Gérez vos liquidités, épargne et investissements avec AVENIR. Une banque moderne qui place vos intérêts au cœur de ses priorités.",
	// 	keywords: [
	// 		"banque en ligne",
	// 		"compte bancaire",
	// 		"épargne",
	// 		"investissement",
	// 		"actions",
	// 		"crédit",
	// 		"AVENIR",
	// 	],
	// 	openGraph: {
	// 		title: "AVENIR - Votre banque moderne et innovante",
	// 		description:
	// 			"Gérez vos liquidités, épargne et investissements avec AVENIR.",
	// 		images: ["/og-image.jpg"],
	// 	},
	// },

    // error pages
    "/error": {
		title: "Erreur Serveur - AVENIR",
		description: "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
	},

    "/not-found": {
        title: "Page Non Trouvée - AVENIR",
        description: "La page que vous recherchez n'existe pas.",
    },

	// Authentification
	"/login": {
		title: "Connexion - AVENIR",
		description:
			"Connectez-vous à votre espace client AVENIR pour gérer vos comptes, votre épargne et vos investissements.",
		keywords: ["connexion", "login", "espace client", "AVENIR"],
	},
	"/register": {
		title: "Inscription - AVENIR",
		description:
			"Créez votre compte AVENIR en quelques minutes et profitez de tous nos services bancaires modernes.",
		keywords: ["inscription", "créer un compte", "nouveau client", "AVENIR"],
	},
	"/forgot-password": {
		title: "Mot de passe oublié - AVENIR",
		description: "Réinitialisez votre mot de passe AVENIR en toute sécurité.",
		keywords: ["mot de passe oublié", "réinitialisation", "AVENIR"],
	},
	"/verify-email": {
		title: "Vérification d'email - AVENIR",
		description:
			"Vérifiez votre adresse email pour activer votre compte AVENIR.",
		keywords: ["vérification email", "activation compte", "AVENIR"],
	},
	"/reset-password": {
		title: "Réinitialisation de mot de passe - AVENIR",
		description: "Créez un nouveau mot de passe pour votre compte AVENIR.",
		keywords: [
			"réinitialisation mot de passe",
			"nouveau mot de passe",
			"AVENIR",
		],
	},

	// Espace Client
	"/dashboard": {
		title: "Tableau de bord - AVENIR",
		description:
			"Consultez vos comptes, vos dernières transactions et gérez vos finances en un coup d'œil.",
		keywords: [
			"tableau de bord",
			"mes comptes",
			"solde",
			"transactions",
			"AVENIR",
		],
	},
	"/dashboard/accounts": {
		title: "Mes Comptes - AVENIR",
		description:
			"Liste des comptes, soldes et détails de vos comptes bancaires.",
		keywords: ["comptes", "soldes", "détails", "transactions", "AVENIR"],
	},
	"/dashboard/accounts/create": {
		title: "Créer un Compte - AVENIR",
		description: "Ouvrez un nouveau compte bancaire en quelques étapes.",
		keywords: ["créer compte", "ouverture", "banque", "AVENIR"],
	},
	"/dashboard/accounts/[id]": {
		title: "Détails du Compte - AVENIR",
		description:
			"Consultez le détail d'un compte, ses transactions et paramètres.",
		keywords: ["compte", "détails", "transactions", "paramètres", "AVENIR"],
	},
	"/dashboard/transfers": {
		title: "Transferts - AVENIR",
		description:
			"Effectuez des transferts entre vos comptes ou vers des bénéficiaires.",
		keywords: ["transfert", "virement", "bénéficiaire", "IBAN", "AVENIR"],
	},
	"/dashboard/credits": {
		title: "Mes Crédits - AVENIR",
		description: "Consultez vos crédits, mensualités et statuts.",
		keywords: ["crédits", "prêts", "mensualités", "AVENIR"],
	},
	"/messages": {
		title: "Messagerie - AVENIR",
		description:
			"Contactez votre conseiller bancaire en temps réel via notre messagerie sécurisée.",
		keywords: ["messagerie", "conseiller", "chat", "support", "AVENIR"],
	},
	"/news": {
		title: "Actualités - AVENIR",
		description:
			"Restez informé des dernières actualités de votre banque AVENIR.",
		keywords: ["actualités", "news", "informations", "banque", "AVENIR"],
	},

	// Investissement
	"/investment": {
		title: "Investissement - AVENIR",
		description:
			"Accédez à vos investissements, consultez votre portefeuille et passez des ordres d'achat ou de vente.",
		keywords: [
			"investissement",
			"actions",
			"portefeuille",
			"bourse",
			"trading",
			"AVENIR",
		],
	},
	"/investment/stocks": {
		title: "Actions disponibles - AVENIR",
		description:
			"Découvrez toutes les actions disponibles sur AVENIR. Cours en temps réel et graphiques de performance.",
		keywords: [
			"actions",
			"bourse",
			"cours",
			"cotations",
			"marchés financiers",
			"AVENIR",
		],
	},
	"/investment/portfolio": {
		title: "Mon portefeuille - AVENIR",
		description:
			"Consultez votre portefeuille d'actions, vos performances et votre répartition d'actifs.",
		keywords: [
			"portefeuille",
			"actions détenues",
			"performance",
			"répartition",
			"AVENIR",
		],
	},
	"/investment/orders": {
		title: "Mes ordres - AVENIR",
		description:
			"Gérez vos ordres d'achat et de vente d'actions. Historique et ordres en cours.",
		keywords: [
			"ordres",
			"achat actions",
			"vente actions",
			"carnet d'ordres",
			"AVENIR",
		],
	},

	// Espace Conseiller
	"/advisor/login": {
		title: "Connexion Conseiller - AVENIR",
		description: "Accédez à votre espace conseiller bancaire AVENIR.",
		keywords: ["conseiller", "login", "espace professionnel", "AVENIR"],
	},
	"/advisor/register": {
		title: "Inscription Conseiller - AVENIR",
		description:
			"Créez votre compte conseiller pour rejoindre l'équipe AVENIR.",
		keywords: ["inscription conseiller", "recrutement", "équipe", "AVENIR"],
	},
	"/advisor/dashboard": {
		title: "Dashboard Conseiller - AVENIR",
		description:
			"Vue d'ensemble de votre activité : clients, crédits et conversations en cours.",
		keywords: ["dashboard conseiller", "gestion clients", "activité", "AVENIR"],
	},
	"/advisor/messages": {
		title: "Messagerie Professionnelle - AVENIR",
		description: "Gérez les conversations avec vos clients en temps réel.",
		keywords: ["messagerie conseiller", "clients", "support", "AVENIR"],
	},
	"/advisor/internal-chat": {
		title: "Chat Interne - AVENIR",
		description:
			"Communiquez avec l'équipe AVENIR via le chat interne sécurisé.",
		keywords: ["chat interne", "équipe", "collaboration", "AVENIR"],
	},
	"/advisor/clients": {
		title: "Mes Clients - AVENIR",
		description:
			"Consultez la liste de vos clients et envoyez-leur des notifications.",
		keywords: ["clients", "gestion clients", "conseiller", "AVENIR"],
	},
	"/advisor/credits": {
		title: "Gestion des Crédits - AVENIR",
		description: "Consultez et gérez les demandes de crédit de vos clients.",
		keywords: ["crédits", "prêts", "demandes", "conseiller", "AVENIR"],
	},
	"/advisor/transactions": {
		title: "Transactions Clients - AVENIR",
		description: "Suivez et vérifiez les transactions des clients.",
		keywords: ["transactions", "clients", "vérification", "conseiller", "AVENIR"],
	},
	"/advisor/news": {
		title: "Gestion des Actualités - AVENIR",
		description: "Créez et gérez les actualités visibles par vos clients.",
		keywords: ["actualités", "news", "communication", "AVENIR"],
	},
	"/advisor/news/create": {
		title: "Créer une Actualité - AVENIR",
		description: "Rédigez et publiez une nouvelle actualité pour vos clients.",
		keywords: ["créer", "actualité", "publication", "conseiller", "AVENIR"],
	},
	"/advisor/news/[id]": {
		title: "Modifier une Actualité - AVENIR",
		description: "Mettez à jour le contenu d'une actualité existante.",
		keywords: ["modifier", "actualité", "édition", "conseiller", "AVENIR"],
	},

	// Espace Administration
	"/admin/login": {
		title: "Connexion Administrateur - AVENIR",
		description: "Accédez à l'espace d'administration de la banque AVENIR.",
		keywords: ["admin", "directeur", "administration", "AVENIR"],
	},
	"/admin/register": {
		title: "Inscription Administrateur - AVENIR",
		description: "Créez un compte administrateur pour AVENIR.",
		keywords: ["admin", "inscription directeur", "AVENIR"],
	},
	"/admin/dashboard": {
		title: "Administration - AVENIR",
		description:
			"Tableau de bord administrateur : gestion globale de la banque.",
		keywords: ["administration", "gestion", "directeur", "AVENIR"],
	},
	"/admin/users": {
		title: "Gestion des Utilisateurs - AVENIR",
		description:
			"Gérez tous les utilisateurs de la plateforme : clients, conseillers et administrateurs.",
		keywords: ["utilisateurs", "clients", "gestion", "admin", "AVENIR"],
	},
	"/admin/users/create": {
		title: "Créer un Utilisateur - AVENIR",
		description: "Ajoutez un nouvel utilisateur à la plateforme.",
		keywords: ["créer", "utilisateur", "administration", "AVENIR"],
	},
	"/admin/users/[id]": {
		title: "Modifier un Utilisateur - AVENIR",
		description: "Mettez à jour les informations d'un utilisateur.",
		keywords: ["modifier", "utilisateur", "administration", "AVENIR"],
	},
	"/admin/savings": {
		title: "Taux d'Épargne - AVENIR",
		description:
			"Définissez et modifiez le taux d'épargne applicable à tous les comptes.",
		keywords: ["épargne", "taux", "rémunération", "admin", "AVENIR"],
	},
	"/admin/investments": {
		title: "Gestion des Actions - AVENIR",
		description:
			"Créez, modifiez et gérez les actions disponibles sur la plateforme.",
		keywords: ["actions", "bourse", "gestion", "admin", "AVENIR"],
	},
	"/admin/investments/[id]": {
		title: "Modifier une Action - AVENIR",
		description: "Mettez à jour les informations d'une action.",
		keywords: ["modifier", "action", "bourse", "admin", "AVENIR"],
	},
	"/admin/news": {
		title: "Gestion des Actualités - AVENIR",
		description: "Gérez toutes les actualités de la banque AVENIR.",
		keywords: ["actualités", "communication", "admin", "AVENIR"],
	},
	"/admin/news/create": {
		title: "Créer une Actualité - AVENIR",
		description: "Ajoutez une nouvelle actualité pour les clients.",
		keywords: ["créer", "actualité", "admin", "AVENIR"],
	},
	"/admin/news/[id]": {
		title: "Modifier une Actualité - AVENIR",
		description: "Mettez à jour une actualité existante.",
		keywords: ["modifier", "actualité", "admin", "AVENIR"],
	},
	"/admin/internal-chat": {
		title: "Chat Interne Direction - AVENIR",
		description: "Communiquez avec toute l'équipe via le chat interne.",
		keywords: ["chat", "équipe", "direction", "AVENIR"],
	},
};

/**
 * Trouve les métadonnées correspondant à une route, en gérant les segments dynamiques [id]
 */
export function getPageMetadata(route: string): PageMetadata {
	if (pagesMetadata[route]) return pagesMetadata[route];
	// Essayer de faire correspondre les routes avec segments dynamiques
	const entries = Object.entries(pagesMetadata);
	for (const [pattern, meta] of entries) {
		// Transformer "/foo/[id]" en regex ^/foo/[^/]+$
		const regexStr = '^' + pattern.replace(/\[.+?\]/g, '[^/]+') + '$';
		const regex = new RegExp(regexStr);
		if (regex.test(route)) return meta;
	}
	return pagesMetadata['/'];
}

/**
 * Génère les métadonnées Next.js pour une route donnée
 * @param route - La route de la page (ex: "/dashboard", "/login")
 * @returns Metadata object pour Next.js
 */
export function generatePageMetadata(route: string): Metadata {
	const pageData = getPageMetadata(route);

	return {
		title: pageData.title,
		description: pageData.description,
		keywords: pageData.keywords,
		openGraph: pageData.openGraph
			? {
					title: pageData.openGraph.title || pageData.title,
					description: pageData.openGraph.description || pageData.description,
					images: pageData.openGraph.images,
			}
			: undefined,
		twitter: {
			card: "summary_large_image",
			title: pageData.title,
			description: pageData.description,
		},
		robots: {
			index: !route.includes("/admin") && !route.includes("/advisor"),
			follow: true,
		},
	};
}

/**
 * Métadonnées par défaut pour le layout root
 */
export const defaultMetadata: Metadata = {
	metadataBase: new URL("https://avenir-bank.fr"),
	title: {
		default: "AVENIR - Votre banque moderne et innovante",
		template: "%s | AVENIR",
	},
	description:
		"Gérez vos liquidités, épargne et investissements avec AVENIR. Une banque moderne qui place vos intérêts au cœur de ses priorités.",
	keywords: [
		"banque en ligne",
		"compte bancaire",
		"épargne",
		"investissement",
		"actions",
		"crédit",
		"AVENIR",
	],
	authors: [{ name: "AVENIR Bank" }],
	creator: "AVENIR Bank",
	publisher: "AVENIR Bank",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		locale: "fr_FR",
		url: "https://avenir-bank.fr",
		siteName: "AVENIR",
		title: "AVENIR - Votre banque moderne et innovante",
		description:
			"Gérez vos liquidités, épargne et investissements avec AVENIR.",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "AVENIR - Banque moderne",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "AVENIR - Votre banque moderne et innovante",
		description:
			"Gérez vos liquidités, épargne et investissements avec AVENIR.",
		images: ["/og-image.jpg"],
		creator: "@avenir_bank",
	},
	// Viewport must be exported separately in app/layout.tsx
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
	manifest: "/manifest.json",
};
