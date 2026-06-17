import {ChevronDown, Mail, Phone, StickyNote, Calendar, UserPlus, Users} from 'lucide-react';
import {useMemo, useState} from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {useAgents} from '../../../hooks/useAgents';
import {ClientAvatar, formatShortDate} from '../../agent-dashboard/components/clientUi';

const TYPE_META: Record<string, {iconBg: string; iconFg: string; Icon: typeof Phone}> = {
  call: {iconBg: 'rgba(29,158,117,0.12)', iconFg: '#1D9E75', Icon: Phone},
  email: {iconBg: 'rgba(59,130,246,0.12)', iconFg: '#2563EB', Icon: Mail},
  meeting: {iconBg: 'rgba(217,119,6,0.12)', iconFg: '#B45309', Icon: Calendar},
  note: {iconBg: 'rgba(156,163,175,0.15)', iconFg: '#6B7280', Icon: StickyNote},
};

function agentDisplayName(agent: Record<string, unknown>) {
  const firstName = String(agent.firstName ?? agent.first_name ?? '').trim();
  const lastName = String(agent.lastName ?? agent.last_name ?? '').trim();
  const full = [firstName, lastName].filter(Boolean).join(' ');
  return full || String(agent.name ?? agent.displayName ?? 'Agent').trim();
}

function agentFirstName(agent: Record<string, unknown>) {
  const firstName = String(agent.firstName ?? agent.first_name ?? '').trim();
  if (firstName) return firstName;
  return agentDisplayName(agent).split(/\s+/)[0] ?? 'Agent';
}

function mapAgentMetrics(agent: Record<string, unknown>) {
  const touchpointsRaw = agent.touchpoints;
  const touchpointsObj =
    touchpointsRaw && typeof touchpointsRaw === 'object'
      ? (touchpointsRaw as Record<string, unknown>)
      : null;

  const touchpointsSum = touchpointsObj
    ? Number(touchpointsObj.calls ?? 0) +
      Number(touchpointsObj.emails ?? 0) +
      Number(touchpointsObj.meetings ?? 0)
    : 0;

  const assignedClients = Number(agent.assignedClients ?? agent.assigned_clients ?? 0);
  const leadsHandled = Number(agent.leadsHandled ?? agent.leads_handled ?? 0);
  const touchpointsThisMonth = Number(
    agent.touchpointsThisMonth ?? agent.touchpoints_this_month ?? touchpointsSum ?? 0,
  );

  const timeline = Array.isArray(agent.timeline)
    ? agent.timeline.map((entry, index) => {
        const item = entry as Record<string, unknown>;
        return {
          id: String(item.id ?? `tl-${index}`),
          type: String(item.type ?? 'note'),
          summary: String(item.summary ?? item.description ?? ''),
          createdAt: String(item.createdAt ?? item.created_at ?? new Date().toISOString()),
        };
      })
    : [];

  const lastActivity =
    typeof agent.lastActivity === 'string'
      ? agent.lastActivity
      : typeof agent.last_active === 'string'
        ? agent.last_active
        : timeline[0]?.createdAt;

  const touchpoints = {
    calls: Number(touchpointsObj?.calls ?? 0),
    emails: Number(touchpointsObj?.emails ?? 0),
    meetings: Number(touchpointsObj?.meetings ?? 0),
  };

  return {
    id: String(agent.id),
    name: agentDisplayName(agent),
    firstName: agentFirstName(agent),
    assignedClients: Number.isFinite(assignedClients) ? assignedClients : 0,
    leadsHandled: Number.isFinite(leadsHandled) ? leadsHandled : 0,
    touchpointsThisMonth: Number.isFinite(touchpointsThisMonth) ? touchpointsThisMonth : 0,
    touchpoints,
    lastActivity,
    timeline,
  };
}

