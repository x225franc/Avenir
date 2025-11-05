export default function LoadingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="text-center">
				<div className="bg-white rounded-xl shadow-2xl p-8 border border-blue-100">
					{/* Logo ou icône */}
					<div className="mb-6">
						<div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
							<svg
								className="w-8 h-8 text-blue-600 animate-spin"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
						</div>
					</div>

					{/* Titre */}
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						🏦 Avenir Bank
					</h1>

					{/* Animation de chargement */}
					<div className="mb-6">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					</div>

					{/* Message */}
					<p className="text-gray-600 mb-4">
						Chargement de votre espace bancaire...
					</p>

					{/* Barre de progression factice */}
					<div className="w-full bg-gray-200 rounded-full h-2 mb-4">
						<div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
					</div>

					{/* Sous-message */}
					<p className="text-sm text-gray-500">
						Connexion sécurisée en cours...
					</p>

					{/* Points animés */}
					<div className="flex justify-center space-x-1 mt-4">
						<div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
						<div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
						<div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
					</div>
				</div>
			</div>
		</div>
	);
}