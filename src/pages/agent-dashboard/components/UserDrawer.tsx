import {Check, Circle, Download, Mail, StickyNote, X} from 'lucide-react';
import {useMemo} from 'react';
import {canDownloadWill, downloadWillDocument} from '../../../utils/downloadWillDocument';
import {
  ClientAvatar,
  WillStatusBadge,
  completenessColor,
  formatClientDate,
  formatShortDate,
} from './clientUi';
import type {ActivityEntry, AssignedUser, DashboardNote} from '../types';

function activityTone(type: ActivityEntry['type']) {
  if (type === 'call') return {bg: 'bg-emerald-500/12', fg: 'text-emerald-800', ring: 'ring-emerald-500/25', abbr: 'CL'};
  if (type === 'email') return {bg: 'bg-sky-500/10', fg: 'text-sky-900', ring: 'ring-sky-500/20', abbr: 'EM'};
  return {bg: 'bg-violet-500/10', fg: 'text-violet-900', ring: 'ring-violet-500/20', abbr: 'MT'};
}

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <div className="agent-details-row grid grid-cols-[120px_1fr] gap-3 border-b border-[#EEF1F4] py-3 last:border-0">
      <dt className="mw-section-label text-[10px] leading-relaxed text-[#6B7C93]">{label}</dt>
      <dd className="text-sm font-medium leading-relaxed text-[#1E2D3D]">{value}</dd>
    </div>
  );
}

function DetailsSection({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section className="agent-details-section">
      <h3 className="mw-section-label mb-3 text-[10px] font-bold text-[#6B7C93]">{title}</h3>
      {children}
    </section>
  );
}

type Props = {
  user: AssignedUser | null;
  activities: ActivityEntry[];
  notes: DashboardNote[];
  onClose: () => void;
  readOnly?: boolean;
};

