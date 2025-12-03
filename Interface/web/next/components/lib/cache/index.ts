/**
 * Système de cache multi-niveaux pour AVENIR
 * - Cache en mémoire pour les données fréquemment accédées
 * - Cache avec TTL (Time To Live) configurable
 * - Invalidation manuelle ou automatique
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number; // Time to live en millisecondes
}

class CacheManager {
	private cache: Map<string, CacheEntry<any>> = new Map();
	private defaultTTL: number = 5 * 60 * 1000; // 5 minutes par défaut

	/**
	 * Récupère une donnée du cache
	 */
	get<T>(key: string): T | null {
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		// Vérifier si le cache a expiré
		const now = Date.now();
		if (now - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data as T;
	}

	/**
	 * Stocke une donnée dans le cache
	 */
	set<T>(key: string, data: T, ttl?: number): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl: ttl || this.defaultTTL,
		});
	}

	/**
	 * Invalide une clé spécifique du cache
	 */
	invalidate(key: string): void {
		this.cache.delete(key);
	}

	/**
	 * Invalide toutes les clés correspondant à un pattern
	 */
	invalidatePattern(pattern: string): void {
		const regex = new RegExp(pattern);
		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * Vide tout le cache
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Nettoie les entrées expirées
	 */
	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * Retourne les statistiques du cache
	 */
	getStats() {
		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys()),
		};
	}
}

// Instance singleton
export const cacheManager = new CacheManager();

// Nettoyer le cache toutes les 10 minutes
if (typeof window !== "undefined") {
	setInterval(() => {
		cacheManager.cleanup();
	}, 10 * 60 * 1000);
}

/**
 * Hook React pour utiliser le cache facilement
 */
export function useCache<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttl?: number
): {
	data: T | null;
	loading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	invalidate: () => void;
} {
	const [data, setData] = React.useState<T | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<Error | null>(null);

	const fetchData = React.useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// Vérifier le cache d'abord
			const cached = cacheManager.get<T>(key);
			if (cached !== null) {
				setData(cached);
				setLoading(false);
				return;
			}

			// Sinon, récupérer les données
			const result = await fetcher();
			cacheManager.set(key, result, ttl);
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Unknown error"));
		} finally {
			setLoading(false);
		}
	}, [key, fetcher, ttl]);

	React.useEffect(() => {
		fetchData();
	}, [fetchData]);

	const invalidate = React.useCallback(() => {
		cacheManager.invalidate(key);
		fetchData();
	}, [key, fetchData]);

	return {
		data,
		loading,
		error,
		refetch: fetchData,
		invalidate,
	};
}

import React from "react";

/**
 * Fonction utilitaire pour wrapper une API avec cache
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
	fn: T,
	keyGenerator: (...args: Parameters<T>) => string,
	ttl?: number
): T {
	return (async (...args: Parameters<T>) => {
		const key = keyGenerator(...args);
		const cached = cacheManager.get(key);

		if (cached !== null) {
			return cached;
		}

		const result = await fn(...args);
		cacheManager.set(key, result, ttl);
		return result;
	}) as T;
}

/**
 * Préfixes de clés pour organiser le cache
 */
export const CacheKeys = {
	ACCOUNTS: "accounts",
	STOCKS: "stocks",
	NEWS: "news",
	CREDITS: "credits",
	PORTFOLIO: "portfolio",
	TRANSACTIONS: "transactions",
	USER: "user",
	CONVERSATIONS: "conversations",
	SAVINGS_RATE: "savings_rate",
} as const;

/**
 * TTL prédéfinis pour différents types de données
 */
export const CacheTTL = {
	SHORT: 30 * 1000, // 30 secondes - données très volatiles (cours d'actions)
	MEDIUM: 5 * 60 * 1000, // 5 minutes - données moyennement volatiles
	LONG: 30 * 60 * 1000, // 30 minutes - données stables
	VERY_LONG: 2 * 60 * 60 * 1000, // 2 heures - données rarement modifiées
} as const;
