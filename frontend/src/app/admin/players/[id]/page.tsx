"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Copy, Check, Send } from "lucide-react";
import { fetchApi } from "@/lib/api";

function CopyCard({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
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
    ABSENT_EXCUSED: "بعذر",
    ABSENT_UNEXCUSED: "غياب",
};

export default function AdminPlayerDashboardPage() {
    const params = useParams();
    const id = params?.id as string;

    const [player, setPlayer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Message to parent
    const [message, setMessage] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    const [msgSuccess, setMsgSuccess] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchApi(`/players/${id}`)
            .then(res => setPlayer(res.data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSendMessage = async () => {
        if (!message.trim() || !player?.parent?.id) return;
        setSendingMsg(true);
        try {
            await fetchApi('/messages', {
                method: 'POST',
                body: JSON.stringify({ parent_id: player.parent.id, player_id: player.id, message })
            });
            setMessage('');
            setMsgSuccess(true);
            setTimeout(() => setMsgSuccess(false), 3000);
        } catch (err: any) {
            alert('فشل إرسال الرسالة: ' + err.message);
        } finally {
            setSendingMsg(false);
        }
    };

    if (loading) return (
        <div className="space-y-4 animate-pulse max-w-5xl mx-auto">
            <div className="h-36 bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl" />)}
            </div>
        </div>
    );

    if (error || !player) return (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-8 text-center">
            <p className="font-bold text-xl mb-2">⚠️ تعذر تحميل الملف الشخصي</p>
            <p className="text-sm">{error}</p>
        </div>
    );

    const totalSessions = player.attendance?.length || 0;
    const presentCount = player.attendance?.filter((a: any) => a.status === 'PRESENT').length || 0;
    const presenceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
    const latestEval = player.evaluations?.[0];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-7 flex flex-wrap items-center gap-5 shadow-xl">
                <div className="w-20 h-20 bg-[#E60000] rounded-xl flex items-center justify-center text-4xl font-black flex-shrink-0">
                    {player.first_name?.[0]}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-black">{player.first_name} {player.last_name}</h1>
                    <p className="text-slate-300 text-sm mt-1">{player.group?.name} • {player.branch?.name}</p>
                    <p className="text-slate-400 text-sm mt-0.5">مدرب: {player.coach?.full_name}</p>
                </div>
                <div className="text-center bg-white/10 rounded-xl px-6 py-4 backdrop-blur-sm">
                    <div className="text-4xl font-black text-white">{presenceRate}%</div>
                    <div className="text-xs text-slate-400 font-semibold mt-0.5">نسبة الحضور</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Attendance Stats */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4"><div className="w-2 h-2 bg-[#E60000] rounded-full" /><h3 className="font-bold text-slate-800">الحضور</h3></div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">إجمالي الجلسات</span><span className="font-black text-slate-900 text-lg">{totalSessions}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-green-600">حضر</span><span className="font-bold text-green-700">{presentCount}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-red-500">غائب</span><span className="font-bold text-red-600">{totalSessions - presentCount}</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-[#E60000] rounded-full" style={{ width: `${presenceRate}%` }} />
                        </div>
                    </div>

                    {/* Recent Attendance Mini List */}
                    <div className="mt-4 space-y-1.5 max-h-36 overflow-y-auto">
                        {player.attendance?.slice(0, 8).map((a: any) => (
                            <div key={a.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                                <span className="text-slate-500">{new Date(a.date).toLocaleDateString('ar-EG')}</span>
                                <span className={`px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                                    {STATUS_LABELS[a.status] || a.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Latest Evaluation */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#E60000] rounded-full" />
                            <h3 className="font-bold text-slate-800">آخر تقييم</h3>
                        </div>
                        {latestEval && (
                            <span className="text-xs text-slate-400">{new Date(latestEval.date).toLocaleDateString('ar-EG')} • {latestEval.coach?.full_name}</span>
                        )}
                    </div>

                    {!latestEval ? (
                        <div className="py-8 text-center text-slate-400">
                            <p className="text-2xl mb-1">⭐</p>
                            <p className="text-sm">لم يتم تقييم هذا اللاعب بعد.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {CRITERIA.map(c => (
                                <div key={c.key}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600 font-medium">{c.label}</span>
                                        <span className="font-black text-slate-900">{latestEval[c.key]}/10</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${c.color} rounded-full transition-all`} style={{ width: `${latestEval[c.key] * 10}%` }} />
                                    </div>
                                </div>
                            ))}
                            {latestEval.notes && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 mt-3">
                                    <p className="text-xs text-blue-500 font-bold mb-1">ملاحظة المدرب:</p>
                                    <p className="text-blue-900 text-sm leading-relaxed">{latestEval.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Parent Credentials */}
                {player.parent?.user && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-[#E60000] rounded-full" />
                            <h3 className="font-bold text-slate-800">بيانات ولي الأمر</h3>
                        </div>
                        <p className="text-sm text-slate-600 font-semibold">{player.parent.user.name}</p>
                        <CopyCard label="البريد الإلكتروني" value={player.parent.user.email} />
                        <CopyCard label="رقم الهاتف" value={player.parent.phone} />
                        <CopyCard label="كلمة المرور" value={player.parent.user.plain_password || player.parent.phone} />
                    </div>
                )}

                {/* Direct Message to Parent */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-[#E60000] rounded-full" />
                        <h3 className="font-bold text-slate-800">إرسال رسالة لولي الأمر</h3>
                    </div>
                    {msgSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-3 text-sm font-bold">
                            ✅ تم إرسال الرسالة بنجاح! ستظهر في بوابة ولي الأمر.
                        </div>
                    )}
                    <textarea
                        rows={4}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="اكتب رسالة لولي الأمر هنا... ستظهر لهم في بوابة ولي الأمر مباشرة."
                        className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#E60000] outline-none resize-none"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={sendingMsg || !message.trim()}
                        className="mt-3 flex items-center gap-2 bg-[#E60000] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        {sendingMsg ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                    </button>
                </div>
            </div>
        </div>
    );
}
