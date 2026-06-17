import {FormEvent, useEffect, useMemo, useState} from 'react';
import {Eye, EyeOff, LoaderCircle} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {updatePassword} from 'firebase/auth';
import {useAuth} from '../auth/AuthContext';
import {
  completePasswordChangeCallable,
  getTotpEnrollmentQrCallable,
  mapCallableError,
  verifyTotpEnrollmentCallable,
  verifyTotpLoginCallable,
} from '../auth/agentMfaService';
import {AuthInput, AuthMessage} from '../components/auth/AuthField';
import {AuthShell} from '../components/auth/AuthShell';
import {AuthSubmitButton} from '../components/auth/AuthSubmitButton';
import {getPortalFirebaseAuth} from '../firebase/client';
import {getPasswordError, isPasswordValid} from '../utils/signupValidation';

function TotpCodeInput({
  value,
  onChange,
  label = 'Authentication code',
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <AuthInput
      compact
      label={label}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      placeholder="000000"
    />
  );
}

export function AgentOnboardingPage() {
  const navigate = useNavigate();
  const {profile, agentGateStep, refreshProfile, refreshAgentClaims, signOutUser} = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [loadingQr, setLoadingQr] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uid = profile?.uid ?? '';

  useEffect(() => {
    if (agentGateStep === 'none' && profile?.role === 'agent') {
      navigate('/dashboard', {replace: true});
    }
  }, [agentGateStep, navigate, profile?.role]);

  useEffect(() => {
    if (agentGateStep !== 'enroll' || !uid) {
      return;
    }

    let cancelled = false;
    setLoadingQr(true);
    setSubmitError('');

    getTotpEnrollmentQrCallable(uid)
      .then((result) => {
        if (!cancelled) {
          setQrCodeDataUrl(result.qrCodeDataUrl);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setSubmitError(mapCallableError(error));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingQr(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [agentGateStep, uid]);

  const passwordError = useMemo(() => {
    if (!password) {
      return '';
    }

    return getPasswordError(password);
  }, [password]);

  const confirmError = useMemo(() => {
    if (!confirmPassword) {
      return '';
    }

    return confirmPassword === password ? '' : 'Passwords do not match.';
  }, [confirmPassword, password]);

  const canSubmitPassword =
    isPasswordValid(password) && confirmPassword.length > 0 && confirmPassword === password;

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    if (!uid || !canSubmitPassword || isSubmitting) {
      return;
    }

    const auth = getPortalFirebaseAuth();
    const user = auth?.currentUser;
    if (!user) {
      setSubmitError('Your session expired. Sign in again.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      await updatePassword(user, password);
      await completePasswordChangeCallable(uid);
      await refreshProfile();
      await refreshAgentClaims();
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setSubmitError(mapCallableError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEnrollmentSubmit(event: FormEvent) {
    event.preventDefault();
    if (!uid || totpCode.length !== 6 || isSubmitting) {
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      await verifyTotpEnrollmentCallable(uid, totpCode);
      await refreshProfile();
      await refreshAgentClaims();
      setTotpCode('');
    } catch (error) {
      setSubmitError(mapCallableError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTotpLoginSubmit(event: FormEvent) {
    event.preventDefault();
    if (!uid || totpCode.length !== 6 || isSubmitting) {
      return;
    }

    const auth = getPortalFirebaseAuth();
    const user = auth?.currentUser;
    if (!user) {
      setSubmitError('Your session expired. Sign in again.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      await verifyTotpLoginCallable(uid, totpCode);
      await user.getIdToken(true);
      await refreshProfile();
      await refreshAgentClaims();
      navigate('/dashboard', {replace: true});
    } catch (error) {
      setSubmitError(mapCallableError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!profile || profile.role !== 'agent') {
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

  if (agentGateStep === 'password') {
    return (
      <AuthShell compact title="Set new password" subtitle="Replace your temporary password before continuing.">
        <form className="space-y-5" onSubmit={(e) => void handlePasswordSubmit(e)} noValidate>
          {submitError ? (
            <AuthMessage compact tone="error">
              {submitError}
            </AuthMessage>
          ) : null}

          <AuthInput
            compact
            label="New password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-slate-500 transition hover:text-[#5097A4]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <AuthInput
            compact
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmError}
            trailing={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="text-slate-500 transition hover:text-[#5097A4]"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <AuthSubmitButton compact disabled={!canSubmitPassword || isSubmitting} loading={isSubmitting}>
            Save password
          </AuthSubmitButton>
        </form>
      </AuthShell>
    );
  }

  if (agentGateStep === 'enroll') {
    return (
      <AuthShell compact title="Set up two-factor authentication" subtitle="Scan the QR code with your authenticator app.">
        <form className="space-y-5" onSubmit={(e) => void handleEnrollmentSubmit(e)} noValidate>
          {submitError ? (
            <AuthMessage compact tone="error">
              {submitError}
            </AuthMessage>
          ) : null}

          <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4">
            {loadingQr ? (
              <LoaderCircle className="h-10 w-10 animate-spin text-[#5097A4]" strokeWidth={2} />
            ) : qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="TOTP QR code" className="h-48 w-48" />
            ) : (
              <p className="text-sm text-slate-500">QR code unavailable.</p>
            )}
          </div>

          <TotpCodeInput value={totpCode} onChange={setTotpCode} label="6-digit verification code" />

          <AuthSubmitButton compact disabled={totpCode.length !== 6 || isSubmitting} loading={isSubmitting}>
            Verify and continue
          </AuthSubmitButton>
        </form>
      </AuthShell>
    );
  }

  if (agentGateStep === 'totp') {
    return (
      <AuthShell compact title="Two-factor authentication" subtitle="Enter the 6-digit code from your authenticator app.">
        <form className="space-y-5" onSubmit={(e) => void handleTotpLoginSubmit(e)} noValidate>
          {submitError ? (
            <AuthMessage compact tone="error">
              {submitError}
            </AuthMessage>
          ) : null}

          <TotpCodeInput value={totpCode} onChange={setTotpCode} />

          <AuthSubmitButton compact disabled={totpCode.length !== 6 || isSubmitting} loading={isSubmitting}>
            Verify
          </AuthSubmitButton>

          <button
            type="button"
            onClick={() => void signOutUser()}
            className="w-full text-center text-xs font-semibold text-[#5097A4] hover:underline"
          >
            Sign out
          </button>
        </form>
      </AuthShell>
    );
  }

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
