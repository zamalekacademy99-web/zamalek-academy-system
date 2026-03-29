"use client";

import { useState, useEffect } from "react";
import { UserPlus, CheckCircle2, Copy } from "lucide-react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

type Branch = { id: string; name: string };
type Group = { id: string; name: string; branch_id: string };
type Coach = { id: string; full_name: string; branch_id: string };

export default function RegisterPlayerPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<any>(null);

    const [formData, setFormData] = useState({
        player_first_name: "",
        player_last_name: "",
        dob: "",
        branch_id: "",
        group_id: "",
        coach_id: "",
        parent_phone: "",
        parent_name: "",
        parent_email: "",
        payment_amount: "",
        payment_method: "CASH"
    });

    useEffect(() => {
        loadFilterData();
    }, []);

    const loadFilterData = async () => {
        try {
            const [bRes, gRes, cRes] = await Promise.all([
                fetchApi("/branches"),
                fetchApi("/groups"),
                fetchApi("/coaches")
            ]);
            setBranches(bRes.data);
            setGroups(gRes.data);
            setCoaches(cRes.data);
        } catch (err) {
            setError("حدث خطأ أثناء تحميل البيانات الأساسية.");
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Reset sub-selections when branch changes
        if (field === "branch_id") {
            setFormData(prev => ({ ...prev, group_id: "", coach_id: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessData(null);

        try {
            const payload = {
                ...formData,
                reference_no: `REG-${Date.now()}`
            };
            const response = await fetchApi("/players/register", {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Set success message with generated credentials
            setSuccessData({
                isNewParent: response.data?.is_new_parent ?? true,
                email: formData.parent_email || `${formData.parent_phone}@zamalek-academy.local`,
                password: formData.parent_phone,
                message: response.message || "تم تسجيل اللاعب بنجاح."
            });

            // Reset form
            setFormData({
                player_first_name: "",
                player_last_name: "",
                dob: "",
                branch_id: "",
                group_id: "",
                coach_id: "",
                parent_phone: "",
                parent_email: "",
                parent_name: "",
                payment_amount: "",
                payment_method: "CASH"
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء التسجيل.");
        } finally {
            setSaving(false);
        }
    };

    const copyCredentials = () => {
        if (!successData) return;
        const text = `بيانات الدخول لبوابة أولياء الأمور:\nالبريد الإلكتروني: ${successData.email}\nكلمة المرور: ${successData.password}\nالرابط: ${window.location.origin}/login`;
        navigator.clipboard.writeText(text);
        alert("تم نسخ بيانات الدخول بنجاح!");
    };

    const filteredGroups = groups.filter(g => g.branch_id === formData.branch_id);
    const filteredCoaches = coaches.filter(c => c.branch_id === formData.branch_id);

    if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل الإعدادات...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">تسجيل لاعب جديد</h1>
                    <p className="text-slate-500 text-sm mt-1">إضافة لاعب جديد وربطه بحساب ولي الأمر وإثبات الدفعة الأولى.</p>
                </div>
                <Link href="/admin/players" className="text-sm font-medium text-slate-500 hover:text-slate-800">
                    العودة للقائمة
                </Link>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}

            {successData && (
                <div className="bg-green-50 text-green-800 p-6 rounded-lg border border-green-200 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-lg text-green-700">
                        <CheckCircle2 className="w-6 h-6" />
                        {successData.message}
                    </div>
                    {successData.isNewParent && (
                        <div className="bg-white p-4 rounded-md border border-green-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-2">بيانات دخول ولي الأمر (حساب جديد):</p>
                                <p className="font-bold font-mono text-slate-900 mb-1" dir="ltr">Email: {successData.email}</p>
                                <p className="font-bold font-mono text-slate-900" dir="ltr">Password: {successData.password}</p>
                            </div>
                            <button onClick={copyCredentials} type="button" className="flex flex-col items-center gap-1 text-slate-500 hover:text-[#E60000] transition-colors p-2">
                                <Copy className="w-5 h-5" />
                                <span className="text-xs font-bold">نسخ</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
                    {/* Section 1: Player Information */}
                    <div className="p-8 space-y-6">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-red-100 text-[#E60000] flex items-center justify-center text-sm">1</span>
                            بيانات اللاعب
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">الاسم الأول <span className="text-[#E60000]">*</span></label>
                                <input required value={formData.player_first_name} onChange={e => handleFormChange('player_first_name', e.target.value)} type="text" className="w-full h-11 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent transition" placeholder="مثال: أحمد" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">اسم العائلة <span className="text-[#E60000]">*</span></label>
                                <input required value={formData.player_last_name} onChange={e => handleFormChange('player_last_name', e.target.value)} type="text" className="w-full h-11 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent transition" placeholder="مثال: محمود" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">تاريخ الميلاد <span className="text-[#E60000]">*</span></label>
                                <input required value={formData.dob} onChange={e => handleFormChange('dob', e.target.value)} type="date" className="w-full h-11 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent transition" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Academy Assignment */}
                    <div className="p-8 space-y-6">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-red-100 text-[#E60000] flex items-center justify-center text-sm">2</span>
                            التسكين الأكاديمي
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">الفرع <span className="text-[#E60000]">*</span></label>
                                <select required value={formData.branch_id} onChange={e => handleFormChange('branch_id', e.target.value)} className="w-full h-11 px-4 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent transition">
                                    <option value="" disabled>اختر الفرع...</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">المجموعة <span className="text-[#E60000]">*</span></label>
                                <select required value={formData.group_id} onChange={e => handleFormChange('group_id', e.target.value)} disabled={!formData.branch_id} className="w-full h-11 px-4 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] disabled:bg-gray-100 transition">
                                    <option value="" disabled>اختر المجموعة...</option>
                                    {filteredGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">المدرب <span className="text-[#E60000]">*</span></label>
                                <select required value={formData.coach_id} onChange={e => handleFormChange('coach_id', e.target.value)} disabled={!formData.branch_id} className="w-full h-11 px-4 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] disabled:bg-gray-100 transition">
                                    <option value="" disabled>اختر المدرب...</option>
                                    {filteredCoaches.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Parent & Financial */}
                    <div className="p-8 space-y-6">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-red-100 text-[#E60000] flex items-center justify-center text-sm">3</span>
                            ولي الأمر والمدفوعات
                        </h2>
                        <div className="bg-slate-50 p-6 rounded-md border border-slate-200">
                            <p className="text-sm text-slate-600 mb-4">أدخل رقم هاتف ولي الأمر. سيتم إنشاء حساب له تلقائياً.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">رقم الهاتف <span className="text-[#E60000]">*</span></label>
                                    <input required value={formData.parent_phone} onChange={e => handleFormChange('parent_phone', e.target.value)} type="tel" className="w-full h-11 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent transition text-left" placeholder="مثال: 01012345678" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">اسم ولي الأمر</label>
                                    <input value={formData.parent_name} onChange={e => handleFormChange('parent_name', e.target.value)} type="text" className="w-full h-11 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent transition" placeholder="في حال إنشاء حساب جديد" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">البريد الإلكتروني (اختياري)</label>
                                    <input value={(formData as any).parent_email || ""} onChange={e => handleFormChange('parent_email', e.target.value)} type="email" className="w-full h-11 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent transition text-left" placeholder="example@mail.com" dir="ltr" />
                                    <p className="text-xs text-slate-500">للبحث بدقة عن الحساب وتفادي عمل حسابات مكررة.</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-bold text-slate-800 mb-4">تحصيل الدفعة الأولى</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">المبلغ المدفوع (ج.م) <span className="text-[#E60000]">*</span></label>
                                        <input required value={formData.payment_amount} onChange={e => handleFormChange('payment_amount', e.target.value)} type="number" step="0.01" className="w-full h-11 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent transition" placeholder="مثال: 500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">طريقة الدفع <span className="text-[#E60000]">*</span></label>
                                        <select required value={formData.payment_method} onChange={e => handleFormChange('payment_method', e.target.value)} className="w-full h-11 px-4 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent transition">
                                            <option value="CASH">كاش (نقدي)</option>
                                            <option value="BANK_TRANSFER">تحويل بنكي / محافظ إلكترونية</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-b-lg flex items-center justify-end gap-4">
                        <Link href="/admin/players" className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            إلغاء
                        </Link>
                        <button type="submit" disabled={saving} className="bg-[#E60000] hover:bg-red-700 text-white px-8 py-2.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-75">
                            <UserPlus className="w-4 h-4" />
                            <span>{saving ? 'جاري التسجيل...' : 'تسجيل اللاعب واسخراج بيانات الدخول'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
