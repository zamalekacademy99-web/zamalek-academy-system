"use client";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import {
    Plus, DollarSign, User, Loader2
} from "lucide-react";
import AddPaymentModal from "@/components/modals/AddPaymentModal";

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

export default function CoachPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const profileRes = await fetchApi('/coaches/profile');
            const userId = profileRes.data.user_id;

            // Fetch payments recorded by this coach
            const payRes = await fetchApi(`/payments?recorder_id=${userId}`);
            setPayments(payRes.data || []);
        } catch (err) {
            console.error("Failed to load payments data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-[#E60000] mb-4" />
                <p className="text-slate-500 font-black">جاري تحميل السجلات المالية...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20 text-right" dir="rtl">
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
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">اللاعب</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">الفئة</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">المبلغ</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">التاريخ</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">الفترة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3 justify-start">
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-slate-800">{p.player?.first_name} {p.player?.last_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black">
                                            {CATEGORIES.find(c => c.id === p.category)?.label || "اشتراك شهري"}
                                        </span>
                                    </td>
                                    <td className="p-4 font-black text-green-600">{p.amount} ج.م</td>
                                    <td className="p-4 text-xs text-slate-500 font-bold">
                                        {new Date(p.date).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td className="p-4 text-xs text-slate-400 font-black">
                                        {ARABIC_MONTHS[(p.period_month || 1) - 1]} {p.period_year}
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

            <AddPaymentModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={loadData}
            />
        </div>
    );
}
