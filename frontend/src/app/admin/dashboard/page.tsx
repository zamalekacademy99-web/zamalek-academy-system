"use client";
import { useEffect, useState } from "react";
import { Users, UserCheck, AlertCircle, TrendingUp, CalendarCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { fetchApi } from "@/lib/api";

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const res = await fetchApi('/analytics');
                setData(res.data);
            } catch (err: any) {
                setError('تعذر تحميل بيانات لوحة التحكم');
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500 font-medium">جاري تحميل بيانات الأكاديمية...</div>;
    }

    if (error || !data) {
        return <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-xl border border-red-200">{error}</div>;
    }

    const { kpis, charts, smart_tables } = data;

    // Map Backend Branch Distribution correctly for BarChart
    const branchDistributionData = charts?.branch_distribution?.map((item: any) => ({
        name: item.branch_id ? `فرع ${item.branch_id.slice(0, 4)}` : "غير محدد",
        count: item._count
    })) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">مركز المراقبة والتحليلات</h1>
                    <p className="text-sm text-slate-500 mt-1">نظرة شاملة على أداء الأكاديمية المالي والإداري.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <h3 className="text-sm font-semibold">إجمالي اللاعبين</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{kpis?.total_players || 0}</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <UserCheck className="w-5 h-5 text-green-500" />
                        <h3 className="text-sm font-semibold">لاعبين نشطين</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{kpis?.active_players || 0}</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <AlertCircle className="w-5 h-5 text-[#E60000]" />
                        <h3 className="text-sm font-semibold">حسابات متأخرة</h3>
                    </div>
                    <p className="text-3xl font-black text-[#E60000]">{kpis?.overdue_players || 0}</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-sm font-semibold">إيرادات الشهر</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{kpis?.monthly_revenue || 0}<span className="text-sm font-normal text-slate-500 mr-1">ج.م</span></p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <CalendarCheck className="w-5 h-5 text-purple-500" />
                        <h3 className="text-sm font-semibold">معدل الحضور</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{kpis?.attendance_rate || 0}%</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Branch Distribution Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">توزيع اللاعبين على الفروع</h3>
                    <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={branchDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" fill="#E60000" radius={[4, 4, 0, 0]} barSize={40} name="العدد" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Empty Placeholder for now */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>رسم بياني إضافي (قيد التطوير)</p>
                    </div>
                </div>
            </div>

            {/* Smart Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">أحدث التسجيلات</h3>
                    </div>
                    <table className="w-full text-right text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-5 py-3 font-medium">الاسم</th>
                                <th className="px-5 py-3 font-medium">تاريخ التسجيل</th>
                                <th className="px-5 py-3 font-medium">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {smart_tables?.recent_registrations?.length > 0 ? smart_tables.recent_registrations.map((reg: any) => (
                                <tr key={reg.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3 font-semibold text-slate-800">{reg.first_name} {reg.last_name}</td>
                                    <td className="px-5 py-3 text-slate-600">{new Date(reg.created_at).toLocaleDateString('ar-EG')}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${reg.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {reg.status === 'ACTIVE' ? 'نشط' : reg.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="p-6 text-center text-slate-500">لا يوجد تسجيلات حديثة</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-[#E60000] rounded-xl shadow-sm p-6 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">إجراءات سريعة</h3>
                        <p className="text-red-100 text-sm mb-6">أتمتة الأعمال قيد التشغيل. التنبيهات ترسل تلقائياً.</p>
                        <div className="space-y-3">
                            <button className="w-full bg-white text-[#E60000] font-bold py-2.5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors" onClick={() => window.location.href = '/admin/notifications'}>إرسال إشعار عام</button>
                            <button className="w-full bg-red-700 text-white font-bold py-2.5 rounded-lg border border-red-600 hover:bg-red-800 transition-colors" onClick={() => window.location.href = '/admin/payments'}>إدارة المدفوعات</button>
                        </div>
                    </div>
                    {/* Decorative background element */}
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                </div>
            </div>
        </div>
    );
}
