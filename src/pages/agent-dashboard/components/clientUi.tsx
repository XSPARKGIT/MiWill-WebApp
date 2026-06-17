import {CheckCircle2, Clock, FilePenLine, Send} from 'lucide-react';
import type {WillStatus} from '../types';

export function clientInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '??';
}

const WILL_STATUS: Record<
  WillStatus,
  {label: string; bg: string; fg: string; ring: string; Icon: typeof CheckCircle2}
> = {
  complete: {
    label: 'Complete',
    bg: 'rgba(46,204,154,0.14)',
    fg: '#15803d',
    ring: 'rgba(46,204,154,0.35)',
    Icon: CheckCircle2,
  },
  submitted: {
    label: 'Submitted',
    bg: 'rgba(80,151,164,0.16)',
    fg: '#3E8491',
    ring: 'rgba(80,151,164,0.4)',
    Icon: Send,
  },
  review: {
    label: 'In review',
    bg: 'rgba(245,158,11,0.16)',
    fg: '#b45309',
    ring: 'rgba(245,158,11,0.35)',
    Icon: Clock,
  },
  draft: {
    label: 'Draft',
    bg: 'rgba(239,68,68,0.12)',
    fg: '#b91c1c',
    ring: 'rgba(239,68,68,0.3)',
    Icon: FilePenLine,
  },
};

export function WillStatusBadge({status, size = 'md'}: {status: WillStatus; size?: 'sm' | 'md'}) {
  const x = WILL_STATUS[status];
  const Icon = x.Icon;
  const compact = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-[0.1em] ring-1 ${
        compact ? 'px-2.5 py-1 text-[9px]' : 'px-3 py-1.5 text-[10px]'
      }`}
      style={{backgroundColor: x.bg, color: x.fg, boxShadow: `inset 0 0 0 1px ${x.ring}`}}
    >
      <Icon className={compact ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} strokeWidth={2.25} />
      {x.label}
    </span>
  );
}

export function ClientAvatar({
  name,
  size = 'md',
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const initials = clientInitials(name);
  const dim = size === 'lg' ? 'h-16 w-16 text-lg' : size === 'md' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs';

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white shadow-[0_2px_8px_rgba(80,151,164,0.35)]`}
      style={{background: 'linear-gradient(145deg, #6AB0BC 0%, #5097A4 50%, #458A97 100%)'}}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function completenessColor(pct: number): string {
  if (pct >= 80) return '#2ecc9a';
  if (pct >= 40) return '#f59e0b';
  return '#ef4444';
}

export function ProfileProgressBar({
  pct,
  variant = 'inline',
}: {
  pct: number;
  variant?: 'inline' | 'full';
}) {
  const color = completenessColor(pct);
  const widthClass = variant === 'full' ? 'w-full' : 'w-full min-w-[100px] max-w-[140px]';

  return (
    <div className={`flex items-center gap-2.5 ${variant === 'full' ? 'w-full' : ''}`}>
      <div
        className={`relative h-2.5 overflow-hidden rounded-full bg-[#E5E9EE] ${widthClass}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full agent-dash-transition"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}dd, ${color})`,
            boxShadow: `0 0 8px ${color}44`,
          }}
        />
      </div>
      <span
        className={`shrink-0 tabular-nums font-bold ${variant === 'full' ? 'text-sm' : 'text-xs'} text-[#1E2D3D]`}
      >
        {pct}%
      </span>
    </div>
  );
}

export function formatClientDate(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
