"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Copy, Check, Save } from "lucide-react";
import { fetchApi } from "@/lib/api";

function CopyCard({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 group">
            <div>
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="font-mono text-sm text-slate-900 font-bold" dir="ltr">{value || '—'}</p>
            </div>
            <button onClick={copy} className={`p-2 rounded-md transition ${copied ? 'bg-green-100 text-green-600' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-600'}`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    );
}

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const DEFAULT_PERMS = { attendance: true, ratings: true, financials: false };

export default function AdminCoachProfilePage() {
    const params = useParams();
    const id = params?.id as string;

    const [coach, setCoach] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [perms, setPerms] = useState(DEFAULT_PERMS);
    const [savingPerms, setSavingPerms] = useState(false);
    const [permSuccess, setPermSuccess] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchApi(`/coaches/${id}`)
            .then(res => {
                setCoach(res.data);
                if (res.data.permissions) {
                    setPerms({ ...DEFAULT_PERMS, ...res.data.permissions });
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSavePerms = async () => {
        setSavingPerms(true);
        try {
            await fetchApi(`/coaches/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ permissions: perms })
            });
            setPermSuccess(true);
            setTimeout(() => setPermSuccess(false), 2500);
        } catch {
            alert('فشل حفظ الصلاحيات');
        } finally {
            setSavingPerms(false);
        }
    };

    if (loading) return (
        <div className="space-y-4 animate-pulse max-w-5xl mx-auto">
            <div className="h-36 bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-2 gap-4"><div className="h-48 bg-slate-100 rounded-xl" /><div className="h-48 bg-slate-100 rounded-xl" /></div>
        </div>
    );

    if (error || !coach) return (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-8 text-center">
            <p className="font-bold text-xl mb-2">⚠️ تعذر تحميل الملف الشخصي</p>
            <p className="text-sm">{error}</p>
        </div>
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-7 flex flex-wrap items-center gap-5 shadow-xl">
                <div className="w-20 h-20 bg-[#E60000] rounded-xl flex items-center justify-center text-4xl font-black flex-shrink-0 shadow-lg">
                    {coach.full_name?.[0]}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-black">{coach.full_name}</h1>
                    <p className="text-slate-300 text-sm mt-1">{coach.branch?.name} • {coach.is_active ? '🟢 نشط' : '🔴 غير نشط'}</p>
                    <p className="text-slate-400 text-sm mt-0.5" dir="ltr">{coach.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${coach.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {coach.is_active ? 'مدرب نشط' : 'موقوف'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Credentials Card */}
                {coach.user && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-[#E60000] rounded-full" />
                            <h3 className="font-bold text-slate-800 text-base">بيانات الدخول</h3>
                        </div>
                        <CopyCard label="البريد الإلكتروني" value={coach.user.email} />
                        <CopyCard label="كلمة المرور" value={coach.user.plain_password || '•••••••• (غير متوفر)'} />
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 mt-1 leading-relaxed">
                            ⚠️ كلمة المرور الافتراضية هي رقم الهاتف. هذه البيانات مرئية للإدارة فقط.
                        </div>
                    </div>
                )}

                {/* Permissions Manager */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-[#E60000] rounded-full" />
                        <h3 className="font-bold text-slate-800 text-base">إدارة الصلاحيات</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { key: 'attendance', label: 'تسجيل الحضور', desc: 'يمكنه تسجيل وتعديل حضور اللاعبين' },
                            { key: 'ratings', label: 'تقييم اللاعبين', desc: 'يمكنه إضافة تقييمات الأداء' },
                            { key: 'financials', label: 'عرض المدفوعات', desc: 'يمكنه الاطلاع على بيانات الاشتراكات' },
                        ].map(p => (
                            <label key={p.key} className="flex items-start gap-3 cursor-pointer group rounded-lg hover:bg-slate-50 p-2 -mx-2 transition">
                                <div className="relative mt-0.5 flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={(perms as any)[p.key]}
                                        onChange={e => setPerms(prev => ({ ...prev, [p.key]: e.target.checked }))}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center
                                        ${(perms as any)[p.key] ? 'bg-[#E60000] border-[#E60000]' : 'border-gray-300 bg-white'}`}
                                    >
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
                        className={`mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${permSuccess ? 'bg-green-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'} disabled:opacity-60`}
                    >
                        <Save className="w-4 h-4" />
                        {savingPerms ? 'جاري الحفظ...' : permSuccess ? '✅ تم حفظ الصلاحيات' : 'حفظ الصلاحيات'}
                    </button>
                </div>

                {/* Assigned Groups */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-[#E60000] rounded-full" />
                        <h3 className="font-bold text-slate-800 text-base">المجموعات المعينة</h3>
                    </div>
                    {coach.groups?.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-4">لم يتم تعيينه لأي مجموعة حتى الآن.</p>
                    ) : (
                        <div className="space-y-2">
                            {coach.groups?.map((g: any) => (
                                <div key={g.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{g.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{g._count?.players || 0} لاعب</p>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                        {g.is_active ? 'نشطة' : 'مخفية'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Schedule Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-[#E60000] rounded-full" />
                        <h3 className="font-bold text-slate-800 text-base">جداول التدريب</h3>
                    </div>
                    {coach.schedules?.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-4">لا توجد جلسات مجدولة.</p>
                    ) : (
                        <div className="space-y-2">
                            {coach.schedules?.map((s: any) => (
                                <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5 text-sm border border-slate-100">
                                    <span className="font-bold text-[#E60000] w-16 flex-shrink-0">{DAYS[s.day_of_week]}</span>
                                    <span className="text-slate-700 flex-1">{s.group?.name}</span>
                                    <span className="text-slate-500 font-mono text-xs">{s.start_time}–{s.end_time}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
