"use client";

import React, { useEffect } from "react";

interface NotificationModalProps {
	isOpen: boolean;
	type: "success" | "error" | "info";
	title: string;
	message: string;
	onClose: () => void;
	autoCloseDelay?: number; // en millisecondes, par défaut 5000 (5 secondes)
}

/**
 * Composant de notification modale réutilisable
 */
export function NotificationModal({
	isOpen,
	type,
	title,
	message,
	onClose,
	autoCloseDelay = 5000,
}: NotificationModalProps) {
	useEffect(() => {
		if (isOpen && autoCloseDelay > 0) {
			const timer = setTimeout(() => {
				onClose();
			}, autoCloseDelay);

			return () => clearTimeout(timer);
		}
	}, [isOpen, autoCloseDelay, onClose]);

	if (!isOpen) return null;

	const getTypeStyles = () => {
		switch (type) {
			case "success":
				return {
					bgColor: "bg-green-100",
					iconColor: "text-green-600",
					titleColor: "text-green-900",
					messageColor: "text-green-700",
					buttonColor: "bg-green-600 hover:bg-green-700",
					icon: (
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					),
				};
			case "error":
				return {
					bgColor: "bg-red-100",
					iconColor: "text-red-600",
					titleColor: "text-red-900",
					messageColor: "text-red-700",
					buttonColor: "bg-red-600 hover:bg-red-700",
					icon: (
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					),
				};
			case "info":
				return {
					bgColor: "bg-blue-100",
					iconColor: "text-blue-600",
					titleColor: "text-blue-900",
					messageColor: "text-blue-700",
					buttonColor: "bg-blue-600 hover:bg-blue-700",
					icon: (
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					),
				};
		}
	};

	const styles = getTypeStyles();

	return (
		<div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-200">
				<div className="text-center">
					{/* Icon */}
					<div className={`w-16 h-16 ${styles.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
						<svg
							className={`w-8 h-8 ${styles.iconColor}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							{styles.icon}
						</svg>
					</div>

					{/* Title */}
					<h3 className={`text-lg font-semibold ${styles.titleColor} mb-2`}>
						{title}
					</h3>

					{/* Message */}
					<p className={`${styles.messageColor} mb-6`}>
						{message}
					</p>

					{/* Actions */}
					<div className="flex flex-col space-y-3">
						<button
							onClick={onClose}
							className={`w-full px-4 py-3 ${styles.buttonColor} text-white font-medium rounded-lg transition-colors`}
						>
							Fermer
						</button>
						
						{autoCloseDelay > 0 && (
							<div className="text-sm text-gray-500">
								Cette fenêtre se fermera automatiquement dans quelques secondes...
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}