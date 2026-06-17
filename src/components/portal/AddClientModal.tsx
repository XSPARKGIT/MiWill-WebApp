import {FormEvent, useMemo, useState} from 'react';
import type {AssignedUser, WillStatus} from '../../pages/agent-dashboard/types';
import {createMiwillAppClient, getCurrentAuthUid} from '../../services/portalDataService';
import {
  EMAIL_REGEX,
  getSaIdRequiredError,
  getSaPhoneError,
  isValidSouthAfricanPhone,
  sanitizeSaIdDigits,
} from '../../utils/signupValidation';
import {PortalModalShell} from './PortalModalShell';
import {PortalInput, PortalPillSelector, PortalSelect, PortalTextarea} from './portalFormUi';

type AgentOption = {id: string; name: string};

type Props = {
  open: boolean;
  onClose: () => void;
  agents?: AgentOption[];
  onSuccess: (client: AssignedUser) => void;
};

type WillStatusOption = WillStatus;

export function AddClientModal({open, onClose, agents = [], onSuccess}: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [willStatus, setWillStatus] = useState<WillStatusOption>('draft');
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const idDigits = sanitizeSaIdDigits(idNumber);
  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === assignedAgentId) ?? null,
    [agents, assignedAgentId],
  );

  const firstNameError = touched.firstName && !firstName.trim() ? 'First name is required.' : '';
  const lastNameError = touched.lastName && !lastName.trim() ? 'Last name is required.' : '';
  const emailError =
    touched.email && !email.trim()
      ? 'Email address is required.'
      : touched.email && !EMAIL_REGEX.test(email.trim())
        ? 'Enter a valid email address.'
        : '';
  const phoneError =
    touched.phone && !phone.trim()
      ? 'Phone number is required.'
      : touched.phone
        ? getSaPhoneError(phone) || (!isValidSouthAfricanPhone(phone) ? 'Enter a valid SA number (+27… or 082… format).' : '')
        : '';
  const idError = touched.idNumber && idDigits ? getSaIdRequiredError(idDigits) : '';

  function reset() {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setDateOfBirth('');
    setIdNumber('');
    setWillStatus('draft');
    setAssignedAgentId('');
    setNotes('');
    setTouched({});
    setSubmitError('');
    setSubmitting(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function touch(field: string) {
    setTouched((prev) => ({...prev, [field]: true}));
  }

  function validate() {
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      idNumber: idDigits.length > 0,
    });
    return (
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      EMAIL_REGEX.test(email.trim()) &&
      phone.trim() &&
      isValidSouthAfricanPhone(phone) &&
      (!idDigits || idDigits.length === 13)
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const createdBy = getCurrentAuthUid();
    if (!createdBy) {
      setSubmitError('Could not save client. Try again.');
      return;
    }

    setSubmitting(true);
    try {
      const client = await createMiwillAppClient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth,
        idNumber: idDigits,
        willStatus,
        assignedAgentId: selectedAgent?.id ?? '',
        assignedAgentName: selectedAgent?.name ?? '',
        notes: notes.trim(),
        createdBy,
      });
      onSuccess(client);
      reset();
      onClose();
    } catch {
      setSubmitError('Could not save client. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PortalModalShell open={open} onClose={handleClose} subtitle="MiWill client" title="Add client">
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

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
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => touch('phone')}
          error={phoneError}
          placeholder="+27 82 000 0000"
        />

        <PortalPillSelector
          label="Will status"
          required
          value={willStatus}
          onChange={setWillStatus}
          options={[
            {value: 'draft', label: 'Draft'},
            {value: 'review', label: 'In review'},
            {value: 'submitted', label: 'Submitted'},
            {value: 'complete', label: 'Complete'},
          ]}
        />

        <PortalInput
          label="Date of birth"
          optional
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />

        <PortalInput
          label="SA ID number"
          optional
          inputMode="numeric"
          value={idNumber}
          onChange={(e) => setIdNumber(sanitizeSaIdDigits(e.target.value))}
          onBlur={() => touch('idNumber')}
          error={idError}
          placeholder="13-digit ID number"
        />

        <PortalSelect
          label="Assigned agent"
          optional
          value={assignedAgentId}
          onChange={(e) => setAssignedAgentId(e.target.value)}
          disabled={agents.length === 0}
        >
          <option value="">{agents.length === 0 ? 'No agents available' : 'Unassigned'}</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </PortalSelect>

        <PortalTextarea
          label="Notes"
          optional
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Client notes…"
        />

        {submitError ? <p className="text-xs font-semibold text-rose-700">{submitError}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97] disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save client'}
        </button>
      </form>
    </PortalModalShell>
  );
}
