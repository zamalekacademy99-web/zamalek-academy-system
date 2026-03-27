import Sidebar from "@/components/admin/Sidebar";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
            <div className="flex min-h-screen rtl:flex-row-reverse bg-slate-50">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Header */}
                    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
                        <h2 className="text-xl font-bold text-slate-800">إدارة الأكاديمية</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-[#E60000] text-white rounded-full flex items-center justify-center font-bold">
                                أ
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
