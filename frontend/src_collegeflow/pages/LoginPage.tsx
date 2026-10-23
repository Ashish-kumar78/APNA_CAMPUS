import { useState } from 'react';
import { ArrowRight, GraduationCap, ShieldCheck } from 'lucide-react';
import type { UserSession } from '../data/mockData';

export function LoginPage({ onLogin }: { onLogin: (user: UserSession) => void }) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'college_admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('This legacy prototype sign-in is disabled. Use the main Apna Campus app.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-900">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-2xl lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative hidden bg-brand-900 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <GraduationCap size={28} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-blue-200">CollegeFlow</p>
              <h1 className="text-2xl font-semibold">Campus intelligence</h1>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.25em] text-blue-200">Enterprise SIS</p>
              <h2 className="max-w-md text-4xl font-semibold leading-tight">Everything students, faculty, and administrators need in one platform.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <StatTile label="Student retention" value="96.8%" />
              <StatTile label="Fee collection" value="₹7.4 Cr" />
              <StatTile label="Attendance" value="91.4%" />
              <StatTile label="Placement" value="412 offers" />
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-sm text-blue-100">
            <ShieldCheck size={18} />
            Secure RBAC, audit-ready workflows, and live analytics
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-brand-600">Welcome back</p>
              <h3 className="mt-2 text-3xl font-semibold text-slate-900">Sign in to your portal</h3>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl bg-slate-100 p-2">
              <button
                type="button"
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${selectedRole === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                onClick={() => setSelectedRole('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${selectedRole === 'college_admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                onClick={() => setSelectedRole('college_admin')}
              >
                Admin
              </button>
            </div>

            <form className="space-y-5" onSubmit={submit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
                  placeholder="name@collegeflow.edu"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-slate-300 text-brand-600" />
                  Remember me
                </label>
                <button type="button" className="font-medium text-brand-600">Forgot password?</button>
              </div>

              {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700">
                Sign in <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              This legacy sign-in is not connected to Apna Campus accounts. Use the main Apna Campus app.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-sm text-blue-100">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
