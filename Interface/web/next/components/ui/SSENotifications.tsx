"use client";

import { useEffect, useState } from "react";
import { useSSE } from "../hooks/useSSE";

interface Notification {
	id: string;
	type: string;
	message: string;
	data?: any;
	timestamp: Date;
}

interface SSENotificationsProps {
	userId?: number;
	role?: string;
}

export function SSENotifications({ userId, role }: SSENotificationsProps) {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [showToast, setShowToast] = useState(false);
	const [currentToast, setCurrentToast] = useState<Notification | null>(null);

	const { isConnected, addEventListener } = useSSE({ userId, role });

	useEffect(() => {
		// Écouter les nouvelles actualités
		const unsubscribeNews = addEventListener("news:created", (data) => {
			const notification: Notification = {
				id: Date.now().toString(),
				type: "news",
				message: `📰 Nouvelle actualité : ${data.title}`,
				data,
				timestamp: new Date(),
			};
			addNotification(notification);
		});

		// Écouter les changements de taux d'épargne
		const unsubscribeRate = addEventListener("savings_rate:updated", (data) => {
			const notification: Notification = {
				id: Date.now().toString(),
				type: "savings_rate",
				message: `💰 ${data.message}`,
				data,
				timestamp: new Date(),
			};
			addNotification(notification);
		});

		return () => {
			unsubscribeNews();
			unsubscribeRate();
		};
	}, []);

	const addNotification = (notification: Notification) => {
		setNotifications((prev) => [notification, ...prev].slice(0, 10)); // Garder max 10 notifications
		setCurrentToast(notification);
		setShowToast(true);

		// Auto-hide après 5 secondes
		setTimeout(() => {
			setShowToast(false);
		}, 5000);
	};

	const dismissToast = () => {
		setShowToast(false);
	};

	return (
		<>
			{/* Indicateur de connexion */}
			{/* <div className="fixed top-4 right-4 z-50">
				<div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all ${
					isConnected 
						? "bg-green-100 text-green-800" 
						: "bg-red-100 text-red-800"
				}`}>
					<div className={`w-2 h-2 rounded-full ${
						isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
					}`}></div>
					<span className="text-xs font-medium">
						{isConnected ? "Connecté" : "Déconnecté"}
					</span>
				</div>
			</div> */}

			{/* Toast de notification */}
			{showToast && currentToast && (
				<div className="fixed top-20 right-4 z-50 animate-slide-in-right">
					<div className="bg-white rounded-lg shadow-2xl p-4 max-w-sm border-l-4 border-blue-500">
						<div className="flex items-start justify-between gap-3">
							<div className="flex-1">
								<p className="text-sm font-medium text-gray-900">
									{currentToast.message}
								</p>
								<p className="text-xs text-gray-500 mt-1">
									{currentToast.timestamp.toLocaleTimeString("fr-FR")}
								</p>
							</div>
							<button
								onClick={dismissToast}
								className="text-gray-400 hover:text-gray-600 transition"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Liste des notifications (optionnel - peut être dans un dropdown) */}
			{notifications.length > 0 && (
				<div className="hidden">
					{/* Cette section peut être utilisée pour afficher un historique */}
					{notifications.map((notif) => (
						<div key={notif.id} className="p-2 border-b">
							{notif.message}
						</div>
					))}
				</div>
			)}
		</>
	);
}
