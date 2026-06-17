import {FormEvent, useMemo, useState} from 'react';
import {Eye, EyeOff} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import {mapPortalSignupError, signUpPortalUser} from '../auth/authService';
import {AuthInput, AuthMessage} from '../components/auth/AuthField';
import {AuthSegmentTabs} from '../components/auth/AuthSegmentTabs';
import {AuthShell} from '../components/auth/AuthShell';
import {AuthSubmitButton} from '../components/auth/AuthSubmitButton';
import {
  EMAIL_REGEX,
  getPasswordError,
  getPasswordRuleChecks,
  getPasswordStrengthLabel,
  getPasswordStrengthScore,
  getSaIdRequiredError,
  getSaPhoneError,
  isPasswordValid,
  sanitizeSaIdDigits,
} from '../utils/signupValidation';

type FieldKey =
  | 'firstName'
  | 'surname'
  | 'dateOfBirth'
  | 'idNumber'
  | 'email'
  | 'phone'
  | 'password'
  | 'confirmPassword'
  | 'acceptPopia';

type Touched = Partial<Record<FieldKey, boolean>>;

function PasswordStrengthMeter({password}: {password: string}) {
  const score = getPasswordStrengthScore(password);
  const label = getPasswordStrengthLabel(score);
  const checks = getPasswordRuleChecks(password);

  const barColors =
    label === 'weak'
      ? 'bg-rose-400'
      : label === 'fair'
        ? 'bg-amber-400'
        : label === 'good'
          ? 'bg-yellow-400'
          : 'bg-emerald-500';

  const labelClass =
    label === 'weak'
      ? 'text-rose-600'
      : label === 'fair'
        ? 'text-amber-700'
        : label === 'good'
          ? 'text-yellow-700'
          : 'text-emerald-700';

  const segments = [
    checks.minLength,
    checks.uppercase,
    checks.lowercase,
    checks.number,
    checks.special,
    checks.noSpaces,
  ];

  if (!password) return null;

  return (
    <div className="space-y-2 rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password strength</span>
        <span className={`text-[10px] font-black capitalize ${labelClass}`}>{label}</span>
      </div>
      <div className="flex gap-0.5">
        {segments.map((met, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${met ? barColors : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <ul className="grid gap-0.5 text-[10px] font-medium text-slate-500 sm:grid-cols-2">
        <li className={checks.minLength ? 'text-emerald-700' : ''}>At least 8 characters</li>
        <li className={checks.uppercase ? 'text-emerald-700' : ''}>Uppercase letter</li>
        <li className={checks.lowercase ? 'text-emerald-700' : ''}>Lowercase letter</li>
        <li className={checks.number ? 'text-emerald-700' : ''}>Number</li>
        <li className={checks.special ? 'text-emerald-700' : ''}>Special character</li>
        <li className={checks.noSpaces ? 'text-emerald-700' : ''}>No spaces</li>
      </ul>
    </div>
  );
}

export function SignUpPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptPopia, setAcceptPopia] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Touched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const touch = (key: FieldKey) => () => setTouched((t) => ({...t, [key]: true}));

  const idDigits = idNumber.replace(/\D/g, '');

  const firstNameError =
    touched.firstName && !firstName.trim() ? 'First name is required.' : '';
  const surnameError = touched.surname && !surname.trim() ? 'Surname is required.' : '';
  const dateOfBirthError =
    touched.dateOfBirth && !dateOfBirth ? 'Date of birth is required.' : '';

  const idError = useMemo(() => {
    if (!idDigits) return touched.idNumber ? 'ID number is required.' : '';
    return getSaIdRequiredError(idDigits);
  }, [idDigits, touched.idNumber]);

  const emailError = useMemo(() => {
    if (!email.trim()) return touched.email ? 'Email is required.' : '';
    return EMAIL_REGEX.test(email.trim()) ? '' : 'Enter a valid email address.';
  }, [email, touched.email]);

  const phoneError = useMemo(() => {
    if (!phone.trim()) return '';
    return getSaPhoneError(phone);
  }, [phone]);

  const passwordError = useMemo(() => {
    if (!password) return touched.password ? 'Password is required.' : '';
    return getPasswordError(password);
  }, [password, touched.password]);

  const confirmError = useMemo(() => {
    if (!confirmPassword) return touched.confirmPassword ? 'Confirm your password.' : '';
    if (confirmPassword !== password) return 'Passwords do not match.';
    return '';
  }, [confirmPassword, password, touched.confirmPassword]);

  const popiaError = useMemo(() => {
    if (acceptPopia) return '';
    return touched.acceptPopia ? 'You must accept the POPIA Act and Terms of Use to continue.' : '';
  }, [acceptPopia, touched.acceptPopia]);

  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
  const phoneOk = !phone.trim() || getSaPhoneError(phone) === '';

  const canContinue =
    firstName.trim().length > 0 &&
    surname.trim().length > 0 &&
    Boolean(dateOfBirth) &&
    getSaIdRequiredError(idDigits) === '' &&
    EMAIL_REGEX.test(email.trim()) &&
    phoneOk &&
    isPasswordValid(password) &&
    passwordsMatch &&
    acceptPopia;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue || isSubmitting) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      await signUpPortalUser({
        firstName: firstName.trim(),
        lastName: surname.trim(),
        email: email.trim(),
        password,
        role: 'agent',
        dateOfBirth,
        idNumber: idDigits,
        phone: phone.trim() || null,
      });

      navigate('/login', {
        replace: true,
        state: {
          info: 'Account created. Sign in with your email and password.',
          registeredEmail: email.trim(),
        },
      });
    } catch (error) {
      setSubmitError(mapPortalSignupError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      compact
      containerClassName="max-w-lg"
      belowLogo={<AuthSegmentTabs compact />}
      title="Create your agent account"
      subtitle="Complete the form below to register as an agent."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {submitError ? (
          <AuthMessage compact tone="error">
            {submitError}
          </AuthMessage>
        ) : null}

        {/* Row 1 */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthInput
            compact
            label="First Name"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={touch('firstName')}
            error={firstNameError}
            placeholder="e.g. Thabo"
          />
          <AuthInput
            compact
            label="Surname"
            autoComplete="family-name"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            onBlur={touch('surname')}
            error={surnameError}
            placeholder="e.g. Mokoena"
          />
        </div>

        {/* Row 2 */}
        <AuthInput
          compact
          label="Date of Birth"
          type="date"
          autoComplete="bday"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          onBlur={touch('dateOfBirth')}
          error={dateOfBirthError}
        />

        {/* Row 3 */}
        <AuthInput
          compact
          label="ID Number"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={13}
          autoComplete="off"
          placeholder="13-digit SA ID"
          value={idNumber}
          onChange={(e) => setIdNumber(sanitizeSaIdDigits(e.target.value))}
          onBlur={touch('idNumber')}
          error={idError}
        />

        {/* Row 4 */}
        <AuthInput
          compact
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={touch('email')}
          error={emailError}
          placeholder="you@example.com"
        />

        {/* Row 5 — optional */}
        <AuthInput
          compact
          optional
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          placeholder="+27 82 123 4567 or 082 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={phoneError}
        />

        {/* Row 6 */}
        <div className="space-y-3">
          <AuthInput
            compact
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={touch('password')}
            error={passwordError}
            placeholder="Minimum 8 characters"
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
          <PasswordStrengthMeter password={password} />
        </div>

        {/* Row 7 */}
        <AuthInput
          compact
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={touch('confirmPassword')}
          error={confirmError}
          placeholder="Re-enter your password"
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

        <label className="flex cursor-pointer gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:border-[#5097A4]/35">
          <input
            type="checkbox"
            checked={acceptPopia}
            onChange={(e) => setAcceptPopia(e.target.checked)}
            onBlur={touch('acceptPopia')}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-[#5097A4] focus:ring-[#5097A4]"
          />
          <span className="text-xs font-medium leading-snug text-slate-700">
            I accept the POPIA Act and Terms of Use
          </span>
        </label>
        {popiaError ? <span className="-mt-3 block text-xs font-medium text-rose-600">{popiaError}</span> : null}

        <div className="space-y-3 pt-1">
          <AuthSubmitButton compact disabled={!canContinue || isSubmitting} loading={isSubmitting}>
            Continue
          </AuthSubmitButton>
          <p className="text-center text-xs font-medium text-slate-500">
            Already have an account?{' '}
            <Link
              className="font-semibold text-[#5097A4] underline-offset-2 hover:text-[#458A97] hover:underline"
              to="/login"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
