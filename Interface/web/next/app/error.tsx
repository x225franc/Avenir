"use client";

import { useEffect } from "react";
import { useUiShell } from "../components/contexts/UiShellContext";
import Link from "next/link";
import '@flaticon/flaticon-uicons/css/all/all.css';
import { useClientMetadata } from "@/components/lib/seo";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    const { setVisibility } = useUiShell();
	// Metadonnées SEO pour la page d'erreur (doit être appelé dans le composant)
	useClientMetadata("/error");
	useEffect(() => {
		// Log l'erreur dans un service de monitoring
		console.error("Application Error:", error);
        setVisibility({ showHeader: false, showFooter: false });
	}, [error]);

	return (
		<div className="min-h-screen bg-linear-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
			<div className="max-w-2xl mx-auto text-center">
				<div className="bg-white rounded-xl shadow-2xl p-8 border border-red-100">
				{/* Icône d'erreur */}
				<div className="mb-6">
					<div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
						<i className="fi fi-rr-triangle-warning text-red-600 text-6xl"></i>
					</div>
				</div>					{/* Titre */}
					<h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
						<i className="fi fi-rr-exclamation"></i>
						Erreur Serveur
					</h1>

					{/* Message */}
					<div className="mb-6">
						<p className="text-lg text-gray-600 mb-4">
							Une erreur inattendue s'est produite. Nous nous excusons pour la gêne occasionnée.
						</p>
						
						{process.env.NODE_ENV === "development" && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
								<h3 className="font-medium text-red-900 mb-2">Détails de l'erreur (mode développement) :</h3>
								<p className="text-sm text-red-700 font-mono wrap-break-word">
									{error.message}
								</p>
								{error.digest && (
									<p className="text-xs text-red-600 mt-2">
										ID d'erreur: {error.digest}
									</p>
								)}
							</div>
						)}
					</div>

					{/* Actions */}
					<div className="space-y-4">
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button
								onClick={reset}
								className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
							>
								<i className="fi fi-rr-refresh"></i>
								Réessayer
							</button>
							
							<Link
								href="/"
								className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
							>
								<i className="fi fi-rr-home"></i>
								Retour à l'accueil
							</Link>
						</div>
						
						<div className="text-sm text-gray-500">
							<p>Si le problème persiste, contactez notre support technique.</p>
						</div>
					</div>
					</div>
				</div>
			</div>
		);
}