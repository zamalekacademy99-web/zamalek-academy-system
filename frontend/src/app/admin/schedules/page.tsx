"use client";
import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, MapPin, Search, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Branch = { id: string; name: string };
type Group = { id: string; name: string; branch_id: string };
type Coach = { id: string; full_name: string; branch_id: string };
type Schedule = {
    id: string;
    branch: Branch;
    group: Group;
    coach: Coach;
    day_of_week: number;
    start_time: string;
    end_time: string;
    field_name: string;
};

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);

    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filterBranch, setFilterBranch] = useState("");
    const [filterGroup, setFilterGroup] = useState("");

    // Form data
    const [formData, setFormData] = useState({
        branch_id: "",
        group_id: "",
        coach_id: "",
        day_of_week: "6", // Default Saturday
        start_time: "16:00",
        end_time: "18:00",
        field_name: ""
    });

    useEffect(() => {
        loadBaseData();
    }, []);

    useEffect(() => {
        loadSchedules();
    }, [filterBranch, filterGroup]);

    const loadBaseData = async () => {
        try {
            const [bRes, gRes, cRes] = await Promise.all([
                fetchApi("/branches"),
                fetchApi("/groups"),
                fetchApi("/coaches")
            ]);
            setBranches(bRes.data);
            setGroups(gRes.data);
            setCoaches(cRes.data);
        } catch (err: any) {
            setError("تعذر تحميل البيانات الأساسية");
        }
    };

    const loadSchedules = async () => {
        try {
            setLoading(true);
            let url = "/schedules?";
            if (filterBranch) url += `branch_id=${filterBranch}&`;
            if (filterGroup) url += `group_id=${filterGroup}&`;

            const res = await fetchApi(url);
            setSchedules(res.data);
        } catch (err: any) {
            setError("حدث خطأ أثناء تحميل الجداول");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await fetchApi("/schedules", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    day_of_week: parseInt(formData.day_of_week)
                })
            });

            setIsFormOpen(false);
            setFormData({
                branch_id: "", group_id: "", coach_id: "", day_of_week: "6", start_time: "16:00", end_time: "18:00", field_name: ""
            });
            loadSchedules();
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء الحفظ");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">جدول التدريبات</h1>
                    <p className="text-slate-500 text-sm mt-1">تخطيط وإدارة مواعيد التدريب والملاعب لجميع الفروع.</p>
                </div>

                {!isFormOpen && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-[#E60000] hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة موعد جديد</span>
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}

            {isFormOpen && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">إضافة موعد تدريب جديد</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">الفرع <span className="text-[#E60000]">*</span></label>
                                <select required value={formData.branch_id} onChange={e => setFormData({ ...formData, branch_id: e.target.value, group_id: "", coach_id: "" })} className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none">
                                    <option value="" disabled>اختر الفرع...</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">المجموعة <span className="text-[#E60000]">*</span></label>
                                <select required disabled={!formData.branch_id} value={formData.group_id} onChange={e => setFormData({ ...formData, group_id: e.target.value })} className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] disabled:bg-gray-100 outline-none">
                                    <option value="" disabled>اختر المجموعة...</option>
                                    {groups.filter(g => g.branch_id === formData.branch_id).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">المدرب <span className="text-[#E60000]">*</span></label>
                                <select required disabled={!formData.branch_id} value={formData.coach_id} onChange={e => setFormData({ ...formData, coach_id: e.target.value })} className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] disabled:bg-gray-100 outline-none">
                                    <option value="" disabled>اختر المدرب...</option>
                                    {coaches.filter(c => c.branch_id === formData.branch_id).map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2 relative">
                                <label className="text-sm font-semibold text-slate-700">اليوم <span className="text-[#E60000]">*</span></label>
                                <select required value={formData.day_of_week} onChange={e => setFormData({ ...formData, day_of_week: e.target.value })} className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none">
                                    {DAYS.map((day, idx) => <option key={idx} value={idx}>{day}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">من الساعة <span className="text-[#E60000]">*</span></label>
                                <input required type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">إلى الساعة <span className="text-[#E60000]">*</span></label>
                                <input required type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">اسم الملعب (اختياري)</label>
                                <input type="text" value={formData.field_name} onChange={e => setFormData({ ...formData, field_name: e.target.value })} className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none" placeholder="الملعب الرئيسي" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors font-medium">إلغاء</button>
                            <button type="submit" disabled={saving} className="bg-[#E60000] hover:bg-red-700 text-white px-8 py-2 rounded-md flex items-center gap-2 font-medium transition-colors disabled:opacity-50">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                <span>حفظ الموعد</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!isFormOpen && (
                <>
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
                        <div className="space-y-1 flex-1 min-w-[200px]">
                            <label className="text-xs font-semibold text-slate-500">تصفية بالفرع</label>
                            <select value={filterBranch} onChange={e => { setFilterBranch(e.target.value); setFilterGroup(""); }} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#E60000] text-sm text-slate-700 outline-none">
                                <option value="">كل الفروع</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1 flex-1 min-w-[200px]">
                            <label className="text-xs font-semibold text-slate-500">تصفية بالمجموعة</label>
                            <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} disabled={!filterBranch} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#E60000] text-sm text-slate-700 disabled:bg-gray-100 outline-none">
                                <option value="">كل المجموعات</option>
                                {groups.filter(g => g.branch_id === filterBranch).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-right text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">اليوم والتوقيت</th>
                                    <th className="px-6 py-4">الفرع</th>
                                    <th className="px-6 py-4">المجموعة</th>
                                    <th className="px-6 py-4">المدرب</th>
                                    <th className="px-6 py-4">الملعب</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">جاري التحميل...</td></tr>
                                ) : schedules.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">لا توجد مواعيد تدريب مسجلة</td></tr>
                                ) : (
                                    schedules.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-[#E60000]" />
                                                {DAYS[item.day_of_week]} - {item.start_time} إلى {item.end_time}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{item.branch?.name}</td>
                                            <td className="px-6 py-4 font-bold text-slate-700">{item.group?.name}</td>
                                            <td className="px-6 py-4">{item.coach?.full_name}</td>
                                            <td className="px-6 py-4 flex items-center gap-1">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                {item.field_name || "الملعب الرئيسي"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
