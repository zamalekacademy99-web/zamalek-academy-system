"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Copy, Check } from "lucide-react";
import { fetchApi } from "@/lib/api";

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
                <p className="font-mono text-sm text-slate-900 font-bold" dir="ltr">{value}</p>
            </div>
            <button onClick={copy} className={`p-2 rounded-md transition ${copied ? 'bg-green-100 text-green-600' : 'bg-white hover:bg-slate-200 text-slate-600'}`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    );
}

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function AdminCoachProfilePage() {
    const params = useParams();
    const id = params?.id as string;

    const [coach, setCoach] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchApi(`/coaches/${id}`)
            .then(res => setCoach(res.data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل الملف الشخصي...</div>;
    if (error || !coach) return <div className="p-8 text-center text-red-500">{error || 'خطأ في التحميل'}</div>;

    return (
        <div className="space-y-6">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-[#E60000] to-red-700 text-white rounded-2xl p-6 flex items-center gap-5 shadow-lg">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl font-black flex-shrink-0">
                    {coach.full_name?.[0]}
                </div>
                <div>
                    <h1 className="text-2xl font-black">{coach.full_name}</h1>
                    <p className="text-red-100 text-sm mt-1">{coach.branch?.name} • {coach.is_active ? 'نشط' : 'غير نشط'}</p>
                    <p className="text-red-200 text-sm">{coach.phone}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Credentials Card */}
                {coach.user && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                        <h3 className="font-bold text-slate-800 text-base mb-4">بيانات الدخول</h3>
                        <CopyCard label="البريد الإلكتروني" value={coach.user.email} />
                        <CopyCard label="كلمة المرور (Hash)" value={coach.user.password_hash} />
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 mt-2">
                            ⚠️ يتم عرض هذه البيانات للإدارة فقط. لإعادة تعيين كلمة المرور يرجى مراجعة المدير المسؤول.
                        </div>
                    </div>
                )}

                {/* Assigned Groups */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-bold text-slate-800 text-base mb-4">المجموعات المعينة</h3>
                    {coach.groups?.length === 0 ? (
                        <p className="text-slate-500 text-sm">لم يتم تعيينه لأي مجموعة حتى الآن.</p>
                    ) : (
                        <div className="space-y-2">
                            {coach.groups?.map((g: any) => (
                                <div key={g.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                                    <span className="font-semibold text-slate-800 text-sm">{g.name}</span>
                                    <span className="text-xs text-slate-500">{g._count?.players || 0} لاعب</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Today's Schedules */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:col-span-2">
                    <h3 className="font-bold text-slate-800 text-base mb-4">جداول التدريب</h3>
                    {coach.schedules?.length === 0 ? (
                        <p className="text-slate-500 text-sm">لا توجد جلسات مجدولة.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-slate-600 text-right">
                                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3">اليوم</th>
                                        <th className="px-4 py-3">الفرع</th>
                                        <th className="px-4 py-3">المجموعة</th>
                                        <th className="px-4 py-3">الوقت</th>
                                        <th className="px-4 py-3">الملعب</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {coach.schedules?.map((s: any) => (
                                        <tr key={s.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-bold text-slate-800">{DAYS[s.day_of_week]}</td>
                                            <td className="px-4 py-3">{s.branch?.name}</td>
                                            <td className="px-4 py-3">{s.group?.name}</td>
                                            <td className="px-4 py-3">{s.start_time} - {s.end_time}</td>
                                            <td className="px-4 py-3">{s.field_name || 'الرئيسي'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
