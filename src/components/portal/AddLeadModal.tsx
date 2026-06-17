import {FormEvent, useMemo, useState} from 'react';
import type {Lead} from '../../pages/agent-dashboard/types';
import {createLead, getPortalActorId} from '../../services/leadsService';
import {EMAIL_REGEX, getSaPhoneError, isValidSouthAfricanPhone} from '../../utils/signupValidation';
import {PortalModalShell} from './PortalModalShell';
import {PortalInput, PortalPillSelector, PortalSelect, PortalTextarea} from './portalFormUi';

type Pipeline = 'miwill' | 'capital';
type Stage = 'new' | 'contacted' | 'in_progress' | 'closed';

type AgentOption = {id: string; name: string};

type Props = {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  agents?: AgentOption[];
  onSuccess: (lead: Lead) => void;
};

const SOURCE_OPTIONS = [
  'Referral',
  'Website inquiry',
  'Cold outreach',
  'Broker referral',
  'Other',
] as const;

export function AddLeadModal({open, onClose, isAdmin = false, agents = [], onSuccess}: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pipeline, setPipeline] = useState<Pipeline>('miwill');
  const [stage, setStage] = useState<Stage>('new');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === assignedAgentId) ?? null,
    [agents, assignedAgentId],
  );

  const fullNameError = touched.fullName && !fullName.trim() ? 'Full name is required.' : '';
  const phoneError =
    touched.phone && !phone.trim()
      ? 'Phone number is required.'
      : touched.phone
        ? getSaPhoneError(phone) || (!isValidSouthAfricanPhone(phone) ? 'Enter a valid SA number (+27… or 082… format).' : '')
        : '';
  const emailError =
    touched.email && email.trim() && !EMAIL_REGEX.test(email.trim()) ? 'Enter a valid email address.' : '';
  const stageError = touched.stage && !stage ? 'Stage is required.' : '';

  function reset() {
    setFullName('');
    setPhone('');
    setEmail('');
    setPipeline('miwill');
    setStage('new');
    setSource('');
    setNotes('');
    setAssignedAgentId('');
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
    const nextTouched = {
      fullName: true,
      phone: true,
      email: true,
      stage: true,
    };
    setTouched(nextTouched);
    return (
      fullName.trim() &&
      phone.trim() &&
      isValidSouthAfricanPhone(phone) &&
      (!email.trim() || EMAIL_REGEX.test(email.trim())) &&
      stage
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const createdBy = getPortalActorId();
    if (!createdBy) {
      setSubmitError('Could not save lead. Sign in again and retry.');
      return;
    }

    setSubmitting(true);
    try {
      const lead = await createLead({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        pipeline,
        stage,
        source,
        notes: notes.slice(0, 300),
        assignedAgentId: selectedAgent?.id ?? '',
        assignedAgentName: selectedAgent?.name ?? '',
        createdBy,
      });
      onSuccess(lead);
      reset();
      onClose();
    } catch (error) {
      console.error('createLead error:', error);
      setSubmitError('Could not save lead. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PortalModalShell open={open} onClose={handleClose} subtitle="Lead pipeline" title="Add lead">
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)} noValidate>
        <PortalInput
          label="Full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={() => touch('fullName')}
          error={fullNameError}
          placeholder="e.g. Thabo Nkosi"
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
          label="Pipeline"
          required
          value={pipeline}
          onChange={setPipeline}
          options={[
            {value: 'miwill', label: 'MiWill'},
            {value: 'capital', label: 'Capital Legacy'},
          ]}
        />

        <PortalPillSelector
          label="Stage"
          required
          value={stage}
          onChange={setStage}
          error={stageError}
          options={[
            {value: 'new', label: 'New'},
            {value: 'contacted', label: 'Contacted'},
            {value: 'in_progress', label: 'In progress'},
            {value: 'closed', label: 'Closed'},
          ]}
        />

        <PortalInput
          label="Email address"
          optional
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => touch('email')}
          error={emailError}
          placeholder="lead@email.com"
        />

        <PortalSelect
          label="Source"
          optional
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="">Select source</option>
          {SOURCE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </PortalSelect>

        <PortalTextarea
          label="Notes"
          optional
          value={notes}
          maxLength={300}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Context for this lead…"
        />
        <p className="-mt-2 text-right text-[10px] font-medium text-[#6B7C93]">{notes.length}/300</p>

        {isAdmin ? (
          <PortalSelect
            label="Assign to agent"
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
        ) : null}

        {submitError ? <p className="text-xs font-semibold text-rose-700">{submitError}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97] disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save lead'}
        </button>
      </form>
    </PortalModalShell>
  );
}
