"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/contexts/AuthContext";
import { messageApi, type Conversation, type Message } from "@/components/lib/api/message.service";
import { io, Socket } from "socket.io-client";
import { useClientMetadata } from "@/components/lib/seo";

const SOCKET_URL = (
    process.env.NEXT_PUBLIC_WS_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
).replace(/\/api\/?$/, "");

// --- Composants UI internes ---

const AvatarPlaceholder = ({ name, color = "bg-indigo-100 text-indigo-600" }: { name: string; color?: string }) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    return (
        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${color}`}>
            {initials || "?"}
        </div>
    );
};

const Icons = {
    Send: () => <i className="fi fi-rr-paper-plane w-5 h-5"></i>,
    Plus: () => <i className="fi fi-rr-plus w-5 h-5"></i>,
    Lock: () => <i className="fi fi-rr-lock w-4 h-4"></i>,
    Search: () => <i className="fi fi-rr-search w-5 h-5 text-gray-400"></i>,
    ChatBubble: () => <i className="fi fi-rr-comments w-12 h-12 text-gray-300"></i>
};

export default function MessagesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [canCreateNew, setCanCreateNew] = useState(false);
    const [advisorInfo, setAdvisorInfo] = useState<Map<string, any>>(new Map());
    const selectedConversationRef = useRef<Conversation | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

    // Métadonnées SEO
    useClientMetadata("/messages");    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation?.messages, isTyping]);

    // Sync ref with state
    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    // Load advisor information
    const loadAdvisorInfo = async (advisorId: string) => {
        if (advisorInfo.has(advisorId)) return;
        try {
            const response = await fetch(`http://localhost:3001/api/users/${advisorId}`);
            const data = await response.json();
            if (data.success) {
                setAdvisorInfo((prev) => new Map(prev).set(advisorId, data.data));
            }
        } catch (error) {
            console.error("Error loading advisor info:", error);
        }
    };

    // Check if user can create new conversation
    useEffect(() => {
        if (!user) return;
        const checkOpenConversation = async () => {
            const result = await messageApi.checkOpenConversation(parseInt(user.id));
            if (result.success && result.data) {
                setCanCreateNew(!result.data.hasOpenConversation);
            }
        };
        checkOpenConversation();
    }, [user]);

    // Load conversations
    useEffect(() => {
        if (!user) return;
        const loadConversations = async () => {
            setLoading(true);
            const result = await messageApi.getConversations(parseInt(user.id), "client");
            if (result.success && result.data) {
                setConversations(result.data);
                result.data.forEach((conv) => {
                    if (conv.advisorId) loadAdvisorInfo(conv.advisorId);
                });
            }
            setLoading(false);
        };
        loadConversations();
    }, [user]);

    // Setup WebSocket
    useEffect(() => {
        if (!user) return;
        const newSocket = io(SOCKET_URL, { withCredentials: true, transports: ["websocket"], reconnection: true });

        newSocket.on("connect", () => {
            console.log("Connection au WebSocket établie");
            newSocket.emit("join", { userId: user.id, role: "client" });
        });

        newSocket.on("message:new", (data: { conversationId: string; message: Message }) => {
            const currentSelected = selectedConversationRef.current;

            // Ignorer les messages qu'on a envoyé soi-même (déjà ajoutés localement)
            if (user && data.message.fromUserId === user.id.toString()) {
                return;
            }

            setConversations((prev) =>
                prev.map((conv) => {
                    if (conv.id === data.conversationId) {
                        return {
                            ...conv,
                            messages: [...conv.messages, data.message],
                            unreadCount: conv.id === currentSelected?.id ? 0 : conv.unreadCount + 1,
                            lastMessageAt: data.message.createdAt,
                        };
                    }
                    return conv;
                })
            );

            if (currentSelected?.id === data.conversationId) {
                setSelectedConversation((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        messages: [...prev.messages, data.message],
                        lastMessageAt: data.message.createdAt,
                    };
                });
                if (user) messageApi.markAsRead(data.conversationId, parseInt(user.id));
            }
        });

        newSocket.on("conversation:assigned", (data: { conversationId: string; advisorId: number }) => {
            setCanCreateNew(false);
            loadConversations();
        });

        // Mise à jour temps réel quand la conversation change (assignation, transfert, clôture partielle)
        newSocket.on("conversation:updated", () => {
            loadConversations();
        });

        newSocket.on("conversation:closed", (data: { conversationId: string }) => {
            setCanCreateNew(true);
            setConversations((prev) =>
                prev.map((conv) => (conv.id === data.conversationId ? { ...conv, isClosed: true } : conv))
            );
        });

        newSocket.on("typing:start", (data: { conversationId: string; userId: number }) => {
            const currentSelected = selectedConversationRef.current;
            if (data.conversationId === currentSelected?.id && user && data.userId !== parseInt(user.id)) {
                setIsTyping(true);
            }
        });

        newSocket.on("typing:stop", (data: { conversationId: string; userId: number }) => {
            const currentSelected = selectedConversationRef.current;
            if (data.conversationId === currentSelected?.id) {
                setIsTyping(false);
            }
        });

        setSocket(newSocket);
        return () => { newSocket.disconnect(); };
    }, [user]);

    // Join conversation room when selected
    useEffect(() => {
        if (!socket || !selectedConversation || !user) return;
        socket.emit("join-conversation", selectedConversation.id);

        if (selectedConversation.unreadCount > 0) {
            messageApi.markAsRead(selectedConversation.id, parseInt(user.id));
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === selectedConversation.id ? { ...conv, unreadCount: 0 } : conv
                )
            );
        }
        return () => { socket.emit("leave-conversation", selectedConversation.id); };
    }, [socket, selectedConversation, user]);

    // Function to reload conversations manually
    const loadConversations = async () => {
        if (!user) return;
        const result = await messageApi.getConversations(parseInt(user.id), "client");
        if (result.success && result.data) {
            setConversations(result.data);
        }
    };

    const handleCreateNewConversation = () => {
        if (!user) return;
        const conversationId = Math.random().toString(36).substring(2, 14).toUpperCase();
        const newConv: Conversation = {
            id: conversationId,
            clientId: user.id.toString(),
            advisorId: null,
            isClosed: false,
            isAssigned: false,
            unreadCount: 0,
            lastMessageAt: new Date(),
            createdAt: new Date(),
            messages: [],
        };
        setSelectedConversation(newConv);
        setCanCreateNew(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || !user || isSending) return;

        setIsSending(true);
        try {
            const result = await messageApi.sendMessage(
                selectedConversation.id,
                parseInt(user.id),
                newMessage,
                selectedConversation.advisorId ? parseInt(selectedConversation.advisorId) : undefined
            );

            if (result.success && result.data) {
                const newMsg = result.data;
                setSelectedConversation((prev) => {
                    if (!prev) return null;
                    return { ...prev, messages: [...prev.messages, newMsg], lastMessageAt: newMsg.createdAt };
                });

                setConversations((prev) => {
                    const existing = prev.find((c) => c.id === selectedConversation.id);
                    if (existing) {
                        return prev.map((conv) =>
                            conv.id === selectedConversation.id
                                ? { ...conv, messages: [...conv.messages, newMsg], lastMessageAt: newMsg.createdAt }
                                : conv
                        );
                    } else {
                        loadConversations().catch(console.error);
                        return prev;
                    }
                });
                setNewMessage("");

                // Recharger les messages après 500ms pour synchroniser avec le serveur
                setTimeout(async () => {
                    try {
                        const updatedConversation = await messageApi.getConversation(selectedConversation.id);
                        if (updatedConversation.success && updatedConversation.data) {
                            setSelectedConversation(updatedConversation.data);
                        }
                    } catch (error) {
                        console.error("Erreur lors du rechargement des messages:", error);
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleTyping = () => {
        if (!socket || !selectedConversation || !user) return;
        socket.emit("typing:start", { conversationId: selectedConversation.id, userId: parseInt(user.id) });
    };

    const handleStopTyping = () => {
        if (!socket || !selectedConversation || !user) return;
        socket.emit("typing:stop", { conversationId: selectedConversation.id, userId: parseInt(user.id) });
    };

    // Debounce pour arrêter automatiquement l'indicateur après 2s
    useEffect(() => {
        if (!newMessage) {
            handleStopTyping();
            return;
        }

        handleTyping();
        const timer = setTimeout(() => {
            handleStopTyping();
        }, 2000);

        return () => clearTimeout(timer);
    }, [newMessage]);

    const getAdvisorName = (advisorId: string | null) => {
        if (!advisorId) return "En attente";
        const info = advisorInfo.get(advisorId);
        return info ? `${info.firstName} ${info.lastName}` : "Conseiller";
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Chargement de vos échanges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
            {/* Main Container - Séparation physique avec gap-6 */}
            <div className="flex-1 flex gap-6 max-w-[1600px] w-full mx-auto md:p-6 p-0 h-full">
                
                {/* BLOC GAUCHE - Liste des conversations */}
                {/* On applique un h-full et overflow-hidden ici pour que le scroll soit interne */}
                <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-white md:rounded-2xl md:shadow-xl border border-gray-200 overflow-hidden h-full ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    
                    {/* Sidebar Header */}
                    <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Messagerie</h1>
                            <div className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                {conversations.length}
                            </div>
                        </div>
                        
                        {/* <div className="relative mb-3">
                            <span className="absolute left-3 top-2.5">
                                <Icons.Search />
                            </span>
                            <input 
                                type="text" 
                                disabled 
                                placeholder="Rechercher..." 
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm text-gray-600 focus:ring-0 cursor-not-allowed opacity-60"
                            />
                        </div> */}

                        {canCreateNew && (
                            <button
                                onClick={handleCreateNewConversation}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-all shadow-sm shadow-indigo-200 active:scale-95"
                            >
                                <Icons.Plus />
                                Nouvelle conversation
                            </button>
                        )}
                    </div>

                    {/* Conversations List - Scrollable */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                        {conversations.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                                <Icons.ChatBubble />
                                <p className="mt-3 text-sm font-medium">Aucun message pour le moment</p>
                            </div>
                        ) : (
                            conversations.map((conv) => {
                                const isActive = selectedConversation?.id === conv.id;
                                const advisorName = getAdvisorName(conv.advisorId);
                                const lastMsg = conv.messages[conv.messages.length - 1];

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`w-full p-3 flex items-start gap-3 rounded-xl transition-all duration-200 group ${
                                            isActive 
                                                ? "bg-indigo-50 border border-indigo-100 shadow-sm" 
                                                : "hover:bg-gray-50 border border-transparent"
                                        }`}
                                    >
                                        <div className="relative">
                                            <AvatarPlaceholder 
                                                name={advisorName} 
                                                color={conv.isAssigned ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-500"} 
                                            />
                                            {conv.isClosed && (
                                                <span className="absolute -bottom-1 -right-1 bg-gray-100 text-gray-500 p-0.5 rounded-full border border-white">
                                                    <Icons.Lock />
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <span className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                    {advisorName}
                                                </span>
                                                <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                                    {new Date(conv.lastMessageAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`text-xs truncate leading-relaxed ${conv.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                                                {lastMsg?.content || "Nouvelle conversation"}
                                            </p>
                                        </div>
                                        
                                        {conv.unreadCount > 0 && (
                                            <span className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0 mt-2">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* BLOC DROITE - Chat Area */}
                {/* Carte séparée physiquement */}
                <div className={`flex-1 flex flex-col bg-white md:rounded-2xl md:shadow-xl border border-gray-200 overflow-hidden h-full ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-10 sticky top-0 shrink-0">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setSelectedConversation(null)}
                                        className="md:hidden p-1 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                    >
                                        <i className="fi fi-rr-angle-left w-6 h-6"></i>
                                    </button>
                                    
                                    <AvatarPlaceholder name={getAdvisorName(selectedConversation.advisorId)} />
                                    
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{getAdvisorName(selectedConversation.advisorId)}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            {selectedConversation.isClosed ? (
                                                <span className="flex items-center gap-1 text-gray-400"><Icons.Lock /> Clôturée</span>
                                            ) : !selectedConversation.isAssigned ? (
                                                <span className="text-orange-500 font-medium">En attente d'assignation</span>
                                            ) : (
                                                <span className="text-emerald-500 font-medium">● Active</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-white scroll-smooth relative">
                                {selectedConversation.messages.map((msg, idx) => {
                                    const isMe = user && msg.fromUserId === user.id.toString();
                                    const isSystem = msg.isSystem;

                                    if (isSystem) {
                                        return (
                                            <div key={idx} className="flex justify-center my-4">
                                                <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full border border-gray-200">
                                                    {msg.content}
                                                </span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                            <div className={`flex flex-col max-w-[80%] md:max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
                                                <div
                                                    className={`px-5 py-3 shadow-sm text-[15px] leading-relaxed relative ${
                                                        isMe
                                                            ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm"
                                                            : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200"
                                                    }`}
                                                >
                                                    {msg.content}
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                    {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input - Fixed at bottom of card */}
                            <div className="p-4 md:p-6 bg-white border-t border-gray-100 z-10 shrink-0">
                                {!selectedConversation.isClosed ? (
                                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onFocus={handleTyping}
                                            onBlur={handleStopTyping}
                                            placeholder="Écrivez votre message..."
                                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full p-3.5 pl-4 transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || isSending}
                                            className="p-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
                                        >
                                            {isSending ? (
                                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            ) : (
                                                <Icons.Send />
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
                                        <Icons.Lock />
                                        <span>Cette conversation est terminée. Vous ne pouvez plus répondre.</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-50/30">
                            <div className="bg-white p-6 rounded-full shadow-lg shadow-indigo-100 mb-6">
                                <Icons.ChatBubble />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Vos messages</h2>
                            <p className="text-sm mt-2 max-w-xs text-center leading-relaxed">
                                Sélectionnez une conversation dans la liste ou démarrez-en une nouvelle pour contacter un conseiller.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}