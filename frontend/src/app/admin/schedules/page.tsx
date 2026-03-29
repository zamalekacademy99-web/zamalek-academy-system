"use client";
import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, MapPin, Search, Loader2, Check, X, Users, ChevronDown } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Branch = { id: string; name: string };
type Group = { id: string; name: string; branch_id: string };
type Coach = { id: string; full_name: string; branch_id: string };
type Schedule = {
    id: string;
    branch: Branch;
    group: Group;
    group_id: string;
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

    // Form data (v1.6.3 Refined)
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
        <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8 mt-4">
                <div className="text-right">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">جدول التدريبات <span className="text-[#E60000] text-sm font-bold bg-red-50 px-2 py-1 rounded ml-2">v1.6.3</span></h1>
                    <p className="text-slate-500 text-sm mt-3 font-medium">إدارة وتخطيط مواعيد التدريبات لجميع فروع الأكاديمية.</p>
                </div>

                {!isFormOpen && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-[#E60000] hover:bg-black text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-base font-black transition-all shadow-xl shadow-red-100 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة مواعيد جماعية</span>
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-5 rounded-2xl border-2 border-red-100 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <X className="w-6 h-6 shrink-0" /> <span className="text-right flex-1">{error}</span>
            </div>}

            {isFormOpen && (
                <div className="bg-white p-8 sm:p-10 rounded-[40px] border-2 border-slate-50 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-w-5xl mx-auto">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#E60000]/5 rounded-bl-full -z-0" />

                    <div className="flex justify-between items-center border-b border-slate-50 pb-8 mb-8 relative z-10">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                            <CalendarIcon className="w-8 h-8 text-[#E60000]" /> إضافة موعد تدريب جديد
                        </h2>
                        <button onClick={() => setIsFormOpen(false)} className="bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 p-3 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10 relative z-10 text-right">
                        {/* Branch Selection - Fixed Layout */}
                        <div className="space-y-4">
                            <label className="block text-sm font-black text-slate-500 px-1">الفرع <span className="text-[#E60000]">*</span></label>
                            <div className="relative">
                                <select
                                    required
                                    value={formData.branch_id}
                                    onChange={e => setFormData({ ...formData, branch_id: e.target.value, group_ids: [] })}
                                    className="w-full h-16 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-black text-slate-800 transition-all appearance-none text-right"
                                >
                                    <option value="" disabled>اختر الفرع للبدء...</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                <ChevronDown className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* MULTI-GROUP SELECTION */}
                        <div className="space-y-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
                                <label className="text-base font-black text-slate-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-[#E60000]" /> المجموعات المستهدفة
                                    <span className="text-sm text-[#0066FF] font-black mr-2 bg-blue-50 px-3 py-1 rounded-lg">(يمكن اختيار أكثر من مجموعة)</span>
                                </label>
                                {formData.branch_id && currentBranchGroups.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={selectAllGroups}
                                        className="text-sm font-black text-[#E60000] hover:text-black transition-colors"
                                    >
                                        {formData.group_ids.length === currentBranchGroups.length ? "• إلغاء تحديد الكل" : "• تحديد كل مجموعات الفرع"}
                                    </button>
                                )}
                            </div>

                            {!formData.branch_id ? (
                                <div className="p-14 border-2 border-dashed border-slate-100 rounded-[32px] text-center bg-slate-50/50">
                                    <p className="text-slate-400 font-bold text-lg">يرجى اختيار الفرع أولاً لعرض المجموعات المتاحة.</p>
                                </div>
                            ) : currentBranchGroups.length === 0 ? (
                                <div className="p-14 border-2 border-dashed border-slate-100 rounded-[32px] text-center bg-slate-50/50">
                                    <p className="text-slate-400 font-bold text-lg">لا توجد مجموعات مسجلة في هذا الفرع حالياً.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {currentBranchGroups.map(g => (
                                        <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => toggleGroup(g.id)}
                                            className={`p-5 rounded-2xl border-2 text-right transition-all flex items-center justify-between group h-20 ${formData.group_ids.includes(g.id)
                                                ? "border-[#E60000] bg-red-50 text-[#E60000] shadow-md shadow-red-100"
                                                : "border-slate-50 bg-white text-slate-600 hover:border-slate-200"
                                                }`}
                                        >
                                            <span className={`font-black tracking-tight ${formData.group_ids.includes(g.id) ? "scale-105" : ""} transition-transform`}>{g.name}</span>
                                            {formData.group_ids.includes(g.id) ? (
                                                <div className="bg-[#E60000] text-white p-1 rounded-full"><Check className="w-4 h-4" /></div>
                                            ) : (
                                                <div className="w-6 h-6 border-2 border-slate-100 rounded-full group-hover:border-slate-300" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="h-0.5 bg-slate-50 mx-4" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-500 px-1">اليوم <span className="text-[#E60000]">*</span></label>
                                <div className="relative">
                                    <select required value={formData.day_of_week} onChange={e => setFormData({ ...formData, day_of_week: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-bold text-slate-800 transition-all appearance-none text-right">
                                        {DAYS.map((day, idx) => <option key={idx} value={idx}>{day}</option>)}
                                    </select>
                                    <ChevronDown className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-500 px-1">من الساعة <span className="text-[#E60000]">*</span></label>
                                <input required type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-black text-lg text-slate-800 transition-all text-right" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-500 px-1">إلى الساعة <span className="text-[#E60000]">*</span></label>
                                <input required type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-black text-lg text-slate-800 transition-all text-right" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-500 px-1">الملعب</label>
                                <div className="relative">
                                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" value={formData.field_name} onChange={e => setFormData({ ...formData, field_name: e.target.value })} className="w-full h-14 pr-12 pl-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-bold text-slate-800 transition-all text-right" placeholder="الملعب الرئيسي" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10 border-t border-slate-50">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-10 h-16 text-slate-400 font-extrabold hover:text-slate-900 transition-colors uppercase tracking-widest text-sm order-2 sm:order-1">إلغاء</button>
                            <button type="submit" disabled={saving || !formData.branch_id || formData.group_ids.length === 0} className="bg-[#E60000] hover:bg-black text-white px-16 h-16 rounded-[24px] flex items-center justify-center gap-4 font-black text-xl transition-all shadow-2xl shadow-red-200 disabled:opacity-40 active:scale-95 order-1 sm:order-2">
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
                    <div className="bg-white p-8 rounded-[40px] border-2 border-slate-50 shadow-sm flex flex-wrap gap-8 items-end relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-slate-50/50 rounded-br-full -z-0" />
                        <div className="space-y-3 flex-1 min-w-[280px] relative z-10">
                            <label className="text-xs font-black text-slate-400 px-1 uppercase tracking-tighter">التصفية بالفرع</label>
                            <div className="relative">
                                <select value={filterBranch} onChange={e => { setFilterBranch(e.target.value); setFilterGroup(""); }} className="w-full h-14 px-5 bg-slate-50/80 border-2 border-slate-50 rounded-2xl focus:border-[#E60000] text-base font-black text-slate-700 outline-none appearance-none transition-all">
                                    <option value="">كل الفروع</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="space-y-3 flex-1 min-w-[280px] relative z-10">
                            <label className="text-xs font-black text-slate-400 px-1 uppercase tracking-tighter">التصفية بالمجموعة</label>
                            <div className="relative">
                                <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} disabled={!filterBranch} className="w-full h-14 px-5 bg-slate-50/80 border-2 border-slate-50 rounded-2xl focus:border-[#E60000] text-base font-black text-slate-700 disabled:opacity-50 outline-none appearance-none transition-all">
                                    <option value="">كل المجموعات</option>
                                    {groups.filter(g => g.branch_id === filterBranch).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="bg-white rounded-[40px] border-2 border-slate-50 overflow-hidden shadow-sm relative">
                        <table className="w-full text-right text-base">
                            <thead className="bg-slate-50/80 text-slate-400 font-black border-b-2 border-slate-50">
                                <tr>
                                    <th className="px-10 py-8 uppercase tracking-wider">اليوم والتوقيت</th>
                                    <th className="px-10 py-8 uppercase tracking-wider">الفرع</th>
                                    <th className="px-10 py-8 uppercase tracking-wider">المجموعة</th>
                                    <th className="px-10 py-8 uppercase tracking-wider">المدرب</th>
                                    <th className="px-10 py-8 uppercase tracking-wider text-left">الملعب</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-32 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-slate-100" /></td></tr>
                                ) : schedules.length === 0 ? (
                                    <tr><td colSpan={5} className="p-32 text-center text-slate-400 font-black text-lg">لا توجد مواعيد تدريب مسجلة حالياً لهذه التصفية.</td></tr>
                                ) : (
                                    schedules.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-8 font-black text-slate-900 border-r-4 border-transparent group-hover:border-[#E60000] transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#E60000] group-hover:text-white transition-all shadow-sm">
                                                        <CalendarIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg">{DAYS[item.day_of_week]}</p>
                                                        <p className="text-xs text-slate-400 font-extrabold mt-1 tracking-widest">{item.start_time} - {item.end_time}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="bg-slate-50 px-4 py-2 rounded-xl text-[11px] font-black text-slate-500 border border-slate-100">{item.branch?.name}</span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-black text-[#E60000] tracking-tight">{item.group?.name}</span>
                                                    <span className="text-[10px] text-slate-300 font-black uppercase mt-1">Group ID: {item.group_id.slice(0, 8)}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 font-extrabold text-slate-600">{item.coach?.full_name}</td>
                                            <td className="px-10 py-8 text-slate-400 text-left">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <span className="font-bold">{item.field_name || "الرئيسي"}</span>
                                                    <MapPin className="w-4 h-4 text-[#E60000]" />
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
