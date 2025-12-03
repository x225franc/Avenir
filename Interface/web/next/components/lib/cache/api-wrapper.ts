/**
 * Wrapper pour les services API avec cache intégré
 * Utilisation du système de cache pour optimiser les performances
 */

import { cacheManager, CacheKeys, CacheTTL } from "../cache";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Fetch wrapper avec cache
 */
export async function cachedFetch<T>(
	url: string,
	options?: RequestInit,
	cacheKey?: string,
	ttl?: number
): Promise<T> {
	const finalCacheKey = cacheKey || `fetch:${url}`;

	// Vérifier le cache pour les requêtes GET
	if (!options || options.method === "GET" || !options.method) {
		const cached = cacheManager.get<T>(finalCacheKey);
		if (cached !== null) {
			return cached;
		}
	}

	// Effectuer la requête
	const response = await fetch(url, options);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	// Mettre en cache uniquement pour GET
	if (!options || options.method === "GET" || !options.method) {
		cacheManager.set(finalCacheKey, data, ttl);
	}

	return data;
}

/**
 * Service générique avec cache
 */
export class CachedApiService {
	/**
	 * GET avec cache
	 */
	protected async get<T>(
		endpoint: string,
		token?: string,
		cacheKey?: string,
		ttl?: number
	): Promise<T> {
		const url = `${API_BASE_URL}${endpoint}`;
		const options: RequestInit = {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
			},
		};

		return cachedFetch<T>(url, options, cacheKey, ttl);
	}

	/**
	 * POST sans cache (invalide le cache associé)
	 */
	protected async post<T>(
		endpoint: string,
		data: any,
		token?: string,
		invalidatePattern?: string
	): Promise<T> {
		const url = `${API_BASE_URL}${endpoint}`;
		const options: RequestInit = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
			},
			body: JSON.stringify(data),
		};

		const response = await fetch(url, options);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();

		// Invalider le cache associé
		if (invalidatePattern) {
			cacheManager.invalidatePattern(invalidatePattern);
		}

		return result;
	}

	/**
	 * PUT sans cache (invalide le cache associé)
	 */
	protected async put<T>(
		endpoint: string,
		data: any,
		token?: string,
		invalidatePattern?: string
	): Promise<T> {
		const url = `${API_BASE_URL}${endpoint}`;
		const options: RequestInit = {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
			},
			body: JSON.stringify(data),
		};

		const response = await fetch(url, options);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();

		// Invalider le cache associé
		if (invalidatePattern) {
			cacheManager.invalidatePattern(invalidatePattern);
		}

		return result;
	}

	/**
	 * DELETE sans cache (invalide le cache associé)
	 */
	protected async delete<T>(
		endpoint: string,
		token?: string,
		invalidatePattern?: string
	): Promise<T> {
		const url = `${API_BASE_URL}${endpoint}`;
		const options: RequestInit = {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
			},
		};

		const response = await fetch(url, options);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();

		// Invalider le cache associé
		if (invalidatePattern) {
			cacheManager.invalidatePattern(invalidatePattern);
		}

		return result;
	}
}
