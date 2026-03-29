"use client";
import { useState, useEffect } from "react";
import {
    XCircle, Loader2, CheckCircle2,
    User, Calendar, CreditCard, Tag, DollarSign,
    Layers, MapPin, RefreshCcw
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
    const [role, setRole] = useState<"ADMIN" | "COACH" | null>(null);
    const [coachId, setCoachId] = useState<string | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [players, setPlayers] = useState<any[]>([]);

    // Selection state for cascading filters
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");

    const [loading, setLoading] = useState(false);
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
            initModal();
        } else {
            // Reset cascading selections on close
            setSelectedBranch("");
            setSelectedGroup("");
            setPlayers([]);
            setGroups([]);
            setFormData(prev => ({ ...prev, player_id: "", amount: "" }));
        }
    }, [isOpen]);

    const initModal = async () => {
        setLoading(true);
        try {
            // 1. Determine Role
            let currentRole: "ADMIN" | "COACH" = "ADMIN";

            // First check localStorage for coachId (set during login)
            const storedCoachId = localStorage.getItem('coachId');
            const userRaw = localStorage.getItem('user');
            const user = userRaw ? JSON.parse(userRaw) : null;

            if (user?.role === 'COACH' || storedCoachId) {
                currentRole = "COACH";
                setRole("COACH");
                const cid = storedCoachId || (user?.coachProfile?.id);
                setCoachId(cid);

                console.log("[Modal v1.6.0] Coach Mode. Fetching groups for coach:", cid);
                // Fetch groups specifically assigned to this coach
                const groupRes = await fetchApi(`/groups?coach_id=${cid}`);
                setGroups(groupRes.data || []);
            } else {
                setRole("ADMIN");
                const branchRes = await fetchApi('/branches');
                setBranches(branchRes.data || []);
            }
        } catch (error) {
            console.error("[Modal v1.6.0] Init error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Admin Flow: Branch -> Groups
    const handleBranchChange = async (branchId: string) => {
        setSelectedBranch(branchId);
        setSelectedGroup("");
        setPlayers([]);
        setFormData(prev => ({ ...prev, player_id: "" }));

        if (!branchId) return;

        setLoading(true);
        try {
            const res = await fetchApi(`/groups?branch_id=${branchId}`);
            setGroups(res.data || []);
        } catch (err) {
            console.error("Failed to load groups:", err);
        } finally {
            setLoading(false);
        }
    };

    // Shared Flow: Group -> Players (Both Admin and Coach)
    const handleGroupChange = async (groupId: string) => {
        setSelectedGroup(groupId);
        setFormData(prev => ({ ...prev, player_id: "" }));
        setPlayers([]); // Clear players immediately until fetch completes

        if (!groupId) return;

        await fetchPlayersAction(groupId);
    };

    const fetchPlayersAction = async (groupId: string) => {
        setLoading(true);
        try {
            console.log(`[Modal v1.6.0] Fetching players for Group: ${groupId}`);
            const res = await fetchApi(`/players?group_id=${groupId}`);
            setPlayers(res.data || []);
            console.log(`[Modal v1.6.0] Found ${res.data?.length || 0} players`);
        } catch (err) {
            console.error("Failed to load players:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.player_id || !formData.amount) {
            alert("يرجى اختيار اللاعب وإدخال المبلغ");
            return;
        }

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
                <div className="p-8 bg-[#E60000] text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black">تسجيل معاملة مالية (v1.6.0)</h2>
                        <p className="text-white/60 text-xs mt-1">نظام المدربين المطور - اختيار بالتسلسل</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition">
                        <XCircle className="w-6 h-6 text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">

                        {/* SELECTORS (ADMIN gets Branch+Group, COACH gets Group) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {role === "ADMIN" && (
                                <div>
                                    <label className="block text-xs font-black text-slate-500 mb-2 mr-1 uppercase tracking-wider">الفرع</label>
                                    <div className="relative">
                                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={selectedBranch}
                                            onChange={(e) => handleBranchChange(e.target.value)}
                                            className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all appearance-none font-bold text-slate-800"
                                        >
                                            <option value="">اختر الفرع...</option>
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className={role === "COACH" ? "col-span-2" : ""}>
                                <label className="block text-xs font-black text-slate-500 mb-2 mr-1 uppercase tracking-wider">المجموعة</label>
                                <div className="relative">
                                    <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E60000]" />
                                    <select
                                        disabled={loading || (role === "ADMIN" && !selectedBranch)}
                                        value={selectedGroup}
                                        onChange={(e) => handleGroupChange(e.target.value)}
                                        className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all appearance-none font-black text-slate-900 shadow-sm disabled:opacity-50"
                                    >
                                        <option value="">{loading && groups.length === 0 ? "جاري تحميل مجموعاتك..." : "اختر المجموعة لعرض اللاعبين..."}</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                                {role === "COACH" && groups.length === 0 && !loading && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1 mr-1">⚠️ لا توجد مجموعات مسجلة باسمك حالياً.</p>
                                )}
                            </div>
                        </div>

                        {/* Player Selection */}
                        <div>
                            <div className="flex justify-between items-center mb-2 mr-1">
                                <label className="block text-xs font-black text-slate-500 tracking-wider uppercase underline decoration-[#E60000] decoration-2 underline-offset-4">اختيار اللاعب</label>
                                <button
                                    type="button"
                                    onClick={() => selectedGroup && fetchPlayersAction(selectedGroup)}
                                    disabled={loading || !selectedGroup}
                                    className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-800 disabled:opacity-0 transition-opacity"
                                >
                                    <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                    تحديث
                                </button>
                            </div>
                            <div className="relative">
                                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    required
                                    value={formData.player_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, player_id: e.target.value }))}
                                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all appearance-none font-black text-slate-900"
                                    disabled={loading || !selectedGroup}
                                >
                                    <option value="">{!selectedGroup ? "يرجى اختيار المجموعة أولاً" : (loading ? "جاري تحميل اللاعبين..." : "اختر اللاعب...")}</option>
                                    {players.map(pl => (
                                        <option key={pl.id} value={pl.id}>{pl.first_name} {pl.last_name}</option>
                                    ))}
                                    {!loading && selectedGroup && players.length === 0 && (
                                        <option value="" disabled className="text-red-500 font-black">❌ لا يوجد لاعبين لهذه المجموعة</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 my-2" />

                        {/* Category & Amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 mb-2 mr-1 uppercase">نوع الدفعة</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] font-bold text-slate-800"
                                >
                                    {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 mb-2 mr-1 uppercase">المبلغ (ج.م)</label>
                                <div className="relative">
                                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                    <input
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white transition-all font-black text-lg text-slate-800 shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Month & Year Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 mb-2 mr-1 uppercase">شهـر</label>
                                <select
                                    value={formData.month}
                                    onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#E60000] font-bold text-slate-800"
                                >
                                    {ARABIC_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 mb-2 mr-1 uppercase">السـنة</label>
                                <select
                                    value={formData.year}
                                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#E60000] font-bold text-slate-800"
                                >
                                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                    <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2 mr-1 uppercase">ملاحظات</label>
                            <textarea
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] font-medium text-slate-800"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-5 bg-[#E60000] text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> حفظ المعاملة</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
