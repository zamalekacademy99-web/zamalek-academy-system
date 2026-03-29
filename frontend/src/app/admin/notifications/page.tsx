"use client";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import {
    Bell, User, Phone, Baby, Layers, MessageSquare,
    Clock, CheckCircle, AlertCircle, Loader2, RefreshCw
} from "lucide-react";

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetchApi('/admin/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to load admin notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        setUpdatingId(id);
        try {
            await fetchApi(`/admin/notifications/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Status update failed:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="w-10 h-10 animate-spin text-[#E60000] mb-4" />
                <p className="text-slate-500 font-bold">جاري تحميل التنبيهات...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-[#E60000]" /> مركز الإشعارات (طلبات أولياء الأمور)
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">إدارة طلبات المراجعة، الاستفسارات، وأعذار الغياب</p>
                </div>
                <button
                    onClick={loadNotifications}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <RefreshCw className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            {notifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notifications.map((notif: any) => (
                        <div key={notif.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            {notif.status === 'NEW' && (
                                <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-red-500/10 rounded-full group-hover:bg-red-500/20 transition-colors"></div>
                            )}

                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${notif.status === 'NEW' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {notif.status === 'NEW' ? '🔴 طلب جديد' : '🟠 قيد المراجعة'}
                                    </span>
                                    <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" /> {new Date(notif.created_at).toLocaleString('ar-EG')}
                                    </p>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                {/* Parent Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">ولي الأمر</p>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-bold text-slate-800">{notif.parent?.user?.name}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">رقم الهاتف</p>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-bold text-slate-800">{notif.parent?.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Player Info */}
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">اللاعب</p>
                                        <div className="flex items-center gap-2">
                                            <Baby className="w-4 h-4 text-[#E60000]" />
                                            <span className="text-sm font-black text-slate-900">{notif.player?.first_name} {notif.player?.last_name}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">المجموعة</p>
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-bold text-slate-700">{notif.player?.group?.name || '---'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">نص الرسالة ({notif.type})</p>
                                    <div className="bg-red-50/30 p-4 rounded-xl text-slate-700 text-sm leading-relaxed italic border-r-4 border-[#E60000]">
                                        "{notif.message}"
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 border-t border-slate-100 pt-5 mt-auto">
                                <button
                                    onClick={() => updateStatus(notif.id, 'IN_REVIEW')}
                                    disabled={updatingId === notif.id}
                                    className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    {updatingId === notif.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                                    قيد المراجعة
                                </button>
                                <button
                                    onClick={() => updateStatus(notif.id, 'REPLIED')}
                                    disabled={updatingId === notif.id}
                                    className="flex-1 bg-[#E60000] text-white py-2.5 rounded-xl text-xs font-black hover:bg-black transition-colors flex items-center justify-center gap-2"
                                >
                                    {updatingId === notif.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    تم الرد / إغلاق
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Bell className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-400">لا توجد طلبات معلقة حالياً</h3>
                    <p className="text-slate-400 mt-2 font-medium">سيتم عرض طلبات أولياء الأمور الجديدة هنا فور وصولها.</p>
                </div>
            )}
        </div>
    );
}
