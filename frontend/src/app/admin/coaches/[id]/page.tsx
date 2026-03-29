"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Copy, Check, Save, ExternalLink, Shield } from "lucide-react";
import { fetchApi } from "@/lib/api";

/* ── Copy-to-clipboard card ─────────────────────────────────────── */
function CopyCard({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <div>
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="font-mono text-sm text-slate-900 font-bold break-all" dir="ltr">
                    {value || <span className="text-slate-400 italic">غير متاح</span>}
                </p>
            </div>
            <button
                onClick={copy}
                className={`ml-3 flex-shrink-0 p-2 rounded-md transition ${copied ? "bg-green-100 text-green-600" : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"}`}
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    );
}

/* ── Toast ───────────────────────────────────────────────────────── */
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2 animate-bounce-in
            ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {type === "success" ? "✅" : "❌"} {message}
        </div>
    );
}

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const DEFAULT_PERMS = { attendance: true, ratings: true, financials: false };

/* ══════════════════════════════════════════════════════════════════ */
export default function AdminCoachProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [coach, setCoach] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [perms, setPerms] = useState(DEFAULT_PERMS);
    const [savingPerms, setSavingPerms] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = useCallback(() => {
        if (!id) return;
        setLoading(true);
        fetchApi(`/coaches/${id}`)
            .then(res => {
                setCoach(res.data);
                if (res.data?.permissions) setPerms({ ...DEFAULT_PERMS, ...res.data.permissions });
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleSavePerms = async () => {
        setSavingPerms(true);
        try {
            await fetchApi(`/coaches/${id}`, {
                method: "PUT",
                body: JSON.stringify({ permissions: perms }),
            });
            showToast("تم حفظ الصلاحيات بنجاح ✅");
        } catch (err: any) {
            showToast("فشل حفظ الصلاحيات: " + err.message, "error");
        } finally {
            setSavingPerms(false);
        }
    };

    /* ── Loading ──────────────────────────────────────────────────── */
    if (loading) return (
        <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
            <div className="h-36 bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl" />)}
            </div>
        </div>
    );

    if (error || !coach) return (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-8 text-center max-w-xl mx-auto">
            <p className="font-bold text-xl mb-2">⚠️ تعذر تحميل ملف المدرب</p>
            <p className="text-sm">{error || "المدرب غير موجود"}</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* ── Hero Card ─────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-7 flex flex-wrap items-center gap-5 shadow-xl">
                <div className="w-20 h-20 bg-[#E60000] rounded-xl flex items-center justify-center text-4xl font-black text-white flex-shrink-0 shadow">
                    {coach.full_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-black text-white">{coach.full_name}</h1>
                    <p className="text-slate-300 text-sm mt-1">{coach.branch?.name} • {coach.phone}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                        {coach.groups?.length || 0} مجموعة • {coach.players?.length || 0} لاعب
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-center ${coach.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {coach.is_active ? "🟢 نشط" : "🔴 موقوف"}
                    </span>
                    {/* Open Coach Portal Button */}
                    <button
                        onClick={() => router.push("/coach/attendance")}
                        className="flex items-center gap-1.5 bg-[#E60000] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-700 transition"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        بوابة المدرب
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* ── User Credentials Card ─────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-[#E60000]" />
                        <h3 className="font-black text-slate-800">بيانات الدخول</h3>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ms-auto">للإدارة فقط</span>
                    </div>
                    {coach.user ? (
                        <>
                            <CopyCard label="البريد الإلكتروني" value={coach.user.email} />
                            <CopyCard label="كلمة المرور" value={coach.user.plain_password || coach.phone || "—"} />
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 leading-relaxed">
                                ⚠️ كلمة المرور الافتراضية هي رقم الهاتف. هذه البيانات مرئية للإدارة فقط.
                            </div>
                        </>
                    ) : (
                        <div className="py-6 text-center text-slate-400 text-sm">
                            لا يوجد حساب مرتبط بهذا المدرب بعد.
                        </div>
                    )}
                </div>

                {/* ── Permissions Manager ───────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-[#E60000] rounded-full" />
                        <h3 className="font-black text-slate-800">إدارة الصلاحيات</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { key: "attendance", label: "تسجيل الحضور", desc: "يمكنه تسجيل وتعديل حضور اللاعبين" },
                            { key: "ratings", label: "تقييم اللاعبين", desc: "يمكنه إضافة تقييمات الأداء" },
                            { key: "financials", label: "عرض المدفوعات", desc: "يمكنه الاطلاع على بيانات الاشتراكات" },
                        ].map(p => (
                            <label key={p.key} className="flex items-start gap-3 cursor-pointer rounded-lg hover:bg-slate-50 p-2 -mx-2 transition">
                                <div className="relative mt-0.5 flex-shrink-0" onClick={() => setPerms(prev => ({ ...prev, [p.key]: !(prev as any)[p.key] }))}>
                                    <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center
                                        ${(perms as any)[p.key] ? "bg-[#E60000] border-[#E60000]" : "border-gray-300 bg-white"}`}>
                                        {(perms as any)[p.key] && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{p.label}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={handleSavePerms}
                        disabled={savingPerms}
                        className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-60"
                    >
                        <Save className="w-4 h-4" />
                        {savingPerms ? "جاري الحفظ..." : "حفظ الصلاحيات"}
                    </button>
                </div>

                {/* ── Assigned Groups ───────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-[#E60000] rounded-full" />
                        <h3 className="font-black text-slate-800">المجموعات المعينة</h3>
                        <span className="ms-auto text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{coach.groups?.length || 0}</span>
                    </div>
                    {!coach.groups?.length ? (
                        <p className="text-slate-400 text-sm text-center py-6">لم يتم تعيين مجموعات بعد.</p>
                    ) : (
                        <div className="space-y-2">
                            {coach.groups.map((g: any) => (
                                <div key={g.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{g.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{g._count?.players ?? "?"} لاعب</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${g.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                        {g.is_active ? "نشطة" : "مخفية"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Weekly Schedule ───────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-[#E60000] rounded-full" />
                        <h3 className="font-black text-slate-800">جداول التدريب</h3>
                    </div>
                    {!coach.schedules?.length ? (
                        <p className="text-slate-400 text-sm text-center py-6">لا توجد جلسات مجدولة.</p>
                    ) : (
                        <div className="space-y-2">
                            {coach.schedules.map((s: any) => (
                                <div key={s.id} className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2.5 text-sm border border-slate-100">
                                    <span className="font-black text-[#E60000] w-16 flex-shrink-0 text-right">{DAYS[s.day_of_week]}</span>
                                    <span className="text-slate-700 flex-1 truncate">{s.group?.name}</span>
                                    <span className="text-slate-500 font-mono text-xs flex-shrink-0">{s.start_time}–{s.end_time}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
