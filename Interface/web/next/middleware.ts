/**
 * Optimise les performances en définissant des stratégies de cache appropriées
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const response = NextResponse.next();

	// Déterminer le type de ressource
	const { pathname } = request.nextUrl;

	// Cache pour les assets statiques (images, fonts, etc.)
	if (
		pathname.startsWith("/_next/static") ||
		pathname.startsWith("/images") ||
		pathname.startsWith("/fonts")
	) {
		response.headers.set(
			"Cache-Control",
			"public, max-age=31536000, immutable"
		);
	}

	// Cache court pour les pages dynamiques
	else if (
		pathname.startsWith("/dashboard") ||
		pathname.startsWith("/investment") ||
		pathname.startsWith("/messages")
	) {
		response.headers.set(
			"Cache-Control",
			"private, no-cache, no-store, must-revalidate"
		);
	}

	// Cache moyen pour les pages publiques
	else if (pathname === "/" || pathname.startsWith("/news")) {
		response.headers.set(
			"Cache-Control",
			"public, s-maxage=300, stale-while-revalidate=600"
		);
	}

	// Ajouter des headers de sécurité
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/webpack-hmr (hot module replacement)
		 */
		"/((?!api|_next/webpack-hmr).*)",
	],
};
