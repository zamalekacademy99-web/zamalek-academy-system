"use client";
import { useState, useEffect } from "react";
import {
    XCircle, Loader2, CheckCircle2,
    User, Calendar, CreditCard, Tag, DollarSign
} from "lucide-react";
import { fetchApi } from "@/lib/api";

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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddPaymentModal({ isOpen, onClose, onSuccess }: Props) {
    const [players, setPlayers] = useState<any[]>([]);
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        player_id: "",
        amount: "",
        method: "CASH",
        category: "MONTHLY_FEE",
        notes: "",
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString()
    });

    useEffect(() => {
        if (isOpen) {
            loadPlayers();
        }
    }, [isOpen]);

    const loadPlayers = async () => {
        setLoadingPlayers(true);
        try {
            // Determine role by checking token or trying to get coach profile
            let playersData = [];
            try {
                const coachRes = await fetchApi('/coaches/profile');
                if (coachRes.data && coachRes.data.id) {
                    console.log("[Modal] Role detected as COACH. Fetching assigned players.");
                    const res = await fetchApi(`/players?coach_id=${coachRes.data.id}`);
                    playersData = res.data || [];
                }
            } catch (err) {
                console.log("[Modal] Profile check failed, attempting ADMIN fetch (all players).");
                const res = await fetchApi('/players');
                playersData = res.data || [];
            }
            setPlayers(playersData);
        } catch (error) {
            console.error("[Modal] Failed to load players:", error);
        } finally {
            setLoadingPlayers(false);
        }
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            // Only suggest 0 if it's KIT_BAG and amount is currently empty, 
            // but keep it editable as requested.
            amount: (field === 'category' && value === 'KIT_BAG' && !prev.amount) ? "0" : prev.amount
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.player_id || !formData.amount) return;

        setSubmitting(true);
        try {
            await fetchApi("/payments", {
                method: 'POST',
                body: JSON.stringify({
                    player_id: formData.player_id,
                    amount: parseFloat(formData.amount),
                    method: formData.method,
                    category: formData.category,
                    notes: formData.notes,
                    period_month: parseInt(formData.month),
                    period_year: parseInt(formData.year),
                    reference_no: `PAY-${Date.now()}`
                })
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            alert("خطأ: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black">تسجيل معاملة مالية</h2>
                        <p className="text-slate-400 text-xs mt-1">تأكد من استلام المبلغ قبل الحفظ</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition">
                        <XCircle className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        {/* Player Selection */}
                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2 mr-1 tracking-wider uppercase">اختيار اللاعب</label>
                            <div className="relative">
                                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    required
                                    value={formData.player_id}
                                    onChange={(e) => handleFormChange('player_id', e.target.value)}
                                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all appearance-none font-bold text-slate-800"
                                    disabled={loadingPlayers}
                                >
                                    <option value="">{loadingPlayers ? "جاري تحميل اللاعبين..." : "اختر اللاعب من القائمة..."}</option>
                                    {players.map(pl => (
                                        <option key={pl.id} value={pl.id}>{pl.first_name} {pl.last_name} {pl.group ? `(${pl.group.name})` : ""}</option>
                                    ))}
                                    {!loadingPlayers && players.length === 0 && (
                                        <option value="" disabled className="text-red-500">❌ لا يوجد لاعبين متاحين</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2 mr-1 tracking-wider uppercase">نوع الدفعة</label>
                            <div className="relative">
                                <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleFormChange('category', e.target.value)}
                                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all appearance-none font-bold text-slate-800"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Month & Year Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 mb-2 mr-1 tracking-wider uppercase">شهر الاشتراك</label>
                                <div className="relative">
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={formData.month}
                                        onChange={(e) => handleFormChange('month', e.target.value)}
                                        className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all appearance-none font-bold text-slate-800"
                                    >
                                        {ARABIC_MONTHS.map((m, i) => (
                                            <option key={i} value={i + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 mb-2 mr-1 tracking-wider uppercase">السنة</label>
                                <div className="relative">
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={formData.year}
                                        onChange={(e) => handleFormChange('year', e.target.value)}
                                        className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all appearance-none font-bold text-slate-800"
                                    >
                                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                        <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                                    </select>
                                </div>
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
                                        onChange={(e) => handleFormChange('amount', e.target.value)}
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
                                        onChange={(e) => handleFormChange('method', e.target.value)}
                                        className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all appearance-none font-bold text-slate-800"
                                    >
                                        <option value="CASH">نقدي</option>
                                        <option value="BANK_TRANSFER">تحويل بنكي</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2 mr-1 tracking-wider uppercase">ملاحظات إضافية</label>
                            <textarea
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => handleFormChange('notes', e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all font-medium text-slate-800"
                                placeholder="مثال: دفعة شاملة"
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
    );
}
