import {FormEvent, useState} from 'react';
import {
  createPortalAgent,
  emailExistsInPortalUsers,
  getCurrentAuthUid,
} from '../../services/portalDataService';
import {
  EMAIL_REGEX,
  getSaIdRequiredError,
  getSaPhoneError,
  isAtLeast18,
  isValidSouthAfricanPhone,
  sanitizeSaIdDigits,
} from '../../utils/signupValidation';
import {PortalModalShell} from './PortalModalShell';
import {PortalInput} from './portalFormUi';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (agent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    temporaryPassword?: string;
  }) => void;
};

const STEPS = ['Identity', 'Contact', 'Confirm'] as const;

export function CreateAgentModal({open, onClose, onSuccess}: Props) {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptPopia, setAcceptPopia] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    temporaryPassword: string;
  } | null>(null);

  const idDigits = sanitizeSaIdDigits(idNumber);

  const firstNameError = touched.firstName && !firstName.trim() ? 'First name is required.' : '';
  const lastNameError = touched.lastName && !lastName.trim() ? 'Last name is required.' : '';
  const dobError =
    touched.dateOfBirth && !dateOfBirth
      ? 'Date of birth is required.'
      : touched.dateOfBirth && dateOfBirth && !isAtLeast18(dateOfBirth)
        ? 'Agent must be at least 18 years old.'
        : '';
  const idError = touched.idNumber ? getSaIdRequiredError(idDigits) : '';
  const emailError =
    touched.email && !email.trim()
      ? 'Email address is required.'
      : touched.email && !EMAIL_REGEX.test(email.trim())
        ? 'Enter a valid email address.'
        : '';
  const phoneError = touched.phone && phone.trim() ? getSaPhoneError(phone) : '';

  const stepOneValid =
    firstName.trim() && lastName.trim() && dateOfBirth && isAtLeast18(dateOfBirth) && idDigits.length === 13;
  const stepTwoValid = email.trim() && EMAIL_REGEX.test(email.trim()) && (!phone.trim() || isValidSouthAfricanPhone(phone));
  const stepThreeValid = acceptPopia;

  function reset() {
    setStep(0);
    setFirstName('');
    setLastName('');
    setDateOfBirth('');
    setIdNumber('');
    setEmail('');
    setPhone('');
    setAcceptPopia(false);
    setTouched({});
    setSubmitError('');
    setSubmitting(false);
    setCreatedCredentials(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function touch(field: string) {
    setTouched((prev) => ({...prev, [field]: true}));
  }

  async function goNext() {
    if (step === 0) {
      setTouched({firstName: true, lastName: true, dateOfBirth: true, idNumber: true});
      if (!stepOneValid) return;
      setStep(1);
      return;
    }

    if (step === 1) {
      setTouched({email: true, phone: true});
      if (!stepTwoValid) return;
      if (await emailExistsInPortalUsers(email.trim())) {
        setSubmitError('Could not create account. This email may already be in use.');
        return;
      }
      setSubmitError('');
      setStep(2);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError('');
    setTouched({
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      idNumber: true,
      email: true,
      phone: true,
    });

    if (!stepOneValid || !stepTwoValid || !stepThreeValid) return;

    const createdBy = getCurrentAuthUid();
    if (!createdBy) {
      setSubmitError('Could not create account. This email may already be in use.');
      return;
    }

    setSubmitting(true);
    try {
      const agent = await createPortalAgent({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        idNumber: idDigits,
        email: email.trim(),
        phone: phone.trim(),
        createdBy,
      });
      setCreatedCredentials({
        email: agent.email,
        temporaryPassword: agent.temporaryPassword ?? '',
      });
      onSuccess(agent);
    } catch {
      setSubmitError('Could not create account. This email may already be in use.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PortalModalShell
      open={open}
      onClose={handleClose}
      subtitle="Portal agent"
      title="Create agent"
      maxWidthClass="max-w-lg"
    >
      <div className="mb-5 flex items-center gap-2">
        {STEPS.map((label, index) => {
          const complete = index < step;
          const active = index === step;
          return (
            <div key={label} className="flex flex-1 flex-col gap-1">
              <div
                className="h-1 rounded-full agent-dash-transition"
                style={{backgroundColor: complete || active ? '#5097A4' : '#E5E9EE'}}
              />
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#6B7C93]">{label}</span>
            </div>
          );
        })}
      </div>

      {createdCredentials ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-[#1E2D3D]">
            Agent account created. Share this temporary password with the agent securely — it is shown only once.
          </p>
          <div className="rounded-2xl border border-[#E5E9EE] bg-[#FAFBFC] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7C93]">Email</p>
            <p className="mt-1 text-sm font-semibold text-[#1E2D3D]">{createdCredentials.email}</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7C93]">Temporary password</p>
            <p className="mt-1 font-mono text-sm font-semibold text-[#1E2D3D]">{createdCredentials.temporaryPassword}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97]"
          >
            Done
          </button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)} noValidate>
          {step === 0 ? (
            <>
              <PortalInput
                label="First name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => touch('firstName')}
                error={firstNameError}
              />
              <PortalInput
                label="Last name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => touch('lastName')}
                error={lastNameError}
              />
              <PortalInput
                label="Date of birth"
                required
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                onBlur={() => touch('dateOfBirth')}
                error={dobError}
              />
              <PortalInput
                label="SA ID number"
                required
                inputMode="numeric"
                value={idNumber}
                onChange={(e) => setIdNumber(sanitizeSaIdDigits(e.target.value))}
                onBlur={() => touch('idNumber')}
                error={idError}
                placeholder="13-digit ID number"
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <PortalInput
                label="Email address"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => touch('email')}
                error={emailError}
              />
              <PortalInput
                label="Phone number"
                optional
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => touch('phone')}
                error={phoneError}
                placeholder="+27 82 000 0000"
              />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <p className="text-sm text-[#6B7C93]">
                A secure temporary password will be generated automatically. You must share it with the agent directly.
              </p>
              <label className="flex items-start gap-3 rounded-2xl border border-[#E5E9EE] bg-[#FAFBFC] px-4 py-3">
                <input
                  type="checkbox"
                  checked={acceptPopia}
                  onChange={(e) => setAcceptPopia(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#5097A4]/60 text-[#5097A4]"
                />
                <span className="text-xs leading-relaxed text-[#1E2D3D]">
                  I confirm this account is created in compliance with POPIA and MiWill&apos;s terms of service
                </span>
              </label>
            </>
          ) : null}

          {submitError ? <p className="text-xs font-semibold text-rose-700">{submitError}</p> : null}

          <div className="flex gap-3 pt-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 rounded-2xl border border-[#E5E9EE] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#6B7C93] agent-dash-transition hover:bg-[#F4F6F8]"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-2xl border border-[#E5E9EE] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#6B7C93] agent-dash-transition hover:bg-[#F4F6F8]"
              >
                Cancel
              </button>
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={() => void goNext()}
                className="flex-1 rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97]"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || !acceptPopia}
                className="flex-1 rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97] disabled:opacity-60"
              >
                {submitting ? 'Saving...' : 'Create agent'}
              </button>
            )}
          </div>
        </form>
      )}
    </PortalModalShell>
  );
}
