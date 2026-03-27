"use client";
import { useState, useEffect } from "react";
import { Plus, Search, FileText, TrendingUp, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Player = { id: string; first_name: string; last_name: string };
type Payment = { id: string; player: Player; amount: number; method: string; notes: string; date: string; reference_no: string; recorder: { name: string } };

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        player_id: "",
        amount: "",
        method: "CASH",
        notes: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [payRes, plyRes] = await Promise.all([
                fetchApi("/payments"),
                fetchApi("/players")
            ]);
            setPayments(payRes.data);
            setPlayers(plyRes.data);
        } catch (err: any) {
            setMessage({ type: 'error', text: "حدث خطأ أثناء تحميل البيانات." });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            await fetchApi("/payments", {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    reference_no: `PAY-${Date.now()}`
                })
            });
            setMessage({ type: 'success', text: "تم تسجيل الدفعة بنجاح." });
            setIsFormOpen(false);
            setFormData({ player_id: "", amount: "", method: "CASH", notes: "" });

            // Reload table
            const pRes = await fetchApi("/payments");
            setPayments(pRes.data);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "حدث خطأ أثناء الحفظ." });
        } finally {
            setSaving(false);
        }
    };

    const currentMonthRevenue = payments.reduce((sum, p) => {
        const d = new Date(p.date);
        const now = new Date();
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
            return sum + Number(p.amount);
        }
        return sum;
    }, 0);

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">المدفوعات والماليات</h1>
                    <p className="text-slate-500 text-sm mt-1">إدارة الاشتراكات، تحصيل الرسوم لمختلف اللاعبين والفروع.</p>
                </div>

                {!isFormOpen && (
                    <button
                        onClick={() => { setIsFormOpen(true); setMessage(null); }}
                        className="bg-[#E60000] hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>تحصيل دفعة جديدة</span>
                    </button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-lg border flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {!isFormOpen && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">إيرادات هذا الشهر</p>
                            <h3 className="text-2xl font-bold text-slate-800">{currentMonthRevenue.toLocaleString()} ج.م</h3>
                        </div>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">تسجيل إيصال تحصيل جديد</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">اللاعب <span className="text-[#E60000]">*</span></label>
                                <select
                                    required
                                    value={formData.player_id}
                                    onChange={e => setFormData({ ...formData, player_id: e.target.value })}
                                    className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none"
                                >
                                    <option value="" disabled>اختر اللاعب...</option>
                                    {players.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">المبلغ المدفوع (ج.م) <span className="text-[#E60000]">*</span></label>
                                <input
                                    required
                                    type="number"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none"
                                    placeholder="مثال: 500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">طريقة الدفع <span className="text-[#E60000]">*</span></label>
                                <select
                                    required
                                    value={formData.method}
                                    onChange={e => setFormData({ ...formData, method: e.target.value })}
                                    className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none"
                                >
                                    <option value="CASH">كاش (نقدي)</option>
                                    <option value="BANK_TRANSFER">تحويل بنكي / محافظ إلكترونية</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">بيان وملاحظات</label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none"
                                    placeholder="مثال: اشتراك شهر مايو"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-[#E60000] hover:bg-red-700 text-white px-8 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                <span>{saving ? 'جاري الحفظ...' : 'تسجيل وحفظ الدفعة'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!isFormOpen && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex gap-4 min-w-full overflow-x-auto">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 text-slate-400 absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="ابحث باسم اللاعب..."
                                className="w-full h-10 rtl:pl-4 rtl:pr-10 ltr:pr-4 ltr:pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E60000]"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500">جاري تحميل المدفوعات...</div>
                        ) : payments.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">لا توجد عمليات دفع مسجلة.</div>
                        ) : (
                            <table className="w-full text-right text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">رقم الإيصال</th>
                                        <th className="px-6 py-4">التاريخ</th>
                                        <th className="px-6 py-4">اللاعب</th>
                                        <th className="px-6 py-4">المبلغ</th>
                                        <th className="px-6 py-4">طريقة الدفع</th>
                                        <th className="px-6 py-4">مسجل بواسطة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs">{trx.reference_no}</td>
                                            <td className="px-6 py-4">{new Date(trx.date).toLocaleDateString('ar-EG')}</td>
                                            <td className="px-6 py-4 font-bold text-slate-700">{trx.player?.first_name} {trx.player?.last_name}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{trx.amount} ج.م</td>
                                            <td className="px-6 py-4">{trx.method === 'CASH' ? 'كاش' : 'تحويل'}</td>
                                            <td className="px-6 py-4">{trx.recorder?.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
