import {Activity, AlertTriangle, KanbanSquare, Users} from 'lucide-react';
import type {ActivityEntry, AssignedUser, Lead} from '../types';

const STAT_BACKGROUNDS = [
  'linear-gradient(145deg, #6AB0BC 0%, #5097A4 42%, #458A97 100%)',
  'linear-gradient(145deg, #62A8B5 0%, #5097A4 45%, #3E8491 100%)',
  'linear-gradient(145deg, #5097A4 0%, #458A97 48%, #3E8491 100%)',
  'linear-gradient(145deg, #6AB0BC 0%, #5097A4 40%, #458A97 100%)',
] as const;

const PIPELINE_ACCENTS: Record<string, {borderTop: string}> = {
  New: {borderTop: '3px solid #5097A4'},
  Contacted: {borderTop: '3px solid #7EBFC2'},
  'In progress': {borderTop: '3px solid #4A9497'},
  Closed: {borderTop: '3px solid #3D8487'},
};

function StatCard({
  label,
  value,
  icon: Icon,
  gradientIndex,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  gradientIndex: number;
}) {
  const bg = STAT_BACKGROUNDS[gradientIndex % STAT_BACKGROUNDS.length];

  return (
    <div className="agent-overview-stat-card relative flex flex-col p-5 md:p-6" style={{background: bg}}>
      <div className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 left-4 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

      <div className="relative mb-4 flex items-center justify-between gap-2">
        <span className="mw-section-label text-[11px] leading-tight text-white/92">{label}</span>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/18 shadow-inner backdrop-blur-sm ring-1 ring-white/25">
          <Icon className="h-5 w-5 text-white drop-shadow-sm" strokeWidth={1.65} />
        </div>
      </div>
      <p className="relative mw-heading-display text-3xl font-extrabold tracking-tight text-white drop-shadow-sm md:text-4xl">{value}</p>
    </div>
  );
}

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

type Props = {
  users: AssignedUser[];
  leads: Lead[];
  activities: ActivityEntry[];
};

export function OverviewSection({users, leads, activities}: Props) {
  const incompleteProfiles = users.filter((u) => u.completeness < 80).length;
  const leadBuckets = leads.reduce(
    (acc, l) => {
      acc[l.stage] += 1;
      return acc;
    },
    {NEW: 0, CONTACTED: 0, IN_PROGRESS: 0, CLOSED: 0} as Record<string, number>,
  );

  const stats = [
    {label: 'Total assigned users', value: users.length, icon: Users},
    {label: 'Leads by stage (active)', value: leadBuckets.NEW + leadBuckets.CONTACTED + leadBuckets.IN_PROGRESS, icon: KanbanSquare},
    {label: 'Incomplete profiles', value: incompleteProfiles, icon: AlertTriangle},
    {label: 'Recent touchpoints (7d)', value: activities.length, icon: Activity},
  ] as const;

  const pipeline = [
    ['New', leadBuckets.NEW],
    ['Contacted', leadBuckets.CONTACTED],
    ['In progress', leadBuckets.IN_PROGRESS],
    ['Closed', leadBuckets.CLOSED],
  ] as const;

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px flex-1 max-w-[48px] rounded-full bg-gradient-to-r from-[#5097A4] to-transparent" aria-hidden />
          <p className="mw-section-label text-[11px] text-[#6B7C93]">Snapshot</p>
          <span className="h-px flex-1 rounded-full bg-gradient-to-r from-transparent via-[#E5E9EE] to-transparent" aria-hidden />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} gradientIndex={i} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="agent-overview-panel p-6 md:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="mw-section-label text-[11px] text-[#6B7C93]">Lead pipeline</p>
            <span className="rounded-full bg-[rgba(80,151,164,0.12)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#5097A4]">
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pipeline.map(([k, v]) => (
              <div
                key={k}
                className="agent-pipeline-cell px-3 pb-4 pt-3 text-center"
                style={PIPELINE_ACCENTS[k] ?? {borderTop: '3px solid #5097A4'}}
              >
                <p className="mw-heading-display text-2xl font-extrabold tabular-nums text-[#1E2D3D]">{v}</p>
                <p className="mw-section-label mt-2 text-[10px] text-[#6B7C93]">{k}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="agent-overview-panel p-6 md:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="mw-section-label text-[11px] text-[#6B7C93]">Activity log</p>
            <span className="text-[11px] font-medium text-[#6B7C93]/80">{activities.length} events</span>
          </div>
          <ul className="space-y-2">
            {activities.slice(0, 5).map((a, idx, arr) => (
              <li
                key={a.id}
                className="agent-activity-row agent-dash-transition flex gap-3 border-b border-[#EEF1F4] px-2 py-3 text-sm text-[#1E2D3D] last:border-0 md:px-3"
              >
                <div className="relative flex shrink-0 flex-col items-center pt-1">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ${activityTone(a.type)}`}
                  >
                    {a.type === 'status_update' ? 'SU' : a.type.slice(0, 2).toUpperCase()}
                  </span>
                  {idx < arr.length - 1 ? (
                    <span className="mt-1 h-full min-h-[12px] w-px grow bg-gradient-to-b from-[#5097A4]/35 to-transparent" aria-hidden />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <p className="font-semibold capitalize text-[#1E2D3D]">{a.type.replace('_', ' ')}</p>
                  <p className="mt-0.5 leading-relaxed text-[#6B7C93]">{a.summary}</p>
                  <p className="mt-1.5 text-xs font-medium text-[#6B7C93]/75">{formatTime(a.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
