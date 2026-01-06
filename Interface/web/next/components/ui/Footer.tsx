export default function Footer() {
	return (
		<footer className="bg-gray-900 text-gray-300 py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<h3 className="text-white font-bold text-lg mb-4">
						Banque AVENIR
					</h3>
					<p className="text-sm">
						Votre partenaire financier de confiance pour un avenir prospère.
					</p>
				</div>

				{/* Ligne de séparation */}
				<div className="border-t border-gray-800 mt-8 pt-8">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="text-sm text-center md:text-left">
							© 2025 Banque AVENIR. Tous droits réservés.
						</p>
						<p className="text-xs text-gray-500 mt-2 md:mt-0">
							Alliance de Valeurs Économiques et Nationales Investies
							Responsablement
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
