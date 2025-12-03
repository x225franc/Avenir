"use client";

import { useEffect } from "react";
import { getPageMetadata } from "./config";

/**
 * Hook pour mettre à jour les métadonnées côté client
 * Utilisable dans les composants "use client"
 * 
 * @param route - La route de la page (ex: "/dashboard", "/login")
 * 
 * @example
 * ```tsx
 * import { useClientMetadata } from "@/components/lib/seo/client";
 * 
 * export default function LoginPage() {
 *   useClientMetadata("/login");
 *   // ... reste du composant
 * }
 * ```
 */
export function useClientMetadata(route: string) {
	useEffect(() => {
		const metadata = getPageMetadata(route);
		
		// Mettre à jour le titre
		document.title = metadata.title;
		
		// Mettre à jour la description
		updateMetaTag("description", metadata.description);
		
		// Mettre à jour les keywords si présents
		if (metadata.keywords && metadata.keywords.length > 0) {
			updateMetaTag("keywords", metadata.keywords.join(", "));
		}
		
		// Open Graph
		if (metadata.openGraph) {
			updateMetaTag("og:title", metadata.openGraph.title || metadata.title, "property");
			updateMetaTag("og:description", metadata.openGraph.description || metadata.description, "property");
			updateMetaTag("og:type", "website", "property");
			
			if (metadata.openGraph.images && metadata.openGraph.images.length > 0) {
				updateMetaTag("og:image", metadata.openGraph.images[0], "property");
			}
		}
		
		// Twitter Card
		updateMetaTag("twitter:card", "summary_large_image");
		updateMetaTag("twitter:title", metadata.title);
		updateMetaTag("twitter:description", metadata.description);
		
	}, [route]);
}

/**
 * Helper function pour mettre à jour ou créer un meta tag
 */
function updateMetaTag(name: string, content: string, attribute: "name" | "property" = "name") {
	let element = document.querySelector(`meta[${attribute}="${name}"]`);
	
	if (!element) {
		element = document.createElement("meta");
		element.setAttribute(attribute, name);
		document.head.appendChild(element);
	}
	
	element.setAttribute("content", content);
}
