"use client";
import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, MapPin, Search, Loader2, Check, X, Users } from "lucide-react";
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

    // Form data (v1.6.2 Enhanced)
    const [formData, setFormData] = useState({
        branch_id: "",
        group_ids: [] as string[],
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

    const toggleGroup = (groupId: string) => {
        setFormData(prev => ({
            ...prev,
            group_ids: prev.group_ids.includes(groupId)
                ? prev.group_ids.filter(id => id !== groupId)
                : [...prev.group_ids, groupId]
        }));
    };

    const selectAllGroups = () => {
        const branchGroups = groups.filter(g => g.branch_id === formData.branch_id).map(g => g.id);
        setFormData(prev => ({
            ...prev,
            group_ids: prev.group_ids.length === branchGroups.length ? [] : branchGroups
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.group_ids.length === 0) {
            setError("يرجى اختيار مجموعة واحدة على الأقل");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            console.log(`[Schedule v1.6.2] Saving bulk sessions for ${formData.group_ids.length} groups`);
            await fetchApi("/schedules", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    day_of_week: parseInt(formData.day_of_week)
                })
            });

            setIsFormOpen(false);
            setFormData({
                branch_id: "", group_ids: [], day_of_week: "6", start_time: "16:00", end_time: "18:00", field_name: ""
            });
            loadSchedules();
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء الحفظ");
        } finally {
            setSaving(false);
        }
    };

    const currentBranchGroups = groups.filter(g => g.branch_id === formData.branch_id);

    return (
        <div className="space-y-6 pb-12" dir="rtl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 underline decoration-[#E60000] decoration-4 underline-offset-8">جدول التدريبات (v1.6.2)</h1>
                    <p className="text-slate-500 text-sm mt-3 font-semibold">تخطيط جماعي للمواعيد - حدد مجموعات متعددة دفعة واحدة.</p>
                </div>

                {!isFormOpen && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-[#E60000] hover:bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black transition-all shadow-lg hover:shadow-red-500/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة مواعيد جماعية</span>
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl border-2 border-red-100 font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                <X className="w-5 h-5" /> {error}
            </div>}

            {isFormOpen && (
                <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-xl space-y-8 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <CalendarIcon className="w-6 h-6 text-[#E60000]" /> إضافة موعد تدريب جديد
                        </h2>
                        <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-900 p-2">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Branch Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-500 mr-2">الفرع <span className="text-[#E60000]">*</span></label>
                            <select
                                required
                                value={formData.branch_id}
                                onChange={e => setFormData({ ...formData, branch_id: e.target.value, group_ids: [] })}
                                className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-black text-slate-800 transition-all appearance-none"
                            >
                                <option value="" disabled>اختر الفرع للبدء...</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>

                        {/* MULTI-GROUP SELECTION (v1.6.2) */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-sm font-black text-slate-500 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#E60000]" /> المجموعات المستهدفة <span className="text-xs text-slate-400 font-bold">(يمكنك اختيار أكثر من واحدة)</span>
                                </label>
                                {formData.branch_id && currentBranchGroups.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={selectAllGroups}
                                        className="text-xs font-black text-[#E60000] hover:underline"
                                    >
                                        {formData.group_ids.length === currentBranchGroups.length ? "إلغاء الكل" : "اختيار كل المجموعات"}
                                    </button>
                                )}
                            </div>

                            {!formData.branch_id ? (
                                <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                                    <p className="text-slate-400 font-bold">يرجى اختيار الفرع أولاً لعرض المجموعات المتاحة.</p>
                                </div>
                            ) : currentBranchGroups.length === 0 ? (
                                <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                                    <p className="text-slate-400 font-bold">لا يوجد مجموعات مسجلة في هذا الفرع.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {currentBranchGroups.map(g => (
                                        <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => toggleGroup(g.id)}
                                            className={`p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between group ${formData.group_ids.includes(g.id)
                                                    ? "border-[#E60000] bg-red-50 text-[#E60000]"
                                                    : "border-slate-100 bg-white text-slate-600 hover:border-slate-300"
                                                }`}
                                        >
                                            <span className="font-black text-sm">{g.name}</span>
                                            {formData.group_ids.includes(g.id) && <Check className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-slate-50" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-500 mr-2">اليوم <span className="text-[#E60000]">*</span></label>
                                <select required value={formData.day_of_week} onChange={e => setFormData({ ...formData, day_of_week: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-bold text-slate-800 transition-all">
                                    {DAYS.map((day, idx) => <option key={idx} value={idx}>{day}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-500 mr-2">من الساعة <span className="text-[#E60000]">*</span></label>
                                <input required type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-black text-lg text-slate-800 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-500 mr-2">إلى الساعة <span className="text-[#E60000]">*</span></label>
                                <input required type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-black text-lg text-slate-800 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-500 mr-2">الملعب</label>
                                <div className="relative">
                                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" value={formData.field_name} onChange={e => setFormData({ ...formData, field_name: e.target.value })} className="w-full h-14 pr-12 pl-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-bold text-slate-800 transition-all" placeholder="الرئيسي" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-4 text-slate-500 font-black hover:text-slate-900 transition-colors uppercase tracking-widest text-xs">إلغاء</button>
                            <button type="submit" disabled={saving || !formData.branch_id || formData.group_ids.length === 0} className="bg-[#E60000] hover:bg-black text-white px-12 py-4 rounded-2xl flex items-center gap-3 font-black text-lg transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 active:scale-95">
                                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
                                <span>حفظ المواعيد ({formData.group_ids.length})</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!isFormOpen && (
                <>
                    {/* Filters */}
                    <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex flex-wrap gap-6 items-center">
                        <div className="space-y-2 flex-1 min-w-[200px]">
                            <label className="text-xs font-black text-slate-400 mr-2 uppercase tracking-tighter">التصفية بالفرع</label>
                            <select value={filterBranch} onChange={e => { setFilterBranch(e.target.value); setFilterGroup(""); }} className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#E60000] text-sm font-bold text-slate-700 outline-none">
                                <option value="">كل الفروع</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2 flex-1 min-w-[200px]">
                            <label className="text-xs font-black text-slate-400 mr-2 uppercase tracking-tighter">التصفية بالمجموعة</label>
                            <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} disabled={!filterBranch} className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#E60000] text-sm font-bold text-slate-700 disabled:opacity-50 outline-none">
                                <option value="">كل المجموعات</option>
                                {groups.filter(g => g.branch_id === filterBranch).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="bg-white rounded-[32px] border-2 border-slate-50 overflow-hidden shadow-sm">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50/50 text-slate-500 font-black border-b-2 border-slate-50">
                                <tr>
                                    <th className="px-8 py-6 uppercase tracking-wider">اليوم والتوقيت</th>
                                    <th className="px-8 py-6 uppercase tracking-wider">الفرع</th>
                                    <th className="px-8 py-6 uppercase tracking-wider">المجموعة</th>
                                    <th className="px-8 py-6 uppercase tracking-wider">المدرب</th>
                                    <th className="px-8 py-6 uppercase tracking-wider">الملعب</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-200" /></td></tr>
                                ) : schedules.length === 0 ? (
                                    <tr><td colSpan={5} className="p-20 text-center text-slate-400">لا توجد مواعيد تدريب مسجلة حالياً لهذه التصفية.</td></tr>
                                ) : (
                                    schedules.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6 font-black text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-[#E60000] group-hover:text-white transition-colors">
                                                        <CalendarIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p>{DAYS[item.day_of_week]}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{item.start_time} - {item.end_time}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black">{item.branch?.name}</span>
                                            </td>
                                            <td className="px-8 py-6 text-lg font-black text-[#E60000]">{item.group?.name}</td>
                                            <td className="px-8 py-6">{item.coach?.full_name}</td>
                                            <td className="px-8 py-6 text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {item.field_name || "الرئيسي"}
                                                </div>
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
