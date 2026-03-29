"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Copy, Check } from "lucide-react";
import { fetchApi } from "@/lib/api";

function CopyCard({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <div><p className="text-xs text-slate-500 mb-0.5">{label}</p><p className="font-mono text-sm text-slate-900 font-bold" dir="ltr">{value}</p></div>
            <button onClick={copy} className={`p-2 rounded-md transition ${copied ? 'bg-green-100 text-green-600' : 'bg-white hover:bg-slate-200 text-slate-600'}`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    );
}

const CRITERIA = [
    { key: "commitment_score", label: "الالتزام", color: "bg-blue-500" },
    { key: "discipline_score", label: "الانضباط", color: "bg-purple-500" },
    { key: "technical_score", label: "التقنية", color: "bg-yellow-500" },
    { key: "fitness_score", label: "اللياقة", color: "bg-green-500" },
];

const STATUS_COLORS: Record<string, string> = {
    PRESENT: "bg-green-100 text-green-700",
    ABSENT_EXCUSED: "bg-yellow-100 text-yellow-700",
    ABSENT_UNEXCUSED: "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<string, string> = {
    PRESENT: "حاضر",
    ABSENT_EXCUSED: "غياب بعذر",
    ABSENT_UNEXCUSED: "غياب بدون عذر",
};

export default function AdminPlayerDashboardPage() {
    const params = useParams();
    const id = params?.id as string;

    const [player, setPlayer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchApi(`/players/${id}`)
            .then(res => setPlayer(res.data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل الملف الشخصي...</div>;
    if (error || !player) return <div className="p-8 text-center text-red-500">{error || 'لم يتم العثور على اللاعب'}</div>;

    const totalSessions = player.attendance?.length || 0;
    const presentCount = player.attendance?.filter((a: any) => a.status === 'PRESENT').length || 0;
    const presenceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    const latestEval = player.evaluations?.[0];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-[#E60000] to-red-700 text-white rounded-2xl p-6 flex flex-wrap items-center gap-5 shadow-lg">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl font-black flex-shrink-0">
                    {player.first_name?.[0]}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-black">{player.first_name} {player.last_name}</h1>
                    <p className="text-red-100 text-sm mt-1">{player.group?.name} • {player.branch?.name}</p>
                    <p className="text-red-200 text-sm mt-0.5">المدرب: {player.coach?.full_name}</p>
                </div>
                <div className="text-center bg-white/20 rounded-xl px-6 py-3 backdrop-blur-sm">
                    <div className="text-4xl font-black">{presenceRate}%</div>
                    <div className="text-xs text-red-200 font-semibold">نسبة الحضور</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Attendance Stats */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                    <h3 className="font-bold text-slate-800">إحصائيات الحضور</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-slate-600">مجموع الجلسات</span><span className="font-bold">{totalSessions}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-green-600">حضر</span><span className="font-bold text-green-700">{presentCount}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-red-500">غياب</span><span className="font-bold text-red-600">{totalSessions - presentCount}</span></div>
                    </div>
                    {/* Mini Bar Chart */}
                    <div className="h-3 bg-red-100 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-[#E60000] rounded-full transition-all" style={{ width: `${presenceRate}%` }} />
                    </div>
                </div>

                {/* Latest Evaluation */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:col-span-2">
                    <h3 className="font-bold text-slate-800 mb-4">آخر تقييم ({latestEval ? new Date(latestEval.date).toLocaleDateString('ar-EG') : 'لا يوجد'})</h3>
                    {!latestEval ? (
                        <p className="text-slate-500 text-sm">لم يتم تقييم هذا اللاعب بعد.</p>
                    ) : (
                        <div className="space-y-3">
                            {CRITERIA.map(c => {
                                const score = latestEval[c.key] || 0;
                                return (
                                    <div key={c.key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600">{c.label}</span>
                                            <span className="font-bold text-slate-800">{score}/10</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${c.color} rounded-full transition-all`} style={{ width: `${score * 10}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                            {latestEval.notes && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2">
                                    <p className="text-xs text-blue-500 font-semibold mb-1">ملاحظة المدرب:</p>
                                    <p className="text-blue-900 text-sm">{latestEval.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Parent Credentials */}
                {player.parent?.user && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                        <h3 className="font-bold text-slate-800">بيانات ولي الأمر</h3>
                        <p className="text-sm text-slate-600">{player.parent?.user?.name}</p>
                        <CopyCard label="البريد الإلكتروني" value={player.parent?.user?.email || ''} />
                        <CopyCard label="رقم الهاتف" value={player.parent?.phone || ''} />
                    </div>
                )}

                {/* Recent Attendance History */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:col-span-2">
                    <h3 className="font-bold text-slate-800 mb-4">سجل الحضور الأخير</h3>
                    {player.attendance?.length === 0 ? (
                        <p className="text-slate-500 text-sm">لا يوجد سجل حضور حتى الآن.</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {player.attendance?.map((a: any) => (
                                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <span className="text-sm text-slate-600">{new Date(a.date).toLocaleDateString('ar-EG')}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {STATUS_LABELS[a.status] || a.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
