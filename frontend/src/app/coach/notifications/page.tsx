"use client";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import {
    Bell, Clock, CheckCircle,
    Info, Loader2, Sparkles, Zap
} from "lucide-react";

export default function CoachNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            // Updated to generic endpoint that works for Coaches too
            const res = await fetchApi('/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadNotifications(); }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) { }
    };

    const markAllRead = async () => {
        try {
            await fetchApi('/notifications/read-all', { method: 'PATCH' });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (e) { }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80">
                <Loader2 className="w-8 h-8 animate-spin text-[#E60000] mb-3" />
                <p className="text-slate-400 font-bold">جاري تحميل التنبيهات...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Bell className="w-7 h-7 text-[#E60000]" /> مركز التنبيهات (Coach)
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium italic">تنبيهات الإدارة والتعليمات الفنية</p>
                </div>
                <button
                    onClick={loadNotifications}
                    className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                >
                    <Sparkles className="w-5 h-5 text-orange-400" />
                </button>
            </div>

            {notifications.length > 0 && (
                <button
                    onClick={markAllRead}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-4 h-4" /> تعليم كـ "مقروءة" للكل (Clear All)
                </button>
            )}

            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((notif) => {
                        const isUrgent = notif.priority === 'URGENT';
                        const isImportant = notif.priority === 'IMPORTANT';

                        return (
                            <div
                                key={notif.id}
                                className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden shadow-sm ${notif.is_read ? 'bg-white/50 border-slate-100 grayscale-[0.5]' :
                                        isUrgent ? 'bg-red-50 border-red-200' :
                                            isImportant ? 'bg-orange-50 border-orange-200' :
                                                'bg-white border-white'
                                    }`}
                            >
                                <div className="flex gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isUrgent ? 'bg-red-500 text-white' :
                                            isImportant ? 'bg-orange-400 text-white' :
                                                'bg-slate-900 text-white'
                                        }`}>
                                        {isUrgent ? <Zap className="w-7 h-7" /> : <Info className="w-7 h-7" />}
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className={`font-black text-base ${isUrgent ? 'text-red-900' : 'text-slate-800'}`}>
                                                    {notif.title || 'تنبيـه هـام'}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isUrgent ? 'bg-red-600 text-white' :
                                                            isImportant ? 'bg-orange-500 text-white' :
                                                                'bg-slate-500 text-white'
                                                        }`}>
                                                        {notif.priority || 'NORMAL'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {new Date(notif.created_at).toLocaleString('ar-EG')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className={`text-sm leading-relaxed font-bold ${isUrgent ? 'text-red-700' : 'text-slate-600'}`}>
                                            {notif.message}
                                        </p>

                                        {!notif.is_read && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="mt-4 px-4 py-2 border-2 border-slate-200 text-slate-600 rounded-xl text-[11px] font-black hover:bg-slate-900 hover:text-white hover:border-slate-900 transition flex items-center gap-1.5 w-fit"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" /> تم الاطلاع
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-[32px] p-20 text-center space-y-5 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <Bell className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-400 font-arabic">لا توجد إشعارات حالياً</h3>
                        <p className="text-sm text-slate-400 font-medium">سيتم إخطارك هنا بأي تعليمات جديدة من الإدارة.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
