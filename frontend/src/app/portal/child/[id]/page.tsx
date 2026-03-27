"use client";
import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, XCircle, Award, CalendarDays, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

export default function ChildProfilePage({ params }: { params: { id: string } }) {
    const [child, setChild] = useState<any>(null);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadChildProfile = async () => {
            try {
                // Fetch all children to find this specific child's details (since we don't have getChildById endpoint)
                const childrenRes = await fetchApi('/parent/children');
                const matchedChild = childrenRes.data.find((c: any) => c.id === params.id);

                if (!matchedChild) {
                    setError("تتعذر رؤية بيانات هذا اللاعب. غير مصرح أو اللاعب غير موجود.");
                    setLoading(false);
                    return;
                }

                setChild(matchedChild);

                // Fetch Attendance and Evaluations
                const [attRes, evalRes] = await Promise.all([
                    fetchApi(`/parent/attendance/${params.id}`),
                    fetchApi(`/parent/evaluations/${params.id}`)
                ]);

                setAttendance(attRes.data || []);
                setEvaluations(evalRes.data || []);

            } catch (err: any) {
                setError(err.message || "حدث خطأ أثناء تحميل بيانات اللاعب.");
            } finally {
                setLoading(false);
            }
        };

        loadChildProfile();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#E60000] mb-4" />
                <p className="text-slate-500 font-medium">جاري تحميل بيانات اللاعب...</p>
            </div>
        );
    }

    if (error || !child) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;
    }

    const latestEvaluation = evaluations.length > 0 ? evaluations[0] : null;

    return (
        <div className="space-y-6 pb-12">
            {/* Top Nav (Back) */}
            <div className="flex items-center gap-3">
                <Link href="/portal" className="text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowRight className="w-5 h-5 rtl:hidden" />
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ltr:hidden"><path d="m15 18-6-6 6-6" /></svg>
                </Link>
                <h2 className="text-xl font-bold text-slate-900">ملف اللاعب</h2>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-800 border-2 border-white shadow-md shrink-0">
                    {child.first_name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{child.first_name} {child.last_name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs">{child.id.split('-')[0]}</span> <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span> فريق {child.group?.name || '--'}
                    </p>
                </div>
            </div>

            {/* Coach & Schedule */}
            <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 px-1">التدريب والمدرب</h4>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 text-[#E60000] rounded-full flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">المدرب المسؤول</p>
                            <p className="font-bold text-slate-900 text-sm">{child.coach?.full_name || 'غير محدد'}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 flex items-center gap-3">
                        <CalendarDays className="w-5 h-5 text-slate-400 shrink-0" />
                        <div>
                            <p className="font-medium text-slate-800 text-sm">أيام التدريب سيتم إدراجها هنا</p>
                            <p className="text-xs text-slate-500 mt-0.5">فرع {child.branch?.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance History */}
            <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 px-1">سجل الحضور الأخير</h4>
                <div className="space-y-3">
                    {attendance.length === 0 ? (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
                            لا يوجد سجل حضور مسجل حتى الآن.
                        </div>
                    ) : (
                        attendance.map((record: any) => (
                            <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 border-r-4 border-r-transparent transition-colors" style={{ borderRightColor: record.status === 'PRESENT' ? '#10b981' : record.status === 'ABSENT_EXCUSED' ? '#f59e0b' : '#ef4444' }}>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{new Date(record.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">موعد تدريب</p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${record.status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-100' : record.status === 'ABSENT_EXCUSED' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-red-50 text-[#E60000] border-red-100'}`}>
                                    {record.status === 'PRESENT' ? <CheckCircle2 className="w-4 h-4" /> : record.status === 'ABSENT_EXCUSED' ? <Info className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    <span className="text-xs font-bold whitespace-nowrap">
                                        {record.status === 'PRESENT' ? 'حاضر' : record.status === 'ABSENT_EXCUSED' ? 'غياب بعذر' : 'غياب'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Evaluation */}
            <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 px-1">آخر تقييم للمدرب</h4>
                {latestEvaluation ? (
                    <div className="bg-[#E60000] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {new Date(latestEvaluation.date).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
                                </span>
                                <span className="font-black text-xl">{latestEvaluation.score}/10</span>
                            </div>
                            <p className="text-sm text-red-100 leading-relaxed font-medium mt-3">"{latestEvaluation.comments}"</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-sm text-slate-500 border-dashed">
                        في انتظار تسجيل التقييم الأول من المدرب المسؤول.
                    </div>
                )}
            </div>

        </div>
    );
}
