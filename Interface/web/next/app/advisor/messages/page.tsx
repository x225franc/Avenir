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
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const AvatarPlaceholder = ({ name, color = "bg-gray-100 text-gray-600" }: { name: string; color?: string }) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    return (
        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${color}`}>
            {initials || "?"}
        </div>
    );
};

const Icons = {
    Send: () => <i className="fi fi-rr-paper-plane w-5 h-5"></i>,
    Search: () => <i className="fi fi-rr-search w-5 h-5 text-gray-400"></i>,
    ChatBubble: () => <i className="fi fi-rr-comments w-12 h-12 text-gray-300"></i>,
    Lock: () => <i className="fi fi-rr-lock w-4 h-4"></i>,
    UserPlus: () => <i className="fi fi-rr-user-add w-4 h-4"></i>,
    ArrowRightLeft: () => <i className="fi fi-rr-arrows-repeat w-4 h-4"></i>,
    CheckCircle: () => <i className="fi fi-rr-check-circle w-4 h-4"></i>
};

export default function AdvisorMessagesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [advisors, setAdvisors] = useState<any[]>([]);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedAdvisorForTransfer, setSelectedAdvisorForTransfer] = useState<number | null>(null);
    const [clientInfo, setClientInfo] = useState<Map<string, any>>(new Map());

    useClientMetadata("/advisor/messages");
    
    const selectedConversationRef = useRef<Conversation | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation?.messages, isTyping]);

    // Sync ref
    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    // Initial Data Loading
    useEffect(() => {
        const loadAdvisors = async () => {
            try {
                const response = await fetch(`${API_URL}/advisor/advisors`);
                const data = await response.json();
                if (data.success) setAdvisors(data.data);
            } catch (error) {
                console.error("Error loading advisors:", error);
            }
        };
        loadAdvisors();
    }, []);

    const loadClientInfo = async (clientId: string) => {
        if (clientInfo.has(clientId)) return;
        try {
            const response = await fetch(`${API_URL}/users/${clientId}`);
            const data = await response.json();
            if (data.success) setClientInfo((prev) => new Map(prev).set(clientId, data.data));
        } catch (error) {
            console.error("Error loading client info:", error);
        }
    };

    const loadConversations = async () => {
        if (!user) return;
        setLoading(true);
        const result = await messageApi.getConversations(parseInt(user.id), "advisor");
        if (result.success && result.data) {
            setConversations(result.data);
            result.data.forEach((conv) => loadClientInfo(conv.clientId));
        }
        setLoading(false);
    };

    useEffect(() => {
        loadConversations();
    }, [user]);

    // WebSocket Setup
    useEffect(() => {
        if (!user) return;
        const newSocket = io(SOCKET_URL, { withCredentials: true, transports: ["websocket"], reconnection: true });

        newSocket.on("connect", () => {
            console.log("Conseiller connecté au WebSocket");
            newSocket.emit("join", { userId: parseInt(user.id), role: "advisor" });
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
                    return { ...prev, messages: [...prev.messages, data.message], lastMessageAt: data.message.createdAt };
                });
                messageApi.markAsRead(data.conversationId, parseInt(user.id));
            }
        });

        newSocket.on("conversation:new", () => loadConversations());
        newSocket.on("conversation:updated", () => loadConversations());
        newSocket.on("conversation:closed", (data) => {setConversations((prev) => prev.map((conv) => (conv.id === data.conversationId ? { ...conv, isClosed: true } : conv)));
        });

        newSocket.on("typing:start", (data) => {
            if (data.conversationId === selectedConversationRef.current?.id && data.userId !== parseInt(user.id)) setIsTyping(true);
        });
        newSocket.on("typing:stop", (data) => {
            if (data.conversationId === selectedConversationRef.current?.id) setIsTyping(false);
        });

        setSocket(newSocket);
        return () => { newSocket.disconnect(); };
    }, [user]);

    // Join room handling
    useEffect(() => {
        if (!socket || !selectedConversation || !user) return;
        socket.emit("join-conversation", selectedConversation.id);
        if (selectedConversation.unreadCount > 0) {
            messageApi.markAsRead(selectedConversation.id, parseInt(user.id));
            setConversations((prev) =>
                prev.map((conv) => conv.id === selectedConversation.id ? { ...conv, unreadCount: 0 } : conv)
            );
        }
        return () => { socket.emit("leave-conversation", selectedConversation.id); };
    }, [socket, selectedConversation, user]);

    // Polling pour recharger les messages toutes les 3 secondes (fallback WebSocket)
    useEffect(() => {
        if (!selectedConversation || !user) return;

        const pollInterval = setInterval(async () => {
            try {
                const result = await messageApi.getConversation(selectedConversation.id);
                if (result.success && result.data) {
                    const newData = result.data;
                    setSelectedConversation((prev) => {
                        if (!prev) return null;
                        // Vérifier s'il y a de nouveaux messages
                        const newMessages = newData.messages.filter(
                            (msg) => !prev.messages.find((m) => m.id === msg.id)
                        );
                        if (newMessages.length > 0) {
                            console.log(`📨 ${newMessages.length} nouveau(x) message(s) détecté(s)`);
                            return {
                                ...prev,
                                messages: newData.messages,
                                lastMessageAt: newData.lastMessageAt,
                            };
                        }
                        return prev;
                    });
                }
            } catch (error) {
                console.error("Erreur polling messages:", error);
            }
        }, 3000); // Recharger tous les 3 secondes

        return () => clearInterval(pollInterval);
    }, [selectedConversation, user]);

    // Handlers
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || !user || isSending) return;
        
        // Vérifier que la conversation est bien assignée à cet advisor
        if (!selectedConversation.isAssigned || selectedConversation.advisorId !== user.id.toString()) {
            return;
        }
        
        setIsSending(true);

        try {
            const result = await messageApi.sendMessage(
                selectedConversation.id,
                parseInt(user.id),
                newMessage,
                parseInt(selectedConversation.clientId)
            );

            if (result.success && result.data) {
                const newMsg = result.data;
                setSelectedConversation((prev) => prev ? { ...prev, messages: [...prev.messages, newMsg], lastMessageAt: newMsg.createdAt } : null);
                setConversations((prev) => prev.map((conv) => conv.id === selectedConversation.id ? { ...conv, messages: [...conv.messages, newMsg], lastMessageAt: newMsg.createdAt } : conv));
                setNewMessage("");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleAssignToMe = async () => {
        if (!selectedConversation || !user) return;
        const result = await messageApi.assignConversation(selectedConversation.id, parseInt(user.id));
        if (result.success) {
            await loadConversations();
            
            // Recharger la conversation sélectionnée pour mettre à jour les infos
            setTimeout(async () => {
                try {
                    const updatedConversation = await messageApi.getConversation(selectedConversation.id);
                    if (updatedConversation.success && updatedConversation.data) {
                        setSelectedConversation(updatedConversation.data);
                    }
                } catch (error) {
                    console.error("Erreur lors du rechargement de la conversation:", error);
                }
            }, 300);
        }
    };

    const handleTransfer = async () => {
        if (!selectedConversation || !selectedAdvisorForTransfer || !user) return;
        const result = await messageApi.transferConversation(selectedConversation.id, selectedAdvisorForTransfer, parseInt(user.id));
        if (result.success) {
            setShowTransferModal(false);
            setSelectedAdvisorForTransfer(null);
            
            // Recharger les conversations immédiatement
            await loadConversations();
            
            // Recharger après un court délai pour synchroniser avec le serveur
            setTimeout(async () => {
                try {
                    await loadConversations();
                } catch (error) {
                    console.error("Erreur lors du rechargement des conversations:", error);
                }
            }, 500);
            
            // Déselectionner la conversation (elle a été transférée)
            setSelectedConversation(null);
        }
    };

    const handleClose = async () => {
        if (!selectedConversation || !user) return;
        if (!confirm("Voulez-vous vraiment clôturer cette conversation ?")) return;
        const result = await messageApi.closeConversation(selectedConversation.id, parseInt(user.id));
        if (result.success) {
            // Recharger les conversations immédiatement
            await loadConversations();
            
            // Recharger la conversation sélectionnée pour mettre à jour le statut
            try {
                const updatedConversation = await messageApi.getConversation(selectedConversation.id);
                if (updatedConversation.success && updatedConversation.data) {
                    setSelectedConversation(updatedConversation.data);
                    
                    // Recharger une deuxième fois après 500ms pour synchroniser complètement
                    setTimeout(async () => {
                        try {
                            const finalConversation = await messageApi.getConversation(selectedConversation.id);
                            if (finalConversation.success && finalConversation.data) {
                                setSelectedConversation(finalConversation.data);
                            }
                        } catch (error) {
                            console.error("Erreur lors du rechargement final:", error);
                        }
                    }, 500);
                }
            } catch (error) {
                console.error("Erreur lors du rechargement de la conversation:", error);
            }
        }
    };

    const handleTyping = () => {
        if (socket && selectedConversation && user) socket.emit("typing:start", { conversationId: selectedConversation.id, userId: parseInt(user.id) });
    };
    
    const handleStopTyping = () => { 
        if (socket && selectedConversation && user) socket.emit("typing:stop", { conversationId: selectedConversation.id, userId: parseInt(user.id) }); 
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

    // Derived Data
    const unassignedConversations = conversations.filter((c) => !c.isAssigned && !c.isClosed);
    const myConversations = conversations.filter((c) => c.isAssigned && c.advisorId === user?.id.toString() && !c.isClosed);
    const closedConversations = conversations.filter((c) => c.isClosed);
    
    const getClientName = (clientId: string) => {
        const client = clientInfo.get(clientId);
        return client ? `${client.firstName} ${client.lastName}` : "Client inconnu";
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Chargement du dashboard...</p>
                </div>
            </div>
        );
    }

    // console.log(advisors);
    // console.log(user.id);

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
            {/* Main Wrapper */}
            <div className="flex-1 flex gap-6 max-w-[1600px] w-full mx-auto md:p-6 p-0 h-full">
                
                {/* LEFT SIDEBAR - Listes des conversations */}
                <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-white md:rounded-2xl md:shadow-xl border border-gray-200 overflow-hidden h-full ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    
                    {/* Header Sidebar */}
                    <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Messagerie Pro</h1>
                                {unassignedConversations.length === 0 ? "" : <div className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full"> {unassignedConversations.length}</div>}
                        </div>
                        {/* <div className="relative">
                            <span className="absolute left-3 top-2.5"><Icons.Search /></span>
                            <input 
                                type="text" disabled placeholder="Rechercher un client..." 
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm text-gray-600 focus:ring-0 cursor-not-allowed opacity-60"
                            />
                        </div> */}
                    </div>

                    {/* Scrollable Conversation Lists */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-6">
                        
                        {/* Section: En attente */}
                        {unassignedConversations.length > 0 && (
                            <div className="space-y-1">
                                <h3 className="px-3 text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">
                                    En attente ({unassignedConversations.length})
                                </h3>
                                {unassignedConversations.map((conv) => (
                                    <ConversationItem 
                                        key={conv.id} 
                                        conv={conv} 
                                        isActive={selectedConversation?.id === conv.id} 
                                        onClick={() => setSelectedConversation(conv)}
                                        clientName={getClientName(conv.clientId)}
                                        statusColor="bg-orange-50 border-orange-100"
                                        textColor="text-orange-900"
                                        activeColor="bg-orange-100 border-orange-200"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Section: Mes conversations */}
                        {myConversations.length > 0 && (
                            <div className="space-y-1">
                                <h3 className="px-3 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                                    💬 Mes conversations ({myConversations.length})
                                </h3>
                                {myConversations.map((conv) => (
                                    <ConversationItem 
                                        key={conv.id} 
                                        conv={conv} 
                                        isActive={selectedConversation?.id === conv.id} 
                                        onClick={() => setSelectedConversation(conv)}
                                        clientName={getClientName(conv.clientId)}
                                        statusColor="bg-emerald-50 border-emerald-100"
                                        textColor="text-emerald-900"
                                        activeColor="bg-emerald-100 border-emerald-200"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Section: Historique */}
                        {closedConversations.length > 0 && (
                            <div className="space-y-1">
                                <h3 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Historique ({closedConversations.length})
                                </h3>
                                {closedConversations.map((conv) => (
                                    <ConversationItem 
                                        key={conv.id} 
                                        conv={conv} 
                                        isActive={selectedConversation?.id === conv.id} 
                                        onClick={() => setSelectedConversation(conv)}
                                        clientName={getClientName(conv.clientId)}
                                        isClosed
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {conversations.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                                <Icons.ChatBubble />
                                <p className="mt-3 text-sm font-medium">Aucune conversation pour le moment</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE - Chat Area */}
                <div className={`flex-1 flex flex-col bg-white md:rounded-2xl md:shadow-xl border border-gray-200 overflow-hidden h-full ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConversation ? (
                        <>
                            {/* Header Chat */}
                            <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-10 sticky top-0 shrink-0">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelectedConversation(null)} className="md:hidden text-gray-500">
                                        <i className="fi fi-rr-angle-left w-6 h-6"></i>
                                    </button>
                                    <AvatarPlaceholder name={getClientName(selectedConversation.clientId)} color="bg-emerald-100 text-emerald-700" />
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{getClientName(selectedConversation.clientId)}</h3>
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

                                {/* Actions Toolbar */}
                                <div className="flex items-center gap-2">
                                    {!selectedConversation.isAssigned ? (
                                        <button onClick={handleAssignToMe} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-xs font-bold transition-all shadow-sm shadow-emerald-200">
                                            <Icons.UserPlus /> Prendre en charge
                                        </button>
                                    ) : (
                                        !selectedConversation.isClosed && selectedConversation.advisorId === user?.id.toString() && (
                                            <>
                                                <button onClick={() => setShowTransferModal(true)} title="Transférer" className="p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors">
                                                    <Icons.ArrowRightLeft />
                                                </button>
                                                <button onClick={handleClose} title="Clôturer" className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                                                    <Icons.CheckCircle />
                                                </button>
                                            </>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-white relative">
                                {selectedConversation.messages.map((msg, idx) => {
                                    const isMe = msg.fromUserId === user?.id.toString();
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
                                                <div className={`px-5 py-3 shadow-sm text-[15px] leading-relaxed relative ${
                                                    isMe 
                                                        ? "bg-emerald-600 text-white rounded-2xl rounded-tr-sm" 
                                                        : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200"
                                                }`}>
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

                            {/* Input Area */}
                            <div className="p-4 md:p-6 bg-white border-t border-gray-100 z-10 shrink-0">
                                {selectedConversation.isClosed ? (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
                                        <Icons.Lock /> <span>Cette conversation est terminée. Vous ne pouvez plus répondre.</span>
                                    </div>
                                ) : !selectedConversation.isAssigned ? (
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-center gap-2 text-orange-600 text-sm">
                                        <Icons.UserPlus />
                                        <span>Vous devez prendre en charge cette conversation pour répondre.</span>
                                    </div>
                                ) : selectedConversation.advisorId !== user?.id.toString() ? (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
                                        <Icons.Lock />
                                        <span>Cette conversation est assignée à un autre conseiller.</span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                                        <input
                                            type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                                            onFocus={handleTyping} onBlur={handleStopTyping}
                                            placeholder="Répondre au client..."
                                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent block w-full p-3.5 pl-4 transition-all"
                                        />
                                        <button type="submit" disabled={!newMessage.trim() || isSending} className="p-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-md shadow-emerald-200">
                                            {isSending ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Icons.Send />}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-50/30">
                            <div className="bg-white p-6 rounded-full shadow-lg shadow-emerald-100 mb-6">
                                <Icons.ChatBubble />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Espace Conseiller</h2>
                            <p className="text-sm mt-2 max-w-xs text-center leading-relaxed">
                                Sélectionnez une demande dans la file d'attente ou reprenez vos conversations.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Transférer la conversation</h3>
                        <p className="text-sm text-gray-500 mb-6">Choisissez un collègue disponible pour reprendre ce dossier.</p>
                        
                        <select
                            value={selectedAdvisorForTransfer || ""}
                            onChange={(e) => setSelectedAdvisorForTransfer(parseInt(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3 mb-6"
                        >
                            <option value="">Sélectionner un conseiller...</option>
                            {/* On convertit les deux ID en String pour être sûr que la comparaison fonctionne */}
                            {advisors
                                .filter((a) => String(a.id) !== String(user?.id))
                                .map((advisor) => (
                                    <option key={advisor.id} value={advisor.id}>
                                        {advisor.firstName} {advisor.lastName}
                                    </option>
                                ))}
                        </select>
                        
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => { setShowTransferModal(false); setSelectedAdvisorForTransfer(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                Annuler
                            </button>
                            <button onClick={handleTransfer} disabled={!selectedAdvisorForTransfer} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors">
                                Confirmer le transfert
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-component for clean rendering of list items
function ConversationItem({ conv, isActive, onClick, clientName, statusColor = "", textColor = "text-gray-900", activeColor = "", isClosed = false }: any) {
    const lastMsg = conv.messages[conv.messages.length - 1];
    
    return (
        <button
            onClick={onClick}
            className={`w-full p-3 flex items-start gap-3 rounded-xl transition-all duration-200 group border ${
                isActive ? (activeColor || "bg-emerald-50 border-emerald-100 shadow-sm") : (statusColor || "bg-white border-transparent hover:bg-gray-50")
            } ${isClosed ? 'opacity-60' : ''}`}
        >
            <div className="relative">
                <AvatarPlaceholder name={clientName} color={isActive ? "bg-emerald-200 text-emerald-800" : undefined} />
                {isClosed && <span className="absolute -bottom-1 -right-1 bg-white text-gray-400 p-0.5 rounded-full shadow-sm"><Icons.Lock /></span>}
            </div>
            
            <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`text-sm font-bold truncate ${textColor}`}>{clientName}</span>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                        {new Date(conv.lastMessageAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <p className={`text-xs truncate leading-relaxed ${conv.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                    {lastMsg?.content || "Nouvelle demande"}
                </p>
            </div>
            
            {conv.unreadCount > 0 && (
                <span className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0 mt-2">
                    {conv.unreadCount}
                </span>
            )}
        </button>
    );
}