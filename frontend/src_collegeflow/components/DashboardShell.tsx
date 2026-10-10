import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  BookMarked,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  UserRound,
  Search,
} from 'lucide-react';
import type { UserSession } from '../data/mockData';
import { clearSession } from '../lib/auth';

export function DashboardShell({ title, subtitle, user, children }: {
  title: string;
  subtitle: string;
  user: UserSession | null;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = user?.role === 'college_admin'
    ? [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard }]
    : [
      { label: 'Library', to: '/student/library', icon: BookMarked },
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Profile', to: '/student/profile', icon: UserRound },
      { label: 'Academics', to: '/student/academics', icon: BookOpen },
      { label: 'Attendance', to: '/student/attendance', icon: Activity },
      { label: 'Results', to: '/student/results', icon: ClipboardList },
    ];

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 rounded-[28px] bg-gradient-to-b from-[#091326] to-[#0b1a36] border border-[#1a2a44] p-5 text-slate-100 shadow-2xl lg:block">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-500/30"><GraduationCap size={22} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-400">APNA CAMPUS</p>
              <p className="text-lg font-bold text-white">College Library</p>
            </div>
          </div>

          <nav className="mt-7 space-y-2">
            {navItems.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                aria-current={location.pathname === to ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition ${location.pathname === to ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Current role</p>
            <p className="mt-2 text-base font-bold text-white">{user?.role === 'college_admin' ? 'College Admin' : 'Student'}</p>
          </div>
        </aside>

        <main className="flex-1 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <nav className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Primary navigation">
            {navItems.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                aria-current={location.pathname === to ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${location.pathname === to ? 'bg-teal-50 font-medium text-teal-900' : 'bg-slate-50 text-slate-600'}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-brand-600">Overview</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" aria-label="Search" className="rounded-xl border border-slate-200 p-2.5 text-slate-600">
                <Search size={18} />
              </button>
              <button type="button" aria-label="Notifications" className="rounded-xl border border-slate-200 p-2.5 text-slate-600">
                <Bell size={18} />
              </button>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-2.5 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700">
                  {user?.firstName?.[0] ?? 'A'}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-slate-800">{user?.firstName ?? 'Aarav'} {user?.lastName ?? 'Sharma'}</p>
                  <p className="text-xs text-slate-500">{user?.role === 'college_admin' ? 'College Admin' : 'Student'}</p>
                </div>
                <button type="button" onClick={handleLogout} aria-label="Sign out" className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </header>

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
