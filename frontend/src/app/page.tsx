/** EMERGENCY REBUILD: 2026-03-29 05:58:01 (Strict Parity Fix) **/
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect if already logged in
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw);
        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'MANAGEMENT') {
          router.push('/admin/dashboard');
        } else if (user.role === 'PARENT') {
          router.push('/portal');
        } else {
          setPageLoading(false);
        }
      } catch (e) {
        setPageLoading(false);
      }
    } else {
      setPageLoading(false);
    }

    if (typeof window !== 'undefined' && window.location.search.includes('expired=true')) {
      setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.');
      window.history.replaceState({}, '', '/');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      const userRole = res.data.user.role;
      let redirectPath = '/';

      if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'MANAGEMENT') {
        redirectPath = '/admin/dashboard';
      } else if (userRole === 'COACH') {
        redirectPath = '/coach/dashboard';
        if (res.data.user.coachProfile?.id) {
          localStorage.setItem('adminViewCoachId', res.data.user.coachProfile.id);
        }
      } else if (userRole === 'PARENT') {
        redirectPath = '/portal';
      }

      router.push(redirectPath);

    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E60000]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-2">
            <span className="text-[#E60000]">ZAMALEK</span> ACADEMY
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-sm">أهلاً بك. يرجى تسجيل الدخول للمتابعة.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700/90 rounded-xl text-sm border border-red-100/50 flex items-center justify-center text-center font-medium">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-right text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E60000]/20 focus:border-[#E60000] focus:bg-white transition-all"
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-right text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E60000]/20 focus:border-[#E60000] focus:bg-white transition-all"
              required
              dir="ltr"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#E60000] hover:bg-red-700 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-red-500/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span>{loading ? 'جاري التحقق...' : 'دخول'}</span>
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>نظام إدارة أكاديمية الزمالك &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
