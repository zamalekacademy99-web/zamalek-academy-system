"use client";
import { useState, useEffect } from "react";
import { Check, X, Info, Save, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Branch = { id: string; name: string };
type Group = { id: string; name: string; branch_id: string };
type Schedule = { id: string; group_id: string; day_of_week: number; start_time: string; end_time: string };
type Player = { id: string; first_name: string; last_name: string; group_id: string };
type AttendanceRecord = { player_id: string; status: "PRESENT" | "ABSENT_EXCUSED" | "ABSENT_UNEXCUSED" | "PENDING" };

export default function AttendancePage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);

    const [loadingFilters, setLoadingFilters] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Filter State
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedSchedule, setSelectedSchedule] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Active Roster
    const [roster, setRoster] = useState<(Player & { status: string })[]>([]);

    useEffect(() => {
        loadFilters();
    }, []);

    const loadFilters = async () => {
        try {
            const [bRes, gRes, sRes, pRes] = await Promise.all([
                fetchApi("/branches"),
                fetchApi("/groups"),
                fetchApi("/schedules"),
                fetchApi("/players") // Fetch all active players
            ]);
            setBranches(bRes.data);
            setGroups(gRes.data);
            setSchedules(sRes.data);
            setPlayers(pRes.data);
        } catch (err) {
            setMessage({ type: 'error', text: "حدث خطأ أثناء تحميل إعدادات الحضور." });
        } finally {
            setLoadingFilters(false);
        }
    };

    // When Group or Schedule or Date changes, fetch attendance
    useEffect(() => {
        if (selectedGroup && selectedSchedule && selectedDate) {
            loadAttendanceSheet();
        } else {
            setRoster([]);
        }
    }, [selectedGroup, selectedSchedule, selectedDate]);

    const loadAttendanceSheet = async () => {
        setLoadingData(true);
        setMessage(null);
        try {
            // Filter players for this group
            const groupPlayers = players.filter(p => p.group_id === selectedGroup);

            // Try to fetch existing attendance records
            const attRes = await fetchApi(`/attendance?schedule_id=${selectedSchedule}&date=${selectedDate}`);
            const existingRecords = attRes.data || [];

            // Map players to roster state
            const mappedRoster = groupPlayers.map(player => {
                const existing = existingRecords.find((r: any) => r.player_id === player.id);
                return {
                    ...player,
                    status: existing ? existing.status : "PENDING"
                };
            });

            setRoster(mappedRoster);
        } catch (err: any) {
            setMessage({ type: 'error', text: "فشل في تحميل كشف الحضور." });
        } finally {
            setLoadingData(false);
        }
    };

    const handleStatusChange = (playerId: string, status: string) => {
        setRoster(prev => prev.map(p => p.id === playerId ? { ...p, status } : p));
    };

    const handleSave = async () => {
        if (!selectedSchedule || !selectedDate) return;
        setSaving(true);
        setMessage(null);

        // Filter out PENDING
        const recordsToSave = roster
            .filter(p => p.status !== "PENDING")
            .map(p => ({
                player_id: p.id,
                status: p.status
            }));

        if (recordsToSave.length === 0) {
            setMessage({ type: 'error', text: "يرجى تسجيل حضور أو غياب لاعب واحد على الأقل قبل الحفظ." });
            setSaving(false);
            return;
        }

        try {
            await fetchApi("/attendance/batch", {
                method: 'POST',
                body: JSON.stringify({
                    schedule_id: selectedSchedule,
                    date: selectedDate,
                    attendance_records: recordsToSave
                })
            });
            setMessage({ type: 'success', text: "تم حفظ كشف الحضور بنجاح." });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "حدث خطأ أثناء الحفظ." });
        } finally {
            setSaving(false);
        }
    };

    const filteredGroups = groups.filter(g => g.branch_id === selectedBranch);
    const filteredSchedules = schedules.filter(s => s.group_id === selectedGroup);

    if (loadingFilters) return <div className="p-8 text-center text-slate-500">جاري تحميل البيانات...</div>;

    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">تسجيل الحضور</h1>
                    <p className="text-slate-500 text-sm mt-1">سجل حضور اللاعبين للمجموعة التدريبية المختارة.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg border flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Selectors */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">التاريخ <span className="text-[#E60000]">*</span></label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">الفرع <span className="text-[#E60000]">*</span></label>
                    <select
                        value={selectedBranch}
                        onChange={(e) => {
                            setSelectedBranch(e.target.value);
                            setSelectedGroup("");
                            setSelectedSchedule("");
                        }}
                        className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none"
                    >
                        <option value="">اختر الفرع...</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">المجموعة <span className="text-[#E60000]">*</span></label>
                    <select
                        value={selectedGroup}
                        onChange={(e) => {
                            setSelectedGroup(e.target.value);
                            setSelectedSchedule("");
                        }}
                        disabled={!selectedBranch}
                        className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] disabled:bg-gray-100 outline-none"
                    >
                        <option value="">اختر المجموعة...</option>
                        {filteredGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">الموعد (الجدول) <span className="text-[#E60000]">*</span></label>
                    <select
                        value={selectedSchedule}
                        onChange={(e) => setSelectedSchedule(e.target.value)}
                        disabled={!selectedGroup}
                        className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] disabled:bg-gray-100 outline-none"
                    >
                        <option value="">اختر موعد التدريب...</option>
                        {filteredSchedules.map(s => (
                            <option key={s.id} value={s.id}>{days[s.day_of_week]} ({s.start_time} - {s.end_time})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Attendance Sheet */}
            {selectedSchedule && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-slate-50 flex items-center justify-between flex-wrap gap-4">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            قائمة لاعبي المجموعة
                            <span className="bg-[#E60000] text-white text-xs px-2 py-0.5 rounded-full">{roster.length}</span>
                        </h2>
                        <button
                            onClick={handleSave}
                            disabled={saving || loadingData || roster.length === 0}
                            className="bg-[#E60000] hover:bg-red-700 text-white px-6 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>حفظ كشف اليوم</span>
                        </button>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {loadingData ? (
                            <div className="p-8 text-center text-slate-500">جاري تحميل اللاعبين وتاريخ الحضور...</div>
                        ) : roster.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">لا يوجد لاعبين مسجلين في هذه المجموعة.</div>
                        ) : (
                            roster.map((player) => (
                                <div key={player.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                            {player.first_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{player.first_name} {player.last_name}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">تسجيل الحالة: {player.status === 'PENDING' ? 'لم يحدد بعد' : 'مسجل'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleStatusChange(player.id, 'PRESENT')}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-2 border rounded-md transition-all ${player.status === 'PRESENT' ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' : 'border-gray-300 text-slate-600 hover:bg-green-50'}`}
                                        >
                                            <Check className="w-4 h-4" />
                                            <span className="text-sm font-bold">حضور</span>
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(player.id, 'ABSENT_EXCUSED')}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-2 border rounded-md transition-all ${player.status === 'ABSENT_EXCUSED' ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500' : 'border-gray-300 text-slate-600 hover:bg-orange-50'}`}
                                        >
                                            <Info className="w-4 h-4" />
                                            <span className="text-sm font-bold">عذر</span>
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(player.id, 'ABSENT_UNEXCUSED')}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-2 border rounded-md transition-all ${player.status === 'ABSENT_UNEXCUSED' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' : 'border-gray-300 text-slate-600 hover:bg-red-50'}`}
                                        >
                                            <X className="w-4 h-4" />
                                            <span className="text-sm font-bold">غياب</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {!selectedSchedule && (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-12 text-center">
                    <p className="text-slate-500 font-medium">يرجى تحديد الفرع والمجموعة والموعد لعرض كشف اللاعبين.</p>
                </div>
            )}
        </div>
    );
}

// Icon helper component for missing CheckCircle2 if needed
function CheckCircle2(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
    );
}