function AgentPerformanceLoading() {
  return (
    <div className="relative min-h-[320px]">
      <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-[#E5E9EE]">
        <div
          className="h-full w-1/3 bg-[#5097A4]"
          style={{animation: 'admin-perf-progress 1.4s ease-in-out infinite'}}
        />
      </div>
      <style>{`
        @keyframes admin-perf-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 py-16">
        <div
          className="flex h-14 w-14 animate-pulse items-center justify-center rounded-xl text-sm font-bold uppercase tracking-[0.18em] text-white"
          style={{backgroundColor: '#5097A4'}}
        >
          MW
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7C93]">Loading agent data...</p>
      </div>
    </div>
  );
}

function AgentPerformanceEmpty({onCreateAgent}: {onCreateAgent?: () => void}) {
  return (
    <div className="space-y-6">
      {onCreateAgent ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCreateAgent}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97]"
          >
            <UserPlus className="h-4 w-4" />
            Create agent
          </button>
        </div>
      ) : null}
      <div className="agent-overview-panel flex flex-col items-center px-6 py-16 text-center md:px-10">
        <Users className="h-12 w-12 text-[#6B7C93]/45" strokeWidth={1.5} />
        <h3 className="mt-5 text-lg font-bold text-[#1E2D3D]">No agents yet</h3>
        <p className="mt-2 max-w-sm text-sm text-[#6B7C93]">
          Once agents are added to the portal they will appear here.
        </p>
        {onCreateAgent ? (
          <button
            type="button"
            onClick={onCreateAgent}
            className="mt-6 inline-flex w-full max-w-xs items-center justify-center rounded-2xl bg-[#5097A4] px-5 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97]"
          >
            Create agent
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AdminAgentPerformanceSection({onCreateAgent}: {onCreateAgent?: () => void}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const {agents, loading, error} = useAgents();

  const mappedAgents = useMemo(
    () => agents.map((agent) => mapAgentMetrics(agent as Record<string, unknown>)),
    [agents],
  );

  const chartData = useMemo(
    () =>
      mappedAgents.map((agent) => ({
        name: agent.firstName,
        assignedClients: agent.assignedClients,
        leadsHandled: agent.leadsHandled,
        touchpointsThisMonth: agent.touchpointsThisMonth,
      })),
    [mappedAgents],
  );

  if (loading) {
    return <AgentPerformanceLoading />;
  }

  if (error) {
    return (
      <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
        Could not load agent data. Check your Firestore connection.
      </p>
    );
  }

  if (mappedAgents.length === 0) {
    return <AgentPerformanceEmpty onCreateAgent={onCreateAgent} />;
  }

  return (
    <div className="space-y-6">
      {onCreateAgent ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCreateAgent}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97]"
          >
            <UserPlus className="h-4 w-4" />
            Create agent
          </button>
        </div>
      ) : null}
      <div className="agent-overview-panel p-5 md:p-6">
        <p className="mw-section-label mb-5 text-[11px] text-[#6B7C93]">Performance overview</p>
        <div style={{height: 240}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{top: 8, right: 8, left: -12, bottom: 0}}>
              <CartesianGrid stroke="#EEF1F4" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{fill: '#6B7C93', fontSize: 11, fontWeight: 600}}
                axisLine={{stroke: '#E5E9EE'}}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{fill: '#6B7C93', fontSize: 11}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E5E9EE',
                  fontSize: 12,
                }}
              />
              <Legend
                wrapperStyle={{fontSize: 11, fontWeight: 600, color: '#6B7C93'}}
              />
              <Bar dataKey="assignedClients" name="Assigned Clients" fill="#1D9E75" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leadsHandled" name="Leads Handled" fill="#5DCAA5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="touchpointsThisMonth" name="Touchpoints This Month" fill="#085041" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {mappedAgents.map((agent) => {
          const expanded = expandedId === agent.id;
          return (
            <div key={agent.id} className="agent-overview-panel p-5 md:p-6">
              <div className="flex items-start gap-3">
                <ClientAvatar name={agent.name} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-[#1E2D3D]">{agent.name}</h3>
                  <p className="mt-1 text-xs text-[#6B7C93]">
                    {agent.lastActivity ? `Last active ${formatShortDate(agent.lastActivity)}` : 'No recent activity'}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#E5E9EE] bg-[#FAFBFC] px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7C93]">Clients</p>
                  <p className="mt-1 text-xl font-extrabold text-[#1E2D3D]">{agent.assignedClients}</p>
                </div>
                <div className="rounded-xl border border-[#E5E9EE] bg-[#FAFBFC] px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7C93]">Leads</p>
                  <p className="mt-1 text-xl font-extrabold text-[#1E2D3D]">{agent.leadsHandled}</p>
                </div>
                <div className="col-span-2 rounded-xl border border-[#E5E9EE] bg-[#FAFBFC] px-3 py-2.5 sm:col-span-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7C93]">Touchpoints</p>
                  <p className="mt-1 text-xs font-semibold text-[#1E2D3D]">
                    {agent.touchpoints.calls} calls · {agent.touchpoints.emails} emails · {agent.touchpoints.meetings}{' '}
                    meetings
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : agent.id)}
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5097A4] agent-dash-transition hover:text-[#458A97]"
              >
                View details
                <ChevronDown className={`h-3.5 w-3.5 agent-dash-transition ${expanded ? 'rotate-180' : ''}`} />
              </button>

              {expanded ? (
                <ul className="notes-timeline mt-4 space-y-0 pl-1">
                  {agent.timeline.length === 0 ? (
                    <li className="rounded-xl border border-dashed border-[#E5E9EE] px-4 py-6 text-center text-sm text-[#6B7C93]">
                      No activity logged yet.
                    </li>
                  ) : (
                    agent.timeline.map((entry, idx, arr) => {
                      const meta = TYPE_META[entry.type] ?? TYPE_META.note;
                      const Icon = meta.Icon;
                      const isLast = idx === arr.length - 1;
                      return (
                        <li key={entry.id} className="notes-timeline-entry group relative flex gap-4 pb-6 last:pb-0">
                          <div className="relative flex shrink-0 flex-col items-center pt-1">
                            <span
                              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-white"
                              style={{backgroundColor: meta.iconBg, color: meta.iconFg}}
                            >
                              <Icon className="h-4 w-4" strokeWidth={2.25} />
                            </span>
                            {!isLast ? (
                              <span
                                className="absolute top-10 bottom-0 w-px bg-gradient-to-b from-[#E5E9EE] to-transparent"
                                aria-hidden
                              />
                            ) : null}
                          </div>
                          <div className="notes-panel min-w-0 flex-1 px-4 py-3.5">
                            <p className="text-sm font-semibold capitalize text-[#1E2D3D]">{entry.type}</p>
                            <p className="mt-1 text-sm leading-relaxed text-[#6B7C93]">{entry.summary}</p>
                            <p className="mt-2 text-xs font-medium text-[#6B7C93]/75">{formatShortDate(entry.createdAt)}</p>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
