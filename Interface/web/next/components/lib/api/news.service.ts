import apiClient, { ApiResponse } from "./client";
import { cacheManager, CacheKeys, CacheTTL } from "../cache";

/**
 * DTOs pour les actualités
 */
export interface News {
	id: string;
	title: string;
	content: string;
	authorId: string;
	published: boolean;
	createdAt: string;
	updatedAt: string;
	authorName?: string;
	authorRole?: string;
}

export interface CreateNewsDTO {
	title: string;
	content: string;
	published?: boolean;
}

export interface UpdateNewsDTO {
	title: string;
	content: string;
	published?: boolean;
}

/**
 * Service pour les opérations liées aux actualités
 */
export const newsService = {
	/**
	 * Récupérer toutes les actualités (publiées seulement pour les clients)
	 */
	async getAll(publishedOnly: boolean = false): Promise<ApiResponse<News[]>> {
		const cacheKey = `${CacheKeys.NEWS}:all:${publishedOnly}`;
		const cached = cacheManager.get<ApiResponse<News[]>>(cacheKey);
		if (cached) return cached;

		const url = publishedOnly ? "/news?published=true" : "/news";
		const response = await apiClient.get<ApiResponse<News[]>>(url);
		cacheManager.set(cacheKey, response.data, CacheTTL.LONG);
		return response.data;
	},

	/**
	 * Récupérer une actualité par ID
	 */
	async getById(id: string): Promise<ApiResponse<News>> {
		const response = await apiClient.get<ApiResponse<News>>(`/news/${id}`);
		return response.data;
	},

	/**
	 * Créer une nouvelle actualité (advisor/director seulement)
	 */
	async create(data: CreateNewsDTO): Promise<ApiResponse<News>> {
		const response = await apiClient.post<ApiResponse<News>>("/news", data);
		// Invalider le cache des news
		cacheManager.invalidatePattern(`${CacheKeys.NEWS}:.*`);
		return response.data;
	},

	/**
	 * Mettre à jour une actualité (advisor/director seulement)
	 */
	async update(id: string, data: UpdateNewsDTO): Promise<ApiResponse<News>> {
		const response = await apiClient.put<ApiResponse<News>>(
			`/news/${id}`,
			data
		);
		return response.data;
	},

	/**
	 * Supprimer une actualité (advisor/director seulement)
	 */
	async delete(id: string): Promise<ApiResponse> {
		const response = await apiClient.delete<ApiResponse>(`/news/${id}`);
		return response.data;
	},
};
