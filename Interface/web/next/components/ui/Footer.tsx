import Link from "next/link";

export default function Footer() {
	return (
		<footer className="bg-gray-900 text-gray-300 py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid md:grid-cols-4 gap-8">
					{/* Colonne 1 : À propos */}
					<div>
						<h3 className="text-white font-bold text-lg mb-4">
							Banque AVENIR
						</h3>
						<p className="text-sm">
							Votre partenaire financier de confiance pour un avenir prospère.
						</p>
					</div>

					<div>
						<h4 className="text-white font-semibold mb-4">Section 1</h4>
						<ul className="space-y-2 text-sm">
							<li>
								<Link href="#" className="hover:text-white transition">
									Lorem
								</Link>
							</li>
						</ul>
					</div>
                    
					<div>
						<h4 className="text-white font-semibold mb-4">Section 2</h4>
						<ul className="space-y-2 text-sm">
							<li>
								<Link href="#" className="hover:text-white transition">
									Lorem
								</Link>
							</li>
						</ul>
					</div>

					{/* Colonne 4 : Légal & Support */}
					<div>
						<h4 className="text-white font-semibold mb-4">Section 3</h4>
						<ul className="space-y-2 text-sm">
							<li>
								<Link href="#" className="hover:text-white transition">
									Lorem
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Ligne de séparation */}
				<div className="border-t border-gray-800 mt-5 pt-5">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="text-sm text-center md:text-left">
							© 2025 Banque AVENIR. Tous droits réservés.
						</p>
						<p className="text-xs text-gray-500 mt-2 md:mt-0">
							Alliance de Valeurs Économiques et Nationnales Investies
							Responsablement
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
