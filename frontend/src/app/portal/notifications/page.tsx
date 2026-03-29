"use client";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import {
    Bell, Clock, CheckCircle,
    Info, Loader2, Sparkles, Zap
} from "lucide-react";

export default function PortalNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetchApi('/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

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
            // Refresh counts in layout if necessary (handled by layout's own interval)
        } catch (e) { }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80">
                <Loader2 className="w-8 h-8 animate-spin text-[#E60000] mb-3" />
                <p className="text-slate-400 font-bold">جاري تحميل الإشعارات...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Bell className="w-7 h-7 text-[#E60000]" /> مركز التنبيهات
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">تابع أهم التحديثات من إدارة الأكاديمية</p>
                </div>
                <button onClick={loadNotifications} className="p-2 bg-white rounded-xl border border-slate-200">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                </button>
            </div>

            {notifications.length > 0 && (
                <button
                    onClick={markAllRead}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-black transition-all"
                >
                    تعميم القراءة (Mark all as read)
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
                                className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${notif.is_read ? 'bg-white border-slate-100 opacity-75' :
                                    isUrgent ? 'bg-red-50 border-red-200 shadow-sm' :
                                        isImportant ? 'bg-orange-50 border-orange-200 shadow-sm' :
                                            'bg-white border-white shadow-sm'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isUrgent ? 'bg-red-100 text-red-600' :
                                        isImportant ? 'bg-orange-100 text-orange-600' :
                                            'bg-blue-50 text-blue-500'
                                        }`}>
                                        {isUrgent ? <Zap className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`font-black text-sm ${isUrgent ? 'text-red-900' : 'text-slate-800'}`}>
                                                {notif.title || 'تنبيـه هـام'}
                                            </h3>
                                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(notif.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                        <p className={`text-xs leading-relaxed font-medium ${isUrgent ? 'text-red-700' : 'text-slate-600'}`}>
                                            {notif.message}
                                        </p>

                                        {!notif.is_read && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="mt-3 text-[10px] font-black text-[#E60000] hover:underline flex items-center gap-1"
                                            >
                                                <CheckCircle className="w-3 h-3" /> تم الاطلاع
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <Bell className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-400">لا توجد إشعارات جديدة</h3>
                        <p className="text-xs text-slate-400 font-medium">سنقوم بإخطارك هنا عند وجود أي تحديثات تخص أبنائك.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
