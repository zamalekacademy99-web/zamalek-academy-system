"use client";
import { Printer, Send, FileText } from "lucide-react";
import Link from "next/link";

export default function PaymentReceiptPage({ params }: { params: { id: string } }) {
    // In a real app, fetch /api/v1/payments/:id

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            {/* Top Actions (Hidden on Print) */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-3">
                    <Link href="/admin/payments" className="text-sm font-semibold text-slate-500 hover:text-slate-800">العودة للمدفوعات</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm font-bold text-slate-900">إيصال {params.id}</span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors">
                        <Send className="w-4 h-4" />
                        <span>إرسال لولي الأمر</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-[#E60000] hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        <span>طباعة الإيصال</span>
                    </button>
                </div>
            </div>

            {/* Printable Receipt Area */}
            <div className="bg-white border border-gray-200 shadow-sm p-10 rounded-xl print:shadow-none print:border-none print:p-0">

                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#E60000]">
                            ZAMALEK<span className="text-slate-900 ml-1">ACADEMY</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-2">فرع طنطا (الاستاد الرياضي)</p>
                        <p className="text-slate-500 text-sm">تليفون: 01000000000</p>
                    </div>
                    <div className="text-left rtl:text-right">
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">إيصال استلام نقدية</h2>
                        <p className="text-slate-500 font-mono text-sm">رقم الإيصال: {params.id}</p>
                        <p className="text-slate-500 text-sm mt-1">التاريخ: 15 مايو 2026</p>
                    </div>
                </div>

                {/* Player Details */}
                <div className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">بيانات المشترك</h3>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div><span className="text-slate-500">الاسم:</span> <strong className="text-slate-900">أحمد محمود</strong></div>
                        <div><span className="text-slate-500">كود اللاعب:</span> <strong className="text-slate-900 font-mono">ZA-1001</strong></div>
                        <div><span className="text-slate-500">المجموعة:</span> <strong className="text-slate-900">U-12</strong></div>
                        <div><span className="text-slate-500">تاريخ الانضمام:</span> <strong className="text-slate-900">1 يناير 2026</strong></div>
                    </div>
                </div>

                {/* Payment Details Table */}
                <table className="w-full text-right text-sm text-slate-700 mb-8 border-collapse border border-slate-200">
                    <thead className="bg-slate-100 font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-3 border-l border-slate-200">البيان</th>
                            <th className="p-3 border-l border-slate-200">القيمة</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-3 border-l border-slate-200 border-b">اشتراك شهر مايو 2026</td>
                            <td className="p-3 border-b border-slate-200 font-bold">500 ج.م</td>
                        </tr>
                        <tr>
                            <td className="p-3 border-l border-slate-200 border-b">رسوم ملابس الأكاديمية (طقم أساسي)</td>
                            <td className="p-3 border-b border-slate-200 font-bold">1,000 ج.م</td>
                        </tr>
                        <tr className="bg-slate-50">
                            <td className="p-3 border-l border-slate-200 font-black text-slate-900 text-left rtl:text-right">الإجمالي المسدد</td>
                            <td className="p-3 font-black text-[#E60000] text-lg">1,500 ج.م</td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer Signatures */}
                <div className="flex justify-between items-end mt-16 pt-8 border-t border-slate-200">
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-800 mb-8">توقيع المستلم (المسؤول)</p>
                        <div className="w-40 border-b border-slate-400 border-dashed mx-auto"></div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 print:hidden text-xs">
                        <FileText className="w-4 h-4" />
                        تم الحفظ آلياً في النظام
                    </div>

                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-800 mb-8">ختم الأكاديمية</p>
                        <div className="w-24 h-24 border-2 border-slate-200 rounded-full mx-auto flex items-center justify-center text-slate-300 text-xs rotate-[-15deg]">
                            Zamalek
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
