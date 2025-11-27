import { useEffect, useRef, useState } from "react";

interface SSEHookOptions {
	userId?: number;
	role?: string;
	onConnected?: () => void;
	onError?: (error: Event) => void;
}

interface SSEEvent {
	type: string;
	data: any;
}

export function useSSE(options: SSEHookOptions = {}) {
	const [isConnected, setIsConnected] = useState(false);
	const [events, setEvents] = useState<SSEEvent[]>([]);
	const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
	const eventSourceRef = useRef<EventSource | null>(null);
	const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

	useEffect(() => {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
		const params = new URLSearchParams();
		
		if (options.userId) params.append("userId", options.userId.toString());
		if (options.role) params.append("role", options.role);

		const url = `${apiUrl}/sse/stream?${params.toString()}`;

		console.log("🔌 Connecting to SSE:", url);

		const eventSource = new EventSource(url);

		eventSource.onopen = () => {
			console.log("✅ SSE Connected");
			setIsConnected(true);
			options.onConnected?.();
		};

		eventSource.onerror = (error) => {
			console.error("❌ SSE Error:", error);
			setIsConnected(false);
			options.onError?.(error);
		};

		// Événement de connexion
		eventSource.addEventListener("connected", (event) => {
			console.log("📡 SSE connected event:", event.data);
		});

		// Événement générique pour tous les messages
		eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				const newEvent = { type: "message", data };
				setEvents((prev) => [...prev, newEvent]);
				setLastEvent(newEvent);
			} catch (error) {
				console.error("Error parsing SSE message:", error);
			}
		};

		eventSourceRef.current = eventSource;

		return () => {
			console.log("🔴 Disconnecting SSE");
			eventSource.close();
		};
	}, [options.userId, options.role]);

	// Fonction pour écouter un événement spécifique
	const addEventListener = (eventType: string, callback: (data: any) => void) => {
		if (!eventSourceRef.current) return () => {};

		// Ajouter le listener au map
		if (!listenersRef.current.has(eventType)) {
			listenersRef.current.set(eventType, new Set());
		}
		listenersRef.current.get(eventType)?.add(callback);

		// Créer le handler
		const handler = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);
				callback(data);
				
				// Mettre à jour les états
				const newEvent = { type: eventType, data };
				setEvents((prev) => [...prev, newEvent]);
				setLastEvent(newEvent);
			} catch (error) {
				console.error(`Error parsing SSE event "${eventType}":`, error);
			}
		};

		eventSourceRef.current.addEventListener(eventType, handler);

		// Retourner la fonction de nettoyage
		return () => {
			eventSourceRef.current?.removeEventListener(eventType, handler);
			listenersRef.current.get(eventType)?.delete(callback);
		};
	};

	return {
		isConnected,
		events,
		lastEvent,
		addEventListener,
	};
}
