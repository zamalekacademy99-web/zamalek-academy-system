"use client";
import { useState, useEffect } from "react";
import { Send, Clock, Users, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminNotifications() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('ALERT');
    const [targetType, setTargetType] = useState('ALL');
    const [targetId, setTargetId] = useState('');

    const [branches, setBranches] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [statusData, setStatusData] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [bRes, gRes, hRes] = await Promise.all([
                fetchApi('/branches'),
                fetchApi('/groups'),
                fetchApi('/notifications/history')
            ]);
            setBranches(bRes.data || []);
            setGroups(gRes.data || []);
            setHistory(hRes.data || []);
        } catch (e) {
            console.error("Failed to load notifications data", e);
        }
    };

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            setStatusData({ type: 'error', message: 'يرجى إدخال عنوان ومحتوى الإشعار' });
            return;
        }
        if ((targetType === 'BRANCH' || targetType === 'GROUP') && !targetId) {
            setStatusData({ type: 'error', message: 'يرجى تحديد الفرع أو المجموعة المستهدفة' });
            return;
        }

        setLoading(true);
        setStatusData(null);

        try {
            const res = await fetchApi('/notifications', {
                method: 'POST',
                body: JSON.stringify({ title, message, type, targetType, targetId })
            });

            if (res.status === 'success') {
                setStatusData({ type: 'success', message: `تم إرسال الإشعار بنجاح إلى ${res.data.sent_count} مستخدم` });
                setTitle('');
                setMessage('');
                loadData(); // Refresh history
            }
        } catch (error: any) {
            setStatusData({ type: 'error', message: error.message || 'فشل إرسال الإشعار' });
        } finally {
            setLoading(false);
            setTimeout(() => setStatusData(null), 5000); // Clear after 5s
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">مرسل الإشعارات المتقدم</h1>
                    <p className="text-sm text-slate-500 mt-1">إرسال التنبيهات لأولياء الأمور مباشرة داخل التطبيق.</p>
                </div>
            </div>

            {statusData && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border ${statusData.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {statusData.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="font-semibold text-sm">{statusData.message}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-3">إشعار جديد</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">نوع الإشعار <span className="text-[#E60000]">*</span></label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E60000] outline-none bg-slate-50 text-slate-800"
                            >
                                <option value="ALERT">تنبيه هام</option>
                                <option value="SYSTEM">إعلان عام</option>
                                <option value="REMINDER">تذكير (موعد/دفع)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">الفئة المستهدفة <span className="text-[#E60000]">*</span></label>
                            <select
                                value={targetType}
                                onChange={e => {
                                    setTargetType(e.target.value);
                                    setTargetId('');
                                }}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E60000] outline-none bg-slate-50 text-slate-800"
                            >
                                <option value="ALL">جميع أولياء الأمور</option>
                                <option value="BRANCH">فرع محدد</option>
                                <option value="GROUP">مجموعة محددة</option>
                            </select>
                        </div>
                    </div>

                    {(targetType === 'BRANCH' || targetType === 'GROUP') && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">تحديد {targetType === 'BRANCH' ? 'الفرع' : 'المجموعة'} <span className="text-[#E60000]">*</span></label>
                            <select
                                value={targetId}
                                onChange={e => setTargetId(e.target.value)}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E60000] outline-none bg-slate-50 text-slate-800"
                            >
                                <option value="">اختر من القائمة...</option>
                                {targetType === 'BRANCH'
                                    ? branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)
                                    : groups.map(g => <option key={g.id} value={g.id}>{g.name} - {g.age_category}</option>)
                                }
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">عنوان الإشعار <span className="text-[#E60000]">*</span></label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E60000] outline-none text-slate-800"
                            placeholder="مثال: تغيير موعد تدريب اليوم"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">محتوى الإشعار <span className="text-[#E60000]">*</span></label>
                        <textarea
                            rows={4}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E60000] outline-none resize-none text-slate-800"
                            placeholder="اكتب تفاصيل الإشعار هنا..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="bg-[#E60000] text-sm font-bold text-white px-8 py-3 rounded-xl hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"
                        >
                            <Send className="w-4 h-4" />
                            {loading ? 'جاري الإرسال...' : 'إرسال الإشعار الآن'}
                        </button>
                    </div>
                </div>

                {/* Sidebar Status / History */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-sm mb-5 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            سجل الإرسال الأخير
                        </h3>

                        <div className="space-y-5">
                            {history.length > 0 ? history.map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'ALERT' ? 'bg-red-100 text-[#E60000]' :
                                            item.type === 'SYSTEM' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {item.type === 'ALERT' ? <ShieldAlert className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</p>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {new Date(item.created_at).toLocaleDateString('ar-EG')} • تم الإرسال لمرة {item.count}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-500 text-center py-4">لا يوجد إشعارات مرسلة بعد.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
