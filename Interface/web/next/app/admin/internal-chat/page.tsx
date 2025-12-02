"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/contexts/AuthContext";
import { io, Socket } from "socket.io-client";
import { internalMessageApi, type InternalMessage, type StaffMember } from "@/components/lib/api/internal-message.service";
import '@flaticon/flaticon-uicons/css/all/all.css';

const SOCKET_URL = (
    process.env.NEXT_PUBLIC_WS_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
).replace(/\/api\/?$/, "");

// --- Composants UI internes ---

const AvatarPlaceholder = ({ name, role }: { name: string; role: string }) => {
    const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    
    // Directeur = Ambre/Or, Conseiller = Gris/Neutre
    const style = role === "director" 
        ? "bg-linear-to-br from-amber-400 to-amber-600 text-white ring-2 ring-amber-100 shadow-amber-200" 
        : "bg-slate-100 text-slate-600";

    return (
        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${style}`}>
            {initials || "?"}
        </div>
    );
};

export default function AdminInternalChatPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [messages, setMessages] = useState<InternalMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
    const [staffMemberDetails, setStaffMemberDetails] = useState<Map<number, StaffMember>>(new Map());

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // --- FONCTION DE CORRECTION (Normalisation des données BDD vs Frontend) ---
    const formatMessage = (data: any): InternalMessage => {
        return {
            id: data.id,
            // Gestion fromUserId (camelCase) OU from_user_id (snake_case)
            fromUserId: data.fromUserId ?? data.from_user_id, 
            toUserId: data.toUserId ?? data.to_user_id,
            content: data.content,
            isGroupMessage: data.isGroupMessage ?? (data.is_group_message === 1 || data.is_group_message === true),
            isRead: data.isRead ?? (data.is_read === 1 || data.is_read === true),
            createdAt: data.createdAt ?? data.created_at
        };
    };

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]);

    // Initialisation
    useEffect(() => {
        if (!user) return;
        if (user.role !== "director") {
            window.location.href = "/"; // Sécurité redirection
            return;
        }

        const loadData = async () => {
            try {
                // 1. Membres
                const resMembers = await internalMessageApi.getStaffMembers();
                
                if (resMembers.success && resMembers.data) {
                    setStaffMembers(resMembers.data);
                    const map = new Map<number, StaffMember>();
                    resMembers.data.forEach((m: StaffMember) => map.set(m.id, m));
                    setStaffMemberDetails(map);
                }

                // 2. Messages
                const resMsg = await internalMessageApi.getMessages(user.id.toString(), "group");

                if (resMsg.success && resMsg.data) {
                    // CORRECTION ICI : On formate les messages reçus de la BDD
                    const cleanMessages = resMsg.data.map(formatMessage);
                    setMessages(cleanMessages);
                }
            } catch (error) {
                console.error("Erreur chargement:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // WebSocket Logic
    useEffect(() => {
        if (!user) return;

        const newSocket = io(SOCKET_URL, { withCredentials: true, transports: ["websocket"], reconnection: true });

        newSocket.on("connect", () => {
            console.log("✅ Admin WebSocket connecté");
            newSocket.emit("join", { userId: user.id, role: user.role });
        });

        newSocket.on("internal_message:new", (rawMessage: any) => {
            // CORRECTION ICI : On formate aussi le message entrant
            const message = formatMessage(rawMessage);

            if (message.isGroupMessage) {
                setMessages((prev) => {
                    // Eviter doublons
                    if (prev.some(m => m.id === message.id)) return prev;
                    
                    // On ignore nos propres messages reçus par socket (car gérés par l'UI optimiste)
                    // Conversion String pour être sûr
                    if (String(message.fromUserId) === String(user.id)) return prev;

                    return [...prev, message];
                });
            }
        });

        newSocket.on("internal_typing:start", ({ userId }: { userId: number }) => {
            if (userId.toString() !== user.id) setTypingUsers((prev) => new Set(prev).add(userId));
        });

        newSocket.on("internal_typing:stop", ({ userId }: { userId: number }) => {
            setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        });

        setSocket(newSocket);
        return () => { newSocket.disconnect(); };
    }, [user]);

    // Envoi Message (Optimistic UI)
    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !user || isSending) return;

        setIsSending(true);
        const content = newMessage.trim();
        setNewMessage(""); // Clear immédiat

        // Ajout optimiste
        const tempMsg: InternalMessage = {
            id: Date.now(),
            fromUserId: parseInt(user.id),
            toUserId: null,
            content: content,
            isGroupMessage: true,
            isRead: true,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        // Stop typing
        socket?.emit("internal_typing:stop", { userId: user.id, targetUserId: null });

        try {
            await internalMessageApi.sendMessage(user.id.toString(), content, true);
        } catch (error) {
            console.error("Erreur envoi:", error);
            // Ici on pourrait rollback si besoin
        } finally {
            setIsSending(false);
        }
    };

    // Typing
    const handleTyping = () => {
        if (!socket || !user) return;
        socket.emit("internal_typing:start", { userId: user.id, targetUserId: null });
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("internal_typing:stop", { userId: user.id, targetUserId: null });
        }, 2000);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Chargement du QG...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
            <div className="flex-1 flex gap-6 max-w-[1600px] w-full mx-auto md:p-6 p-0 h-full">
                
                {/* LEFT SIDEBAR - Liste des membres */}
                <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white md:rounded-2xl md:shadow-xl border border-gray-200 overflow-hidden h-full md:flex">
                    
                    {/* Header Sidebar */}
                    <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Direction</h1>
                            <div className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                Admin
                            </div>
                        </div>
                        <div className="bg-linear-to-r from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100 flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm text-amber-500">
                                <i className="flaticon-users"></i>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Équipe Active</p>
                                <p className="text-xs text-amber-700">{staffMembers.length} collaborateurs</p>
                            </div>
                        </div>
                    </div>

                    {/* Liste Membres */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {staffMembers.map((member) => (
                            <div key={member.id} className="p-3 flex items-center gap-3 rounded-xl hover:bg-gray-50 transition-colors cursor-default group">
                                <div className="relative">
                                    <AvatarPlaceholder name={member.fullName} role={member.role} />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-amber-600 transition-colors">
                                            {member.fullName}
                                        </p>
                                        {member.role === "director" && (
                                            <span className="text-amber-500" title="Directeur"><i className="flaticon-crown text-xs"></i></span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {member.role === "director" ? "Directeur" : "Conseiller"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE - Chat Group */}
                <div className="flex-1 flex flex-col bg-white md:rounded-2xl md:shadow-xl border border-gray-200 overflow-hidden h-full">
                    
                    {/* Header Chat */}
                    <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-10 sticky top-0 shrink-0">
                        <div className="flex items-center gap-3">
                            {/* <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <i className="flaticon-users text-lg"></i>
                            </div> */}
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Canal Général</h3>
                                <p className="text-xs text-gray-500">Discussion de groupe • Tous les membres</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 relative">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <div className="bg-white p-4 rounded-full shadow-sm mb-3"><i className="flaticon-comment text-2xl text-amber-200"></i></div>
                                <p className="text-sm font-medium">Aucun message pour le moment.</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const sender = staffMemberDetails.get(msg.fromUserId);
                                const isMe = user ? String(msg.fromUserId) === String(user.id) : false;
                                const isDirector = sender?.role === "director";

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isMe ? "items-end" : "items-start"}`}>
                                            
                                            {!isMe && (
                                                <div className="flex items-center gap-1.5 mb-1 ml-1">
                                                    <span className="text-[11px] font-bold text-gray-600">{sender?.firstName || `Utilisateur ${msg.fromUserId}`}</span>
                                                    {isDirector && <i className="flaticon-crown text-[10px] text-amber-500"></i>}
                                                </div>
                                            )}

                                            <div className={`px-5 py-3 shadow-sm text-[15px] leading-relaxed relative rounded-2xl 
                                                ${isMe 
                                                    ? "bg-purple-700 text-white rounded-tr-sm"
                                                    : isDirector
                                                        ? "bg-amber-50 text-amber-900 border border-amber-100 rounded-tl-sm"
                                                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                                                }
                                            `}>
                                                {msg.content}
                                            </div>
                                            
                                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Typing Indicator */}
                        {typingUsers.size > 0 && (
                            <div className="flex items-center gap-2 ml-2">
                                <div className="bg-gray-100 rounded-full px-3 py-2 shadow-sm border border-gray-200">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <span className="relative flex h-2 w-2 mr-1">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        {Array.from(typingUsers).map(id => staffMemberDetails.get(id)?.firstName).join(", ")} écrit...
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-6 bg-white border-t border-gray-100 z-10 shrink-0">
                        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                                placeholder="Message à l'équipe..."
                                className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full p-3.5 pl-4 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || isSending}
                                className="p-3.5 bg-purple-700 text-white rounded-xl hover:bg-purple-800 focus:ring-4 focus:ring-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-200 flex items-center justify-center w-12 h-12"
                            >
                                {isSending ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <i className="fi fi-rr-paper-plane"></i>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}