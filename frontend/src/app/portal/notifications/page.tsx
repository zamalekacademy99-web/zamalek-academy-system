"use client";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Bell, MessageCircle, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function PortalNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadContent = async () => {
        try {
            const [notifRes, msgRes] = await Promise.all([
                fetchApi('/parent/notifications'),
                // We need parentId to fetch messages. In a real app we'd have this in context.
                // For now, we fetch dashboard to get parentId.
                fetchApi('/parent/dashboard').then(async d => {
                    if (d.data.parent_id) {
                        return fetchApi(`/messages/parent/${d.data.parent_id}`);
                    }
                    return { data: [] };
                })
            ]);

            setNotifications(notifRes.data || []);
            setMessages(msgRes.data || []);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContent();
    }, []);

    const markRead = async (id: string, isMessage: boolean) => {
        try {
            if (isMessage) {
                await fetchApi(`/messages/${id}/read`, { method: 'PATCH' });
                setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
            } else {
                // Assuming system notifications also have a read endpoint
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            }
        } catch (err) { }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#E60000]" />
            </div>
        );
    }

    const allItems = [
        ...notifications.map(n => ({ ...n, itemType: 'NOTIFICATION' })),
        ...messages.map(m => ({ ...m, itemType: 'MESSAGE' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-[#E60000]" /> مركز الإشعارات
                </h1>
                <span className="text-xs font-bold text-slate-500">{allItems.length} إشعار</span>
            </div>

            {allItems.length > 0 ? (
                <div className="space-y-3">
                    {allItems.map((item: any) => {
                        const isMsg = item.itemType === 'MESSAGE';
                        const isRead = item.is_read;

                        return (
                            <div
                                key={item.id}
                                className={`group relative p-4 rounded-2xl border transition-all ${isRead ? 'bg-white border-slate-200 opacity-80' : 'bg-red-50/50 border-red-100 ring-1 ring-red-50'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`mt-1 p-2 rounded-xl shrink-0 ${isMsg ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {isMsg ? <MessageCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm font-black truncate ${isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                                                {isMsg ? (item.sender === 'COACH' ? 'رسالة من المدرب' : 'رسالة من الإدارة') : item.title}
                                            </h4>
                                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                        {isMsg && item.player && (
                                            <p className="text-[10px] font-black text-[#E60000] mb-1">
                                                بخصوص: {item.player.first_name} {item.player.last_name}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {item.message}
                                        </p>
                                        {!isRead && (
                                            <button
                                                onClick={() => markRead(item.id, isMsg)}
                                                className="mt-3 text-[10px] font-black text-[#E60000] flex items-center gap-1 hover:underline"
                                            >
                                                <CheckCircle2 className="w-3 h-3" /> تم القراءة
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                    <p className="text-slate-400 font-black text-sm">لا توجد إشعارات أو رسائل حالية.</p>
                </div>
            )}
        </div>
    );
}
