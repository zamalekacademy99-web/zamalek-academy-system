"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Check, X, Clock } from "lucide-react";
import { fetchApi } from "@/lib/api";

type AttStatus = "PRESENT" | "ABSENT_EXCUSED" | "ABSENT_UNEXCUSED";
type Player = { id: string; first_name: string; last_name: string; photo_url?: string };

const STATUS_OPTIONS: { value: AttStatus; label: string; color: string; icon: any }[] = [
    { value: "PRESENT", label: "حاضر", color: "bg-green-100 text-green-700 ring-green-400", icon: Check },
    { value: "ABSENT_EXCUSED", label: "غياب بعذر", color: "bg-yellow-100 text-yellow-700 ring-yellow-400", icon: Clock },
    { value: "ABSENT_UNEXCUSED", label: "غياب بدون عذر", color: "bg-red-100 text-red-700 ring-red-400", icon: X },
];

export default function AttendancePage() {
    const params = useParams();
    const search = useSearchParams();
    const router = useRouter();

    const groupId = params?.groupId as string;
    const scheduleId = search?.get('schedule') || '';

    const [players, setPlayers] = useState<Player[]>([]);
    const [records, setRecords] = useState<Record<string, AttStatus>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupId) return;
        fetchApi(`/coach/group/${groupId}/players`)
            .then(res => {
                const ps: Player[] = res.data;
                setPlayers(ps);
                // Default everyone to PRESENT
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
            setError('لم يتم تحديد جلسة (schedule). يرجى الدخول من لوحة التحكم.');
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
                    date: new Date().toISOString().split('T')[0],
                    records: recordsList
                })
            });
            setSuccess(true);
            setTimeout(() => router.push('/coach/dashboard'), 2000);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل قائمة اللاعبين...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">تسجيل الحضور</h1>
                <p className="text-slate-500 text-sm mt-1">حدد حالة كل لاعب ثم اضغط "حفظ الحضور"</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}
            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 font-bold">
                    ✅ تم حفظ الحضور بنجاح! سيتم تحويلك...
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                {players.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">لا يوجد لاعبون نشطون في هذه المجموعة.</div>
                ) : (
                    players.map(player => {
                        const current = records[player.id] || "PRESENT";
                        return (
                            <div key={player.id} className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 bg-red-100 text-[#E60000] rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                        {player.first_name[0]}
                                    </div>
                                    <span className="font-semibold text-slate-800 truncate">{player.first_name} {player.last_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {STATUS_OPTIONS.map(opt => {
                                        const Icon = opt.icon;
                                        const active = current === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => toggle(player.id, opt.value)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? `${opt.color} ring-2` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">{opt.label}</span>
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
                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-[#E60000] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-60"
                    >
                        {saving ? 'جاري الحفظ...' : `حفظ الحضور (${players.length} لاعب)`}
                    </button>
                </div>
            )}
        </div>
    );
}
