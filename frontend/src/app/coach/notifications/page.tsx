"use client";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import {
    Bell, Clock, CheckCircle,
    Info, Loader2, RefreshCw, Zap
} from "lucide-react";

export default function CoachNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetchApi('/parent/notifications'); // Reusing the list endpoint for all users
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
        } catch (err) { }
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
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Bell className="w-7 h-7 text-[#E60000]" /> مركز التنبيهات (Coach)
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">الرسائل الإدارية وتحديثات النظام</p>
                </div>
                <button onClick={loadNotifications} className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                    <RefreshCw className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            {notifications.length > 0 && (
                <button
                    onClick={markAllRead}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" /> تعميم القراءة على جميع التنبيهات
                </button>
            )}

            {notifications.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((notif) => {
                        const isUrgent = notif.priority === 'URGENT';
                        const isImportant = notif.priority === 'IMPORTANT';

                        return (
                            <div
                                key={notif.id}
                                className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden flex gap-5 ${notif.is_read ? 'bg-white border-slate-100 opacity-75' :
                                        isUrgent ? 'bg-red-50 border-red-200 shadow-md' :
                                            isImportant ? 'bg-orange-50 border-orange-200 shadow-md' :
                                                'bg-white border-white shadow-sm'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isUrgent ? 'bg-red-100 text-red-600' :
                                        isImportant ? 'bg-orange-100 text-orange-600' :
                                            'bg-slate-100 text-slate-500'
                                    }`}>
                                    {isUrgent ? <Zap className="w-7 h-7" /> : <Info className="w-7 h-7" />}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-black text-base ${isUrgent ? 'text-red-900' : 'text-slate-800'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(notif.created_at).toLocaleString('ar-EG')}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed font-medium ${isUrgent ? 'text-red-700' : 'text-slate-600'}`}>
                                        {notif.message}
                                    </p>

                                    {!notif.is_read && (
                                        <button
                                            onClick={() => markAsRead(notif.id)}
                                            className="mt-4 text-xs font-black text-[#E60000] hover:underline flex items-center gap-1"
                                        >
                                            <CheckCircle className="w-4 h-4" /> وضع علامة مقروء
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center space-y-4">
                    <Bell className="w-12 h-12 text-slate-200 mx-auto" />
                    <h3 className="text-xl font-black text-slate-300 italic">لا توجد تنبيهات جديدة للمدرب</h3>
                </div>
            )}
        </div>
    );
}
