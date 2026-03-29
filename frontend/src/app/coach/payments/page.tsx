"use client";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import {
    Plus, Search, DollarSign,
    Calendar, User, CreditCard,
    Loader2, CheckCircle2, XCircle
} from "lucide-react";

export default function CoachPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        player_id: "",
        amount: "",
        method: "CASH",
        notes: ""
    });

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Get Coach Profile for ID
            const profileRes = await fetchApi('/coaches/profile');
            const coachId = profileRes.data.user_id;

            // 2. Fetch payments recorded by this coach
            const payRes = await fetchApi(`/payments?recorder_id=${coachId}`);
            setPayments(payRes.data || []);

            // 3. Fetch players for the dropdown (accessible to this coach)
            const playerRes = await fetchApi('/players');
            setPlayers(playerRes.data || []);
        } catch (err) {
            console.error("Failed to load payments data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.player_id || !formData.amount) return;

        setSubmitting(true);
        try {
            await fetchApi('/payments', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            });
            setShowModal(false);
            setFormData({ player_id: "", amount: "", method: "CASH", notes: "" });
            loadData();
        } catch (err) {
            alert("فشل تسجيل الدفعة: " + (err as any).message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-[#E60000] mb-4" />
                <p className="text-slate-500 font-black">جاري تحميل السجلات المالية...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            {/* Header / Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <DollarSign className="w-7 h-7 text-green-600" /> تحصيل الاشتراكات
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">إجمالي المبالغ المحصلة بوساطتك: <span className="text-green-600 font-black">{payments.reduce((sum, p) => sum + Number(p.amount), 0)} ج.م</span></p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#E60000] text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-red-500/20"
                >
                    <Plus className="w-5 h-5" /> تسجيل دفعة جديدة
                </button>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <h3 className="font-black text-slate-800">آخر العمليات المسجلة</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">اللاعب</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">المبلغ</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">الطريقة</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">التاريخ</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-slate-800">{p.player?.first_name} {p.player?.last_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-black text-green-600">{p.amount} ج.م</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black ${p.method === 'CASH' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {p.method === 'CASH' ? 'نقدي' : 'تحويل'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-slate-500 font-bold">
                                        {new Date(p.date).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td className="p-4 text-xs text-slate-400 font-medium max-w-[150px] truncate">
                                        {p.notes || "—"}
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-slate-400 font-bold">لا توجد دفعات مسجلة باسمك حالياً.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black">تسجيل معاملة مالية</h2>
                                <p className="text-slate-400 text-xs mt-1">تأكد من استلام المبلغ قبل الحفظ</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleRecordPayment} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 mb-2 mr-1 tracking-wider uppercase">اختيار اللاعب</label>
                                    <div className="relative">
                                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            required
                                            value={formData.player_id}
                                            onChange={(e) => setFormData({ ...formData, player_id: e.target.value })}
                                            className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all appearance-none font-bold text-slate-800"
                                        >
                                            <option value="">اختر اللاعب من القائمة...</option>
                                            {players.map(pl => (
                                                <option key={pl.id} value={pl.id}>{pl.first_name} {pl.last_name} ({pl.group?.name})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 mb-2 mr-1 tracking-wider uppercase">المبلغ (ج.م)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                            <input
                                                type="number"
                                                required
                                                placeholder="0.00"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all font-black text-lg text-slate-800"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 mb-2 mr-1 tracking-wider uppercase">طريقة الدفع</label>
                                        <div className="relative">
                                            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                            <select
                                                value={formData.method}
                                                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                                className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all appearance-none font-bold text-slate-800"
                                            >
                                                <option value="CASH">نقدي</option>
                                                <option value="BANK_TRANSFER">تحويل بنكي</option>
                                                <option value="VODAFONE_CASH">فودافون كاش</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-500 mb-2 mr-1 tracking-wider uppercase">ملاحظات إضافية</label>
                                    <textarea
                                        rows={2}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all font-medium text-slate-800"
                                        placeholder="مثال: دفعة شهر مارس 2024"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-5 bg-[#E60000] text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> حفظ وتسجيل المعاملة</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
