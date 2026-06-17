import {LoaderCircle} from 'lucide-react';
import {Navigate, Outlet, Route, BrowserRouter as Router, Routes, useLocation} from 'react-router-dom';
import LandingPage from '../App';
import {AuthProvider, useAuth} from '../auth/AuthContext';
import {AdminDashboardPage, AgentDashboardPage} from '../pages/DashboardPages';
import {AgentOnboardingPage} from '../pages/AgentOnboardingPage';
import {LoginPage} from '../pages/LoginPage';
import {SignUpPage} from '../pages/SignUpPage';
import {DashboardDataProvider} from '../context/DashboardDataContext';
import {AuthRoutesLayout} from './AuthRoutesLayout';

function AuthLoadingScreen() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 text-[#6B7C93]"
      style={{backgroundColor: '#F4F6F8'}}
    >
      <LoaderCircle className="h-8 w-8 animate-spin text-[#5097A4]" strokeWidth={2} />
      <p className="text-xs font-semibold uppercase tracking-[0.16em]">Loading</p>
    </div>
  );
}

function resolveAuthenticatedHome(role: 'admin' | 'agent' | undefined, from?: string): string {
  if (from && from !== '/login' && from !== '/signup') {
    return from;
  }
  return role === 'admin' ? '/admin-dashboard' : '/dashboard';
}

function ProtectedRoute() {
  const {status, profile, agentGateStep} = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{from: location}} />;
  }

  if (profile?.role === 'agent' && agentGateStep !== 'none') {
    return <Navigate to="/agent-onboarding" replace />;
  }

  return <Outlet />;
}

function AgentOnboardingRoute() {
  const {status, profile, agentGateStep} = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{from: location}} />;
  }

  if (profile?.role !== 'agent') {
    return <Navigate to={resolveAuthenticatedHome(profile?.role)} replace />;
  }

  if (agentGateStep === 'none') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function AdminProtectedRoute() {
  const {status, profile} = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{from: location}} />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const {status, profile, agentGateStep} = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (status === 'authenticated') {
    const from = (location.state as {from?: {pathname?: string}} | null)?.from?.pathname;

    if (profile?.role === 'agent' && agentGateStep !== 'none') {
      return <Navigate to="/agent-onboarding" replace />;
    }

    return (
      <Navigate
        to={resolveAuthenticatedHome(profile?.role, from)}
        replace
      />
    );
  }

  return <Outlet />;
}

export function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route element={<AuthRoutesLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
            </Route>
          </Route>

          <Route element={<AgentOnboardingRoute />}>
            <Route path="/agent-onboarding" element={<AgentOnboardingPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <DashboardDataProvider>
                  <AgentDashboardPage />
                </DashboardDataProvider>
              }
            />
          </Route>

          <Route element={<AdminProtectedRoute />}>
            <Route
              path="/admin-dashboard"
              element={
                <DashboardDataProvider>
                  <AdminDashboardPage />
                </DashboardDataProvider>
              }
            />
          </Route>

          <Route path="/agent-dashboard" element={<Navigate to="/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
