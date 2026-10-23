import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { readSession } from './lib/auth';
import type { UserSession } from './data/mockData';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { StudentLibraryPage } from './pages/StudentLibraryPage';
import { StudentAcademicsPage, StudentAttendancePage, StudentProfilePage, StudentResultsPage } from './pages/StudentModulePages';

function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const current = readSession();
    setSession(current?.user ?? null);
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={session?.role === 'college_admin' ? '/admin' : '/student/library'} replace />}
      />
      <Route
        path="/login"
        element={session ? <Navigate to={session.role === 'college_admin' ? '/admin' : '/student/library'} replace /> : <LoginPage onLogin={setSession} />}
      />
      <Route
        path="/student/library"
        element={<ProtectedRoute user={session} allowedRoles={['student']}><StudentLibraryPage user={session} /></ProtectedRoute>}
      />
      <Route
        path="/dashboard"
        element={<Navigate to="/student/library" replace />}
      />
      <Route path="/student/profile" element={<ProtectedRoute user={session} allowedRoles={['student']}><StudentProfilePage user={session} /></ProtectedRoute>} />
      <Route path="/student/academics" element={<ProtectedRoute user={session} allowedRoles={['student']}><StudentAcademicsPage user={session} /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute user={session} allowedRoles={['student']}><StudentAttendancePage user={session} /></ProtectedRoute>} />
      <Route path="/student/results" element={<ProtectedRoute user={session} allowedRoles={['student']}><StudentResultsPage user={session} /></ProtectedRoute>} />
      <Route
        path="/admin"
        element={<ProtectedRoute user={session} allowedRoles={['college_admin']}><AdminDashboardPage user={session} /></ProtectedRoute>}
      />
      <Route path="*" element={<NotFoundPage session={session} />} />
    </Routes>
  );
}

function ProtectedRoute({
  children,
  user,
  allowedRoles,
}: {
  children: React.ReactNode;
  user: UserSession | null;
  allowedRoles: Array<UserSession['role']>;
}) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'college_admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    </div>
  );
}

export default App;
