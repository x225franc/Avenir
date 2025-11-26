"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useUiShell } from "../components/contexts/UiShellContext";
import '@flaticon/flaticon-uicons/css/all/all.css';

export default function NotFound() {
    const { setVisibility } = useUiShell();
    useEffect(() => {
        setVisibility({ showHeader: false, showFooter: false });
    }, []);
	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
			<div className='max-w-2xl mx-auto text-center'>
				<div className='bg-white rounded-xl shadow-2xl p-8 border border-blue-100'>
					{/* Icône 404 */}
					<div className='mb-6'>
						<div className='mx-auto w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center'>
							<div className='text-6xl font-bold text-blue-600'>404</div>
						</div>
					</div>

					{/* Titre */}
					<h1 className='text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2'>
						<i className="fi fi-rr-search"></i>
						Page Introuvable
					</h1>

					{/* Message */}
					<div className='mb-8'>
						<p className='text-lg text-gray-600 mb-4'>
							Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
						</p>
						<p className='text-gray-500'>
							Vérifiez l'URL ou utilisez les liens ci-dessous pour naviguer.
						</p>
					</div>

					{/* Actions */}
					<div className='space-y-6'>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Link
								href='/'
								className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2'
							>
								<i className="fi fi-rr-home"></i>
								Accueil
							</Link>

							<button
								onClick={() => window.history.back()}
								className='px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium'
							>
								← Retour
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
