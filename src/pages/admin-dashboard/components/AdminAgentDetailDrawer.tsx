import {Calendar, Mail, Phone, StickyNote, X} from 'lucide-react';
import {ClientAvatar, formatShortDate} from '../../agent-dashboard/components/clientUi';

type Touchpoints = {calls: number; emails: number; meetings: number};

type TimelineEntry = {
  id: string;
  type: string;
  summary: string;
  createdAt: string;
};

export type AdminAgentView = {
  id: string;
  name: string;
  email: string;
  status: string;
  joined: string;
  lastActive: string;
  assignedClients: number;
  leadsHandled: number;
  willsInProgress: number;
  touchpoints: Touchpoints;
  lastActivity?: string;
  timeline: TimelineEntry[];
};

const TYPE_META: Record<string, {iconBg: string; iconFg: string; Icon: typeof Phone}> = {
  call: {iconBg: 'rgba(29,158,117,0.12)', iconFg: '#1D9E75', Icon: Phone},
  email: {iconBg: 'rgba(59,130,246,0.12)', iconFg: '#2563EB', Icon: Mail},
  meeting: {iconBg: 'rgba(217,119,6,0.12)', iconFg: '#B45309', Icon: Calendar},
  note: {iconBg: 'rgba(156,163,175,0.15)', iconFg: '#6B7280', Icon: StickyNote},
};

type Props = {
  agent: AdminAgentView | null;
  onClose: () => void;
};

export function AdminAgentDetailDrawer({agent, onClose}: Props) {
  if (!agent) return null;

  const active = agent.status === 'active';

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
        aria-labelledby="agent-details-title"
      >
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
              <ClientAvatar name={agent.name} size="lg" />
              <div className="min-w-0 pt-1">
                <p className="mw-section-label text-[10px] text-[#6B7C93]">Agent profile</p>
                <h2 id="agent-details-title" className="mw-heading-display mt-1 truncate text-xl font-extrabold tracking-tight text-[#1E2D3D]">
                  {agent.name}
                </h2>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ring-1"
                    style={
                      active
                        ? {backgroundColor: 'rgba(46,204,154,0.14)', color: '#15803d', boxShadow: 'inset 0 0 0 1px rgba(46,204,154,0.35)'}
                        : {backgroundColor: 'rgba(239,68,68,0.12)', color: '#b91c1c', boxShadow: 'inset 0 0 0 1px rgba(239,68,68,0.3)'}
                    }
                  >
                    {agent.status}
                  </span>
                  <span className="text-[11px] font-medium text-[#6B7C93]">Joined {agent.joined}</span>
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

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-7">
            <section>
              <h3 className="mw-section-label mb-3 text-[10px] font-bold text-[#6B7C93]">Account</h3>
              <dl className="rounded-2xl border border-[#E5E9EE] bg-white px-5 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-[#EEF1F4] py-3 last:border-0">
                  <dt className="mw-section-label text-[10px] leading-relaxed text-[#6B7C93]">Email</dt>
                  <dd className="text-sm font-medium text-[#1E2D3D]">{agent.email}</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-[#EEF1F4] py-3 last:border-0">
                  <dt className="mw-section-label text-[10px] leading-relaxed text-[#6B7C93]">Last active</dt>
                  <dd className="text-sm font-medium text-[#1E2D3D]">{agent.lastActive}</dd>
                </div>
                {agent.lastActivity ? (
                  <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-[#EEF1F4] py-3 last:border-0">
                    <dt className="mw-section-label text-[10px] leading-relaxed text-[#6B7C93]">Last touchpoint</dt>
                    <dd className="text-sm font-medium text-[#1E2D3D]">{formatShortDate(agent.lastActivity)}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section>
              <h3 className="mw-section-label mb-3 text-[10px] font-bold text-[#6B7C93]">Workload</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#E5E9EE] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7C93]">Clients</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#1E2D3D]">{agent.assignedClients}</p>
                </div>
                <div className="rounded-xl border border-[#E5E9EE] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7C93]">Leads</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#1E2D3D]">{agent.leadsHandled}</p>
                </div>
                <div className="col-span-2 rounded-xl border border-[#E5E9EE] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7C93]">Wills in progress</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#1E2D3D]">{agent.willsInProgress}</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mw-section-label mb-3 text-[10px] font-bold text-[#6B7C93]">Touchpoints (7D)</h3>
              <div className="rounded-2xl border border-[#E5E9EE] bg-white p-4 text-sm font-semibold text-[#1E2D3D] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                {agent.touchpoints.calls} calls · {agent.touchpoints.emails} emails · {agent.touchpoints.meetings} meetings
              </div>
            </section>

            <section>
              <h3 className="mw-section-label mb-3 text-[10px] font-bold text-[#6B7C93]">Recent activity</h3>
              {agent.timeline.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#E5E9EE] bg-white px-4 py-8 text-center text-sm text-[#6B7C93]">
                  No recent activity logged.
                </p>
              ) : (
                <ul className="space-y-0 rounded-2xl border border-[#E5E9EE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  {agent.timeline.map((entry, idx, arr) => {
                    const meta = TYPE_META[entry.type] ?? TYPE_META.note;
                    const Icon = meta.Icon;
                    return (
                      <li key={entry.id} className="flex gap-3 py-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1"
                          style={{backgroundColor: meta.iconBg, color: meta.iconFg}}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.25} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold capitalize text-[#1E2D3D]">{entry.type}</p>
                          <p className="mt-0.5 text-sm leading-relaxed text-[#6B7C93]">{entry.summary}</p>
                          <p className="mt-1.5 text-xs font-medium text-[#6B7C93]/75">{formatShortDate(entry.createdAt)}</p>
                        </div>
                        {idx < arr.length - 1 ? null : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#E5E9EE] bg-white px-6 py-4">
          <p className="text-center text-[11px] text-[#6B7C93]">Read-only agent view · Manage accounts under Portal users</p>
        </div>
      </aside>
    </>
  );
}
