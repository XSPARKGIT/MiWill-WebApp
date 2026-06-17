import {FormEvent, useEffect, useMemo, useState} from 'react';
import {Eye, EyeOff, LoaderCircle} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {loginWithEmail, mapLoginError} from '../auth/authService';
import {resolveAgentGateStep} from '../auth/agentGate';
import {useAuth} from '../auth/AuthContext';
import type {UserRole} from '../auth/AuthContext';
import {
  attemptMockLogin,
  ensureDemoQuickFillUsers,
  mockProfileFromSession,
  notifyMockAuthChanged,
  saveMockSession,
} from '../auth/mockAuth';
import {USERS, portalUserLabel} from '../auth/users';
import {AuthInput, AuthMessage} from '../components/auth/AuthField';
import {AuthSegmentTabs} from '../components/auth/AuthSegmentTabs';
import {AuthShell} from '../components/auth/AuthShell';
import {AuthSubmitButton} from '../components/auth/AuthSubmitButton';
import {getPortalFirebaseAuth, isFirebaseConfigured} from '../firebase/client';

type LoginLocationState = {
  from?: {pathname?: string};
  info?: string;
  registeredEmail?: string;
  error?: string;
};

function postLoginPath(role: UserRole, from?: string): string {
  if (from && from !== '/login' && from !== '/signup') {
    return from;
  }
  return role === 'admin' ? '/admin-dashboard' : '/dashboard';
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as LoginLocationState | null) ?? {};
  const {applyProfile, status, profile, agentGateStep, refreshAgentClaims} = useAuth();
  const [email, setEmail] = useState(routeState.registeredEmail ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState(routeState.error ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    ensureDemoQuickFillUsers();
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && profile) {
      if (profile.role === 'admin') {
        navigate(postLoginPath('admin', routeState.from?.pathname), {replace: true});
        return;
      }

      if (agentGateStep !== 'none') {
        navigate('/agent-onboarding', {replace: true});
        return;
      }

      navigate(postLoginPath(profile.role, routeState.from?.pathname), {replace: true});
    }
  }, [agentGateStep, navigate, profile, routeState.from?.pathname, status]);

  const activeDemoEmail = useMemo(() => {
    const match = USERS.find(
      (user) =>
        user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
    );
    return match?.email ?? null;
  }, [email, password]);

  function fillDemoAccount(user: (typeof USERS)[number]) {
    setEmail(user.email);
    setPassword(user.password);
    setSubmitError('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      let signedInRole: UserRole = 'agent';
      if (isFirebaseConfigured) {
        const signedInProfile = await loginWithEmail(email, password);
        applyProfile(signedInProfile);
        await refreshAgentClaims();
        signedInRole = signedInProfile.role;

        const auth = getPortalFirebaseAuth();
        const token = await auth?.currentUser?.getIdTokenResult();
        const claims = token?.claims ?? {};

        if (
          claims.role === 'agent' &&
          resolveAgentGateStep(signedInProfile, claims) !== 'none'
        ) {
          navigate('/agent-onboarding', {replace: true});
          return;
        }
      } else {
        const session = attemptMockLogin(email, password);
        if (!session) {
          setSubmitError('Invalid email or password.');
          return;
        }
        saveMockSession(session);
        const signedInProfile = mockProfileFromSession(session);
        applyProfile(signedInProfile);
        notifyMockAuthChanged();
        signedInRole = signedInProfile.role;
      }

      navigate(postLoginPath(signedInRole, routeState.from?.pathname), {replace: true});
    } catch (error) {
      setSubmitError(mapLoginError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = email.trim().length > 0 && password.length > 0;

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3 text-[#6B7C93]"
        style={{backgroundColor: '#eef2f0'}}
      >
        <LoaderCircle className="h-8 w-8 animate-spin text-[#5097A4]" strokeWidth={2} />
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">Loading</p>
      </div>
    );
  }

  return (
    <AuthShell
      compact
      belowLogo={<AuthSegmentTabs compact />}
      title="Welcome Back"
      subtitle="Sign in to your account"
    >
      <form className="space-y-5" onSubmit={(e) => void handleSubmit(e)} noValidate>
        {routeState.info ? (
          <AuthMessage compact tone="success">
            {routeState.info}
          </AuthMessage>
        ) : null}

        {submitError ? (
          <AuthMessage compact tone="error">
            {submitError}
          </AuthMessage>
        ) : null}

        <div className="rounded-2xl border border-slate-200/90 bg-slate-50 px-3 py-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Demo accounts — tap to fill email and password
          </p>
          <div className="grid grid-cols-2 gap-2">
            {USERS.map((user) => {
              const isActive = activeDemoEmail === user.email;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => fillDemoAccount(user)}
                  className={`login-quick-card rounded-xl border bg-white px-3 py-2.5 text-left transition hover:border-[#5097A4]/50 hover:shadow-sm ${
                    isActive ? 'border-[#5097A4] ring-2 ring-[#5097A4]/15' : 'border-slate-200'
                  }`}
                >
                  <span className="block text-xs font-bold capitalize text-slate-800">{portalUserLabel(user)}</span>
                  <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">{user.email}</span>
                </button>
              );
            })}
          </div>
        </div>

        <AuthInput
          compact
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
        />

        <AuthInput
          compact
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="rounded-lg p-1 text-slate-400 transition hover:text-[#5097A4]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <div className="flex justify-end">
          <a
            href="mailto:support@miwill.co.za?subject=MiWill%20Portal%20Password%20Reset"
            className="text-xs font-semibold text-[#5097A4] hover:text-[#458A97] hover:underline"
          >
            Forgot Password?
          </a>
        </div>

        <AuthSubmitButton compact disabled={!canSubmit || isSubmitting} loading={isSubmitting}>
          Login
        </AuthSubmitButton>
      </form>
    </AuthShell>
  );
}
