import type {LucideIcon} from 'lucide-react';

const STAT_BACKGROUNDS = [
  'linear-gradient(145deg, #6AB0BC 0%, #5097A4 42%, #458A97 100%)',
  'linear-gradient(145deg, #62A8B5 0%, #5097A4 45%, #3E8491 100%)',
  'linear-gradient(145deg, #5097A4 0%, #458A97 48%, #3E8491 100%)',
  'linear-gradient(145deg, #6AB0BC 0%, #5097A4 40%, #458A97 100%)',
] as const;

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  gradientIndex,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
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
