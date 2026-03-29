"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCoachId } from "@/hooks/useCoachId";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

type AttStatus = "PRESENT" | "ABSENT_EXCUSED" | "ABSENT_UNEXCUSED";
type Player = { id: string; first_name: string; last_name: string; photo_url?: string };

const STATUS_OPTIONS: { value: AttStatus; label: string; color: string; icon: any }[] = [
    { value: "PRESENT", label: "حاضر", color: "bg-green-100 text-green-700 ring-green-400", icon: Check },
    { value: "ABSENT_EXCUSED", label: "غياب بعذر", color: "bg-yellow-100 text-yellow-700 ring-yellow-400", icon: Clock },
    { value: "ABSENT_UNEXCUSED", label: "غياب بدون عذر", color: "bg-red-100 text-red-700 ring-red-400", icon: X },
];

function AttendanceContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const coachId = useCoachId();
    const groupId = params?.groupId as string;
    const scheduleId = searchParams.get('schedule') || '';

    const [players, setPlayers] = useState<Player[]>([]);
    const [records, setRecords] = useState<Record<string, AttStatus>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupId) return;
        setLoading(true);
        setError(null);
        fetchApi(`/coach/group/${groupId}/players`)
            .then(res => {
                const ps: Player[] = res.data;
                setPlayers(ps);
                const init: Record<string, AttStatus> = {};
                ps.forEach(p => { init[p.id] = "PRESENT"; });
                setRecords(init);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [groupId]);

    const toggle = (playerId: string, status: AttStatus) => {
        setRecords(prev => ({ ...prev, [playerId]: status }));
    };

    const handleSubmit = async () => {
        if (!scheduleId) {
            setError('⚠️ لم يتم تحديد جلسة. يرجى الدخول من لوحة التحكم.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const recordsList = Object.entries(records).map(([player_id, status]) => ({ player_id, status }));
            await fetchApi('/coach/attendance', {
                method: 'POST',
                body: JSON.stringify({
                    schedule_id: scheduleId,
                    coach_id: coachId,
                    date: new Date().toISOString().split('T')[0],
                    records: recordsList
                })
            });

            setSuccess(true);
            router.refresh(); // real-time sync
            setTimeout(() => router.push(`/coach/dashboard${coachId ? `?coachId=${coachId}` : ""}`), 2000);

        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#E60000]" />
            <p className="text-slate-500 font-bold">جاري تحميل قائمة اللاعبين...</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-900">تسجيل الحضور</h1>
                <p className="text-slate-500 text-sm mt-1 font-semibold">حدد حالة كل لاعب ثم اضغط "حفظ الحضور"</p>
            </div>

            {coachId && (
                <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 px-5 py-4 rounded-2xl flex items-center gap-4 text-sm font-black shadow-md">
                    <Check className="w-5 h-5 text-amber-600" />
                    تحذير: أنت تسجل الحضور نيابة عن المدرب (كـ Admin).
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-5 rounded-2xl border-2 border-red-100 font-bold animate-shake">
                    ⚠️ {error}
                </div>
            )}

            {success && (
                <div className="bg-green-600 text-white p-5 rounded-2xl shadow-lg shadow-green-600/20 font-black animate-bounce-in flex items-center justify-center gap-2">
                    ✅ تم حفظ الحضور بنجاح! جاري العودة...
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
                {players.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold">لا يوجد لاعبون نشطون في هذه المجموعة.</div>
                ) : (
                    players.map(player => {
                        const current = records[player.id] || "PRESENT";
                        return (
                            <div key={player.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center font-black flex-shrink-0 border border-slate-200">
                                        {player.first_name[0]}
                                    </div>
                                    <span className="font-black text-slate-800 truncate text-lg">{player.first_name} {player.last_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {STATUS_OPTIONS.map(opt => {
                                        const Icon = opt.icon;
                                        const active = current === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => toggle(player.id, opt.value)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all active:scale-90 ${active ? `${opt.color} ring-2` : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="hidden md:inline">{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {players.length > 0 && (
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-[#E60000] text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition shadow-xl hover:shadow-red-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? 'جاري الحفظ...' : `حفظ الحضور (${players.length} لاعب)`}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function AttendancePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-300" /></div>}>
            <AttendanceContent />
        </Suspense>
    );
}
