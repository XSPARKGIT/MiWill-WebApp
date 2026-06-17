import {
  Activity,
  FileText,
  KanbanSquare,
  UserPlus,
  Users,
  UserSearch,
  UserRoundPlus,
} from 'lucide-react';
import {useDashboardData} from '../../../context/DashboardDataContext';
import {AdminStatCard} from '../components/AdminStatCard';

const STAT_ICONS = [Users, UserSearch, KanbanSquare, FileText, FileText, Activity] as const;

function formatTime(ts: string) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function activityTone(type: string) {
  const t = type.toLowerCase();
  if (t === 'call') return 'bg-emerald-500/15 text-emerald-800 ring-emerald-500/25';
  if (t === 'email') return 'bg-sky-500/12 text-sky-900 ring-sky-500/20';
  if (t === 'note') return 'bg-violet-500/12 text-violet-900 ring-violet-500/20';
  return 'bg-[#5097A4]/15 text-[#3E8491] ring-[#5097A4]/25';
}

type QuickAction = {
  label: string;
  subtitle: string;
  icon: typeof UserPlus;
  onClick: () => void;
};

type Props = {
  onAddAgent: () => void;
  onAddClient: () => void;
  onViewAgents: () => void;
  onViewClients: () => void;
};

export function AdminOverviewSection({
  onAddAgent,
  onAddClient,
  onViewAgents,
  onViewClients,
}: Props) {
  const {overviewStats, platformActivity} = useDashboardData();
  const quickActions: QuickAction[] = [
    {
      label: 'Add new agent',
      subtitle: 'Create a portal agent account',
      icon: UserPlus,
      onClick: onAddAgent,
    },
    {
      label: 'Add new client',
      subtitle: 'Register a MiWill client profile',
      icon: UserRoundPlus,
      onClick: onAddClient,
    },
    {
      label: 'View agents',
      subtitle: 'All portal agents and workload',
      icon: UserSearch,
      onClick: onViewAgents,
    },
    {
      label: 'View clients',
      subtitle: 'All clients and wills — read only',
      icon: Users,
      onClick: onViewClients,
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px flex-1 max-w-[48px] rounded-full bg-gradient-to-r from-[#5097A4] to-transparent" aria-hidden />
          <p className="mw-section-label text-[11px] text-[#6B7C93]">Snapshot</p>
          <span className="h-px flex-1 rounded-full bg-gradient-to-r from-transparent via-[#E5E9EE] to-transparent" aria-hidden />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {overviewStats.map((stat, i) => (
            <AdminStatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={STAT_ICONS[i] ?? Users}
              gradientIndex={i}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="agent-overview-panel p-6 md:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="mw-section-label text-[11px] text-[#6B7C93]">Recent platform activity</p>
            <span className="text-[11px] font-medium text-[#6B7C93]/80">{platformActivity.length} events</span>
          </div>
          <ul className="space-y-2">
            {platformActivity.map((a, idx, arr) => (
              <li
                key={a.id}
                className="agent-activity-row agent-dash-transition flex gap-3 border-b border-[#EEF1F4] px-2 py-3 text-sm text-[#1E2D3D] last:border-0 md:px-3"
              >
                <div className="relative flex shrink-0 flex-col items-center pt-1">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ${activityTone(a.actionType)}`}
                  >
                    {a.actionType.slice(0, 2).toUpperCase()}
                  </span>
                  {idx < arr.length - 1 ? (
                    <span className="mt-1 h-full min-h-[12px] w-px grow bg-gradient-to-b from-[#5097A4]/35 to-transparent" aria-hidden />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <p className="font-semibold text-[#1E2D3D]">
                    {a.agentName} · <span className="capitalize text-[#6B7C93]">{a.actionType}</span>
                  </p>
                  <p className="mt-0.5 leading-relaxed text-[#6B7C93]">{a.client}</p>
                  <p className="mt-1.5 text-xs font-medium text-[#6B7C93]/75">{formatTime(a.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="agent-overview-panel p-6 md:p-7">
          <p className="mw-section-label mb-5 text-[11px] text-[#6B7C93]">Quick actions</p>
          <div className="space-y-3">
            {quickActions.map(({label, subtitle, icon: Icon, onClick}) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="agent-dash-transition flex w-full items-center gap-3 rounded-2xl border border-[#E5E9EE] bg-white px-4 py-4 text-left hover:border-[#5097A4]/35"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(80,151,164,0.12)] text-[#5097A4]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-[#1E2D3D]">{label}</span>
                  <span className="mt-0.5 block text-xs text-[#6B7C93]">{subtitle}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
