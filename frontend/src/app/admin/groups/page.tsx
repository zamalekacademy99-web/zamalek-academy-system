"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Branch = { id: string; name: string };
type Group = { id: string; name: string; age_category: string; branch_id: string; branch: Branch };

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ id: "", name: "", age_category: "", branch_id: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [grpRes, brnRes] = await Promise.all([
                fetchApi("/groups"),
                fetchApi("/branches")
            ]);
            setGroups(grpRes.data);
            setBranches(brnRes.data);
            setError(null);
        } catch (err: any) {
            setError("عذراً، حدث خطأ أثناء تحميل البيانات.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (group?: Group) => {
        if (group) {
            setFormData({ id: group.id, name: group.name, age_category: group.age_category, branch_id: group.branch_id });
            setIsEditing(true);
        } else {
            setFormData({ id: "", name: "", age_category: "", branch_id: branches[0]?.id || "" });
            setIsEditing(false);
        }
        setIsFormOpen(true);
        setSuccess(null);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (isEditing) {
                await fetchApi(`/groups/${formData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ name: formData.name, age_category: formData.age_category, branch_id: formData.branch_id })
                });
                setSuccess("تم تحديث المجموعة بنجاح.");
            } else {
                await fetchApi("/groups", {
                    method: 'POST',
                    body: JSON.stringify({ name: formData.name, age_category: formData.age_category, branch_id: formData.branch_id })
                });
                setSuccess("تم إضافة المجموعة بنجاح.");
            }
            setIsFormOpen(false);
            const grpRes = await fetchApi("/groups");
            setGroups(grpRes.data);
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء الحفظ.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه المجموعة بشكل نهائي؟")) return;
        try {
            await fetchApi(`/groups/${id}`, { method: 'DELETE' });
            setSuccess("تم حذف المجموعة بنجاح.");
            const grpRes = await fetchApi("/groups");
            setGroups(grpRes.data);
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء الحذف.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">إدارة المجموعات</h1>
                    <p className="text-slate-500 text-sm mt-1">عرض وإدارة الفئات العمرية والمجموعات التدريبية بكل فرع.</p>
                </div>

                {!isFormOpen && (
                    <button
                        onClick={() => handleOpenForm()}
                        className="bg-[#E60000] hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة مجموعة</span>
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}
            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {success}
                </div>
            )}

            {isFormOpen && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4">{isEditing ? "تعديل مجموعة" : "إضافة مجموعة جديدة"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">اسم المجموعة</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="مثال: U-12"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#E60000] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">الفئة العمرية</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="مثال: 11-12 سنة"
                                    value={formData.age_category}
                                    onChange={(e) => setFormData({ ...formData, age_category: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#E60000] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">الفرع التابع</label>
                                <select
                                    required
                                    value={formData.branch_id}
                                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#E60000] outline-none"
                                >
                                    <option value="" disabled>اختر الفرع</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-[#E60000] text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                            >
                                {saving ? "جاري الحفظ..." : "حفظ المجموعة"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!isFormOpen && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">جاري تحميل المجموعات...</div>
                    ) : groups.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">لا توجد مجموعات مسجلة حتى الآن.</div>
                    ) : (
                        <table className="w-full text-right text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">الفرع</th>
                                    <th className="px-6 py-4">اسم المجموعة</th>
                                    <th className="px-6 py-4">الفئة العمرية</th>
                                    <th className="px-6 py-4">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {groups.map((group) => (
                                    <tr key={group.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{group.branch?.name}</td>
                                        <td className="px-6 py-4 font-medium text-[#E60000]">{group.name}</td>
                                        <td className="px-6 py-4 text-slate-500">{group.age_category}</td>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <button
                                                onClick={() => handleOpenForm(group)}
                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                title="تعديل"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(group.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