export function UserDetailDrawer({user, activities, notes, onClose, readOnly = false}: Props) {
  const userActivities = useMemo(
    () =>
      activities
        .filter((a) => a.userId === user?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [activities, user?.id],
  );

  const userNotes = useMemo(
    () =>
      notes
        .filter((n) => n.userId === user?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notes, user?.id],
  );

  if (!user) return null;

  const tone = completenessColor(user.completeness);
  const completedSections = user.profileSections.filter((s) => s.complete).length;
  const totalSections = user.profileSections.length;
  const willDownloadReady = canDownloadWill(user);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[3px] agent-dash-transition"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <aside
        className="agent-client-drawer fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-xl flex-col border-l border-[#E5E9EE] bg-[#FAFBFC] agent-dash-transition"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-details-title"
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden border-b border-[#E5E9EE] bg-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'linear-gradient(135deg, rgba(80,151,164,0.08) 0%, rgba(255,255,255,0) 55%), radial-gradient(ellipse 80% 60% at 100% 0%, rgba(80,151,164,0.12), transparent 50%)',
            }}
          />
          <div className="relative flex items-start justify-between gap-4 px-6 pb-5 pt-6">
            <div className="flex min-w-0 flex-1 gap-4">
              <ClientAvatar name={user.name} size="lg" />
              <div className="min-w-0 pt-1">
                <p className="mw-section-label text-[10px] text-[#6B7C93]">Client details</p>
                <h2 id="client-details-title" className="mw-heading-display mt-1 truncate text-xl font-extrabold tracking-tight text-[#1E2D3D]">
                  {user.name}
                </h2>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <WillStatusBadge status={user.willStatus} />
                  <span className="text-[11px] font-medium text-[#6B7C93]">
                    Last updated {formatClientDate(user.lastUpdated)}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-[#E5E9EE] bg-white p-2 text-[#6B7C93] shadow-sm agent-dash-transition hover:border-[#5097A4]/30 hover:text-[#1E2D3D]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {readOnly ? (
          <div className="shrink-0 border-b border-[#E5E9EE] bg-[rgba(80,151,164,0.08)] px-6 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#3E8491]">
            Read-only — view client will details only
          </div>
        ) : null}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-7">
            {readOnly ? (
              <DetailsSection title="Will document">
                <div className="rounded-2xl border border-[#E5E9EE] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-sm leading-relaxed text-[#6B7C93]">
                    Download a read-only copy of this client&apos;s will. The exported file cannot be edited from the admin portal.
                  </p>
                  <button
                    type="button"
                    disabled={!willDownloadReady}
                    onClick={() => downloadWillDocument(user)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5097A4] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97] disabled:cursor-not-allowed disabled:bg-[#E5E9EE] disabled:text-[#6B7C93]"
                  >
                    <Download className="h-4 w-4" strokeWidth={2.5} />
                    Download will
                  </button>
                  {!willDownloadReady ? (
                    <p className="mt-3 text-center text-[11px] font-medium text-[#6B7C93]">
                      Available when the will is submitted or complete.
                    </p>
                  ) : (
                    <p className="mt-3 text-center text-[11px] font-medium text-[#6B7C93]">
                      Opens as a static HTML file · safe to print or save as PDF
                    </p>
                  )}
                </div>
              </DetailsSection>
            ) : null}

            {/* Will status & progress */}
            <DetailsSection title="Will status & progress">
              <div className="rounded-2xl border border-[#E5E9EE] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[#1E2D3D]">Overall completeness</span>
                  <span className="text-lg font-extrabold tabular-nums text-[#1E2D3D]" style={{color: tone}}>
                    {user.completeness}%
                  </span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-[#E5E9EE]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${user.completeness}%`,
                      background: `linear-gradient(90deg, ${tone}cc, ${tone})`,
                    }}
                  />
                </div>
                <p className="mt-3 text-xs text-[#6B7C93]">
                  {completedSections} of {totalSections} sections complete
                </p>

                {/* Segmented checklist */}
                <ul className="mt-5 space-y-2">
                  {user.profileSections.map((section) => (
                    <li
                      key={section.key}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${
                        section.complete
                          ? 'border-emerald-500/20 bg-emerald-500/[0.06]'
                          : 'border-[#E5E9EE] bg-[#FAFBFC]'
                      }`}
                    >
                      {section.complete ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25">
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E5E9EE] text-[#6B7C93]">
                          <Circle className="h-3 w-3" strokeWidth={2} />
                        </span>
                      )}
                      <span className={`font-medium ${section.complete ? 'text-[#1E2D3D]' : 'text-[#6B7C93]'}`}>
                        {section.label}
                      </span>
                      <span
                        className={`ml-auto text-[10px] font-bold uppercase tracking-[0.1em] ${
                          section.complete ? 'text-emerald-700' : 'text-[#6B7C93]/80'
                        }`}
                      >
                        {section.complete ? 'Done' : 'Pending'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </DetailsSection>

            {/* Personal info */}
            <DetailsSection title="Personal info">
              <dl className="rounded-2xl border border-[#E5E9EE] bg-white px-5 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Phone" value={user.phone} />
                <InfoRow label="Date of birth" value={user.dateOfBirth ?? '—'} />
                <InfoRow label="ID number" value={user.idNumber ?? '—'} />
              </dl>
            </DetailsSection>

            {/* Beneficiaries & estate */}
            <DetailsSection title="Beneficiaries & estate">
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#E5E9EE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="mw-section-label mb-2 text-[10px] text-[#6B7C93]">Assets</p>
                  <p className="text-sm leading-relaxed text-[#1E2D3D]">{user.assetsSummary}</p>
                </div>
                <div className="rounded-2xl border border-[#E5E9EE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="mw-section-label mb-2 text-[10px] text-[#6B7C93]">Policies</p>
                  <p className="text-sm leading-relaxed text-[#1E2D3D]">{user.policiesSummary}</p>
                </div>
                <div className="rounded-2xl border border-[#E5E9EE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="mw-section-label mb-2 text-[10px] text-[#6B7C93]">Beneficiaries</p>
                  <p className="text-sm leading-relaxed text-[#1E2D3D]">{user.beneficiariesSummary}</p>
                </div>
              </div>
            </DetailsSection>

            {/* Activity timeline */}
            <DetailsSection title="Recent activity & touchpoints">
              {userActivities.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#E5E9EE] bg-white px-4 py-8 text-center text-sm text-[#6B7C93]">
                  No touchpoints logged yet.
                </p>
              ) : (
                <ul className="space-y-0 rounded-2xl border border-[#E5E9EE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  {userActivities.slice(0, 6).map((a, idx, arr) => {
                    const tone = activityTone(a.type);
                    return (
                      <li key={a.id} className="agent-details-timeline-item flex gap-3 py-3">
                        <div className="relative flex shrink-0 flex-col items-center">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold ring-1 ${tone.bg} ${tone.fg} ${tone.ring}`}
                          >
                            {tone.abbr}
                          </span>
                          {idx < Math.min(arr.length, 6) - 1 ? (
                            <span className="mt-1 w-px flex-1 bg-gradient-to-b from-[#5097A4]/30 to-transparent" aria-hidden />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1 pb-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold capitalize text-[#1E2D3D]">{a.type}</p>
                            <span className="text-[11px] text-[#6B7C93]/80">{formatShortDate(a.createdAt)}</span>
                          </div>
                          <p className="mt-0.5 text-sm leading-relaxed text-[#6B7C93]">{a.summary}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </DetailsSection>

            {/* Notes */}
            <DetailsSection title="Notes">
              {userNotes.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#E5E9EE] bg-white px-4 py-8 text-center text-sm text-[#6B7C93]">
                  No internal notes for this client.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {userNotes.slice(0, 4).map((n) => (
                    <li
                      key={n.id}
                      className="rounded-2xl border border-[#E5E9EE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex items-start gap-2.5">
                        <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-[#5097A4]" strokeWidth={2} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-[#1E2D3D]">{n.authorName}</p>
                            <p className="text-[10px] text-[#6B7C93]">
                              {formatShortDate(n.createdAt)}
                              {n.edited ? <span className="ml-1 italic">edited</span> : null}
                            </p>
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-[#1E2D3D]/90">{n.body}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </DetailsSection>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#E5E9EE] bg-white px-6 py-4">
          <p className="flex items-center justify-center gap-2 text-center text-[11px] text-[#6B7C93]">
            <Mail className="h-3.5 w-3.5" strokeWidth={2} />
            {readOnly ? 'Read-only snapshot · Not editable in portal' : 'Read-only snapshot · Updates sync from MiWill app'}
          </p>
        </div>
      </aside>
    </>
  );
}
