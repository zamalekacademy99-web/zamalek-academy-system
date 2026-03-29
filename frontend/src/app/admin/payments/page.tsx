"use client";
import { useState, useEffect } from "react";
import { Plus, Search, FileText, TrendingUp, AlertCircle, Loader2, CheckCircle2, User, Tag } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Player = { id: string; first_name: string; last_name: string };
type Payment = {
    id: string;
    player: Player;
    amount: number;
    method: string;
    category: string;
    notes: string;
    date: string;
    reference_no: string;
    period_month: number;
    period_year: number;
    recorder: { name: string }
};

const ARABIC_MONTHS = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const CATEGORIES = [
    { id: "MONTHLY_FEE", label: "اشتراك شهري" },
    { id: "KIT_BAG", label: "شنطة ولبس" },
    { id: "BOTH", label: "اشتراك + لبس" },
    { id: "OTHER", label: "أخرى" }
];

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Filter State
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [formData, setFormData] = useState({
        player_id: "",
        amount: "",
        method: "CASH",
        category: "MONTHLY_FEE",
        notes: "",
        period_month: (new Date().getMonth() + 1).toString(),
        period_year: new Date().getFullYear().toString()
    });

    useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear]);

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

    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => {
            const newState = { ...prev, [field]: value };
            if (field === 'category' && value === 'KIT_BAG') {
                newState.amount = "0";
            }
            return newState;
        });
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
                    amount: parseFloat(formData.amount),
                    period_month: parseInt(formData.period_month),
                    period_year: parseInt(formData.period_year),
                    reference_no: `PAY-${Date.now()}`
                })
            });
            setMessage({ type: 'success', text: "تم تسجيل الدفعة بنجاح." });
            setIsFormOpen(false);
            setFormData({ ...formData, player_id: "", amount: "", notes: "" });
            loadData();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "حدث خطأ أثناء الحفظ." });
        } finally {
            setSaving(false);
        }
    };

    // Financial Analytics for the selected period
    const filteredPayments = payments.filter(p => p.period_month === selectedMonth && p.period_year === selectedYear);
    const totalCollected = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const expectedRevenue = players.length * 500; // Simplified
    const remainingDebt = expectedRevenue - totalCollected;

    return (
        <div className="space-y-6 pb-12 text-right" dir="rtl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">نظام الاشتراكات المطور</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">تحصيل وإدارة الإيرادات لعام {selectedYear}</p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="h-10 px-3 border border-slate-200 rounded-lg text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-[#E60000]"
                    >
                        {ARABIC_MONTHS.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    {!isFormOpen && (
                        <button
                            onClick={() => { setIsFormOpen(true); setMessage(null); }}
                            className="bg-[#E60000] hover:bg-black text-white px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-black transition-all shadow-lg shadow-red-500/10"
                        >
                            <Plus className="w-4 h-4" />
                            <span>تحصيل اشتراك</span>
                        </button>
                    )}
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    <span className="font-bold text-sm tracking-tight">{message.text}</span>
                </div>
            )}

            {!isFormOpen && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 text-right">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-inner shrink-0">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">المحصل (Actual)</p>
                            <h3 className="text-2xl font-black text-slate-900">{totalCollected.toLocaleString()} ج.م</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 text-right">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">المستهدف (Target)</p>
                            <h3 className="text-2xl font-black text-slate-900">{expectedRevenue.toLocaleString()} ج.م</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 text-right">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-inner shrink-0">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">الديون (Pending)</p>
                            <h3 className="text-2xl font-black text-red-600">{remainingDebt > 0 ? remainingDebt.toLocaleString() : 0} ج.م</h3>
                        </div>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-lg text-right">
                    <h2 className="text-xl font-black text-slate-800 mb-8 border-r-4 border-[#E60000] pr-4">إيصال تحصيل اشتراك شهري</h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">اللاعب</label>
                                <select
                                    required
                                    value={formData.player_id}
                                    onChange={e => handleFormChange('player_id', e.target.value)}
                                    className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none transition-all font-bold"
                                >
                                    <option value="" disabled>اختر من قائمة اللاعبين...</option>
                                    {players.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">نوع الدفعة</label>
                                <select
                                    value={formData.category}
                                    onChange={e => handleFormChange('category', e.target.value)}
                                    className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none transition-all font-bold"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 text-right">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">شهر الاشتراك</label>
                                    <select
                                        value={formData.period_month}
                                        onChange={e => handleFormChange('period_month', e.target.value)}
                                        className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none transition-all font-bold"
                                    >
                                        {ARABIC_MONTHS.map((m, i) => (
                                            <option key={i} value={i + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">السنة</label>
                                    <select
                                        value={formData.period_year}
                                        onChange={e => handleFormChange('period_year', e.target.value)}
                                        className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none transition-all font-bold"
                                    >
                                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                        <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">المبلغ (ج.م)</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.amount}
                                    onChange={e => handleFormChange('amount', e.target.value)}
                                    className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none transition-all font-black text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">طريقة الدفع</label>
                                <select
                                    required
                                    value={formData.method}
                                    onChange={e => handleFormChange('method', e.target.value)}
                                    className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none transition-all font-bold"
                                >
                                    <option value="CASH">نقدي (Cash)</option>
                                    <option value="BANK_TRANSFER">تحويل (Transfer)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 font-black transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-[#E60000] hover:bg-black text-white px-10 py-3 rounded-2xl flex items-center gap-2 font-black shadow-xl shadow-red-500/20 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                <span>{saving ? 'جاري الحفظ...' : 'حفظ الإيصال'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!isFormOpen && (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden text-right">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-black text-slate-800">بيانات التحصيل لشهر {ARABIC_MONTHS[selectedMonth - 1]}</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-100/50 text-slate-400 font-black text-[10px] uppercase tracking-tighter">
                                <tr>
                                    <th className="px-6 py-4">اللاعب</th>
                                    <th className="px-6 py-4">الفئة</th>
                                    <th className="px-6 py-4">المبلغ</th>
                                    <th className="px-6 py-4">التاريخ</th>
                                    <th className="px-6 py-4">بواسطة</th>
                                    <th className="px-6 py-4">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPayments.map((trx) => (
                                    <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-black text-slate-700">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                {trx.player?.first_name} {trx.player?.last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-black">
                                                {CATEGORIES.find(c => c.id === trx.category)?.label || "اشتراك"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-900">{trx.amount} ج.م</td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(trx.date).toLocaleDateString('ar-EG')}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{trx.recorder?.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black underline decoration-2 underline-offset-2">مدفوع</span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPayments.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center text-slate-400 font-black">لا توجد تحصيلات مسجلة لهذا الشهر.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
