"use client";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import {
    Bell, User, Phone, Baby, Layers, MessageSquare,
    Clock, CheckCircle, AlertCircle, Loader2, RefreshCw,
    Send, MapPin, Users as UsersIcon, Megaphone, Zap
} from "lucide-react";

export default function AdminNotificationsPage() {
    // Broadcast State
    const [broadcast, setBroadcast] = useState({
        title: "",
        message: "",
        targetType: "ALL",
        targetId: "",
        priority: "NORMAL"
    });
    const [branches, setBranches] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [sending, setSending] = useState(false);

    // List State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const [notifRes, branchRes, groupRes] = await Promise.all([
                fetchApi('/admin/notifications'),
                fetchApi('/branches'),
                fetchApi('/groups')
            ]);
            setNotifications(notifRes.data || []);
            setBranches(branchRes.data || []);
            setGroups(groupRes.data || []);
        } catch (err) {
            console.error('Failed to load admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!broadcast.title || !broadcast.message) return;
        setSending(true);
        try {
            await fetchApi('/notifications', {
                method: 'POST',
                body: JSON.stringify(broadcast)
            });
            alert('تم إرسال البث بنجاح');
            setBroadcast({ ...broadcast, title: "", message: "" });
        } catch (err) {
            alert('فشل إرسال البث');
        } finally {
            setSending(false);
        }
    };

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

    const templates = [
        { label: "إلغاء تدريب", title: "تنبيه: إلغاء التدريب اليوم", message: "نعتذر عن إلغاء تدريب اليوم لظروف طارئة. سيتم التعويض في موعد لاحق." },
        { label: "تأجيل مباراة", title: "تنبيه: تأجيل المباراة", message: "تم تأجيل مباراة الأسبوع القادم نظراً لتغييرات في جدول المواعيد الرسمي." },
        { label: "تذكير بالمصاريف", title: "تنبيه: تذكير بسداد الاشتراكات", message: "نذكركم بضرورة سداد اشتراك الشهر الحالي لضمان استمرارية اللاعب في التمارين." }
    ];

    const applyTemplate = (t: any) => {
        setBroadcast(prev => ({ ...prev, title: t.title, message: t.message }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="w-10 h-10 animate-spin text-[#E60000] mb-4" />
                <p className="text-slate-500 font-bold">جاري تحميل البيانات...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic">
                        <Bell className="w-9 h-9 text-[#E60000]" /> مركز الإشعارات <span className="text-slate-300 font-light">v1.1.0</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">إدارة التواصل الجماعي والرد على استفسارات أولياء الأمور</p>
                </div>
                <button
                    onClick={loadData}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors shadow-sm"
                >
                    <RefreshCw className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Broadcast Hub (Admin Tools) */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border-4 border-slate-800">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E60000]/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Megaphone className="w-6 h-6 text-[#E60000]" />
                                <h2 className="text-xl font-black uppercase tracking-wider">Broadcast Hub</h2>
                            </div>

                            <form onSubmit={handleBroadcast} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase">توجيه البث إلى</label>
                                    <select
                                        value={broadcast.targetType}
                                        onChange={e => setBroadcast({ ...broadcast, targetType: e.target.value, targetId: "" })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 h-12 text-sm font-bold focus:ring-2 focus:ring-[#E60000] outline-none transition-all"
                                    >
                                        <option value="ALL">كل الأكاديمية</option>
                                        <option value="BRANCH">فرع معين</option>
                                        <option value="GROUP">مجموعة معينة</option>
                                        <option value="COACHES">كل المدربين</option>
                                    </select>
                                </div>

                                {broadcast.targetType === 'BRANCH' && (
                                    <select
                                        required
                                        value={broadcast.targetId}
                                        onChange={e => setBroadcast({ ...broadcast, targetId: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 h-12 text-sm font-bold animate-in fade-in slide-in-from-top-2"
                                    >
                                        <option value="">اختر الفرع...</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                )}

                                {broadcast.targetType === 'GROUP' && (
                                    <select
                                        required
                                        value={broadcast.targetId}
                                        onChange={e => setBroadcast({ ...broadcast, targetId: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 h-12 text-sm font-bold animate-in fade-in slide-in-from-top-2"
                                    >
                                        <option value="">اختر المجموعة...</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.branch?.name})</option>)}
                                    </select>
                                )}

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase">مستوى الأهمية (Urgency)</label>
                                    <div className="flex gap-2">
                                        {['NORMAL', 'IMPORTANT', 'URGENT'].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setBroadcast({ ...broadcast, priority: p })}
                                                className={`flex-1 h-10 rounded-xl text-[10px] font-black transition-all border-2 ${broadcast.priority === p
                                                        ? 'border-[#E60000] bg-[#E60000]/10 text-white'
                                                        : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600'
                                                    }`}
                                            >
                                                {p === 'NORMAL' ? 'عادي' : p === 'IMPORTANT' ? 'هام' : 'عاجل'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <input
                                        required
                                        placeholder="عنوان التنبيه"
                                        value={broadcast.title}
                                        onChange={e => setBroadcast({ ...broadcast, title: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 h-12 text-sm font-bold focus:ring-2 focus:ring-[#E60000] outline-none"
                                    />
                                </div>

                                <div>
                                    <textarea
                                        required
                                        placeholder="محتوى البث..."
                                        rows={4}
                                        value={broadcast.message}
                                        onChange={e => setBroadcast({ ...broadcast, message: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#E60000] outline-none resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    disabled={sending}
                                    className="w-full bg-[#E60000] hover:bg-black transition-all py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl"
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    إرسال البث الجماعي
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* Quick Templates */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <h3 className="font-black text-slate-900 text-sm">القوالب الجاهزة</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {templates.map((t, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => applyTemplate(t)}
                                    className="text-right px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-red-50 hover:border-red-100 transition-all text-xs font-bold text-slate-700"
                                >
                                    + {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Parent Requests List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            طلبات أولياء الأمور المعلقة
                        </h2>
                        <span className="bg-red-100 text-[#E60000] px-3 py-1 rounded-full text-xs font-black">
                            {notifications.length} طلب
                        </span>
                    </div>

                    {notifications.length > 0 ? (
                        <div className="space-y-4">
                            {notifications.map((notif: any) => (
                                <div key={notif.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${notif.status === 'NEW' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {notif.status === 'NEW' ? '🟡 PENDING' : '🟠 IN REVIEW'}
                                                </span>
                                                <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {new Date(notif.created_at).toLocaleString('ar-EG')}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">ولي الأمر</p>
                                                    <p className="font-black text-slate-900">{notif.parent?.user?.name}</p>
                                                    <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {notif.parent?.phone}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">اللاعب</p>
                                                    <p className="font-black text-slate-900 flex items-center gap-1">
                                                        <Baby className="w-4 h-4 text-[#E60000]" /> {notif.player?.first_name} {notif.player?.last_name}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">المجموعة</p>
                                                    <p className="font-black text-slate-700 flex items-center gap-1">
                                                        <Layers className="w-4 h-4 text-blue-500" /> {notif.player?.group?.name || '---'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 p-4 rounded-2xl border-r-4 border-[#E60000]">
                                                <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">نوع الطلب: {notif.type}</p>
                                                <p className="text-sm font-medium text-slate-700 italic leading-relaxed">
                                                    "{notif.message}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="md:w-48 flex flex-col gap-2 justify-center">
                                            <button
                                                onClick={() => updateStatus(notif.id, 'IN_REVIEW')}
                                                disabled={updatingId === notif.id}
                                                className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl text-xs font-black hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {updatingId === notif.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                                                مراجعة
                                            </button>
                                            <button
                                                onClick={() => updateStatus(notif.id, 'REPLIED')}
                                                disabled={updatingId === notif.id}
                                                className="w-full bg-black text-white py-3 rounded-2xl text-xs font-black hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                            >
                                                {updatingId === notif.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                إغلاق الطلب
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                            <h3 className="text-xl font-black text-slate-300 italic">لا توجد طلبات معلقة</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
