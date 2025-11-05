"use client";

import { useEffect } from "react";
import { useUiShell } from "../components/contexts/UiShellContext";
import Link from "next/link";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    const { setVisibility } = useUiShell();
	useEffect(() => {
		// Log l'erreur dans un service de monitoring
		console.error("Application Error:", error);
        setVisibility({ showHeader: false, showFooter: false });
	}, [error]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
			<div className="max-w-2xl mx-auto text-center">
				<div className="bg-white rounded-xl shadow-2xl p-8 border border-red-100">
					{/* Icône d'erreur */}
					<div className="mb-6">
						<div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
							<svg
								className="w-12 h-12 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>
					</div>

					{/* Titre */}
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						⚠️ Erreur Serveur
					</h1>

					{/* Message */}
					<div className="mb-6">
						<p className="text-lg text-gray-600 mb-4">
							Une erreur inattendue s'est produite. Nous nous excusons pour la gêne occasionnée.
						</p>
						
						{process.env.NODE_ENV === "development" && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
								<h3 className="font-medium text-red-900 mb-2">Détails de l'erreur (mode développement) :</h3>
								<p className="text-sm text-red-700 font-mono break-words">
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
								className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
							>
								🔄 Réessayer
							</button>
							
							<Link
								href="/"
								className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
							>
								🏠 Retour à l'accueil
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