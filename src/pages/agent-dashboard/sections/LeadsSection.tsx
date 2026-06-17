import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Mail,
  Phone,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {clientInitials} from '../components/clientUi';
import type {Lead, LeadStage} from '../types';

const STAGES: LeadStage[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED'];

type StageTheme = {
  label: string;
  accent: string;
  headerBg: string;
  laneBg: string;
  pillBg: string;
  pillFg: string;
  pillRing: string;
  Icon: typeof Sparkles;
};

const STAGE_THEME: Record<LeadStage, StageTheme> = {
  NEW: {
    label: 'New',
    accent: '#5097A4',
    headerBg: 'rgba(80, 151, 164, 0.1)',
    laneBg: 'rgba(80, 151, 164, 0.04)',
    pillBg: 'rgba(80, 151, 164, 0.14)',
    pillFg: '#3E8491',
    pillRing: 'rgba(80, 151, 164, 0.35)',
    Icon: Sparkles,
  },
  CONTACTED: {
    label: 'Contacted',
    accent: '#4A8FAE',
    headerBg: 'rgba(74, 143, 174, 0.1)',
    laneBg: 'rgba(74, 143, 174, 0.04)',
    pillBg: 'rgba(74, 143, 174, 0.14)',
    pillFg: '#1e4d63',
    pillRing: 'rgba(74, 143, 174, 0.35)',
    Icon: Phone,
  },
  IN_PROGRESS: {
    label: 'In progress',
    accent: '#D97706',
    headerBg: 'rgba(217, 119, 6, 0.1)',
    laneBg: 'rgba(217, 119, 6, 0.04)',
    pillBg: 'rgba(217, 119, 6, 0.14)',
    pillFg: '#92400e',
    pillRing: 'rgba(217, 119, 6, 0.35)',
    Icon: Clock,
  },
  CLOSED: {
    label: 'Closed',
    accent: '#2ecc9a',
    headerBg: 'rgba(46, 204, 154, 0.1)',
    laneBg: 'rgba(46, 204, 154, 0.04)',
    pillBg: 'rgba(46, 204, 154, 0.14)',
    pillFg: '#15803d',
    pillRing: 'rgba(46, 204, 154, 0.35)',
    Icon: CheckCircle2,
  },
};

function LeadAvatar({name, accent}: {name: string; accent: string}) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white"
      style={{
        background: `linear-gradient(145deg, ${accent}cc 0%, ${accent} 100%)`,
        boxShadow: `0 2px 6px ${accent}44`,
      }}
      aria-hidden
    >
      {clientInitials(name)}
    </div>
  );
}

function StagePicker({
  leadId,
  current,
  openId,
  onOpen,
  onStageChange,
}: {
  leadId: string;
  current: LeadStage;
  openId: string | null;
  onOpen: (id: string | null) => void;
  onStageChange: (leadId: string, stage: LeadStage) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = STAGE_THEME[current];
  const Icon = theme.Icon;
  const isOpen = openId === leadId;

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => onOpen(isOpen ? null : leadId)}
        className="inline-flex w-full items-center justify-between gap-2 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] agent-dash-transition hover:brightness-95"
        style={{
          backgroundColor: theme.pillBg,
          color: theme.pillFg,
          boxShadow: `inset 0 0 0 1px ${theme.pillRing}`,
        }}
      >
        <span className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 shrink-0" strokeWidth={2.25} />
          {theme.label}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 agent-dash-transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <ul
          className="absolute bottom-full left-0 right-0 z-20 mb-1.5 overflow-hidden rounded-xl border border-[#E5E9EE] bg-white py-1 shadow-[0_8px_24px_rgba(30,45,61,0.12)]"
          role="listbox"
        >
          {STAGES.map((stage) => {
            const opt = STAGE_THEME[stage];
            const OptIcon = opt.Icon;
            const selected = stage === current;
            return (
              <li key={stage} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onStageChange(leadId, stage);
                    onOpen(null);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold agent-dash-transition hover:bg-[#F4F6F8] ${
                    selected ? 'text-[#1E2D3D]' : 'text-[#6B7C93]'
                  }`}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{backgroundColor: opt.pillBg, color: opt.pillFg}}
                  >
                    <OptIcon className="h-3 w-3" strokeWidth={2.25} />
                  </span>
                  {opt.label}
                  {selected ? (
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-[#5097A4]" strokeWidth={2.25} />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function LeadCard({
  lead,
  openPickerId,
  onOpenPicker,
  onStageChange,
}: {
  lead: Lead;
  openPickerId: string | null;
  onOpenPicker: (id: string | null) => void;
  onStageChange: (leadId: string, stage: LeadStage) => void;
}) {
  const theme = STAGE_THEME[lead.stage];

  return (
    <article
      className="agent-lead-card group rounded-xl border border-[#E5E9EE] bg-white agent-dash-transition"
      style={{borderLeftWidth: '3px', borderLeftColor: theme.accent}}
    >
      <div className="p-4">
        {/* Top: name + avatar */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 text-[15px] font-bold leading-snug tracking-tight text-[#1E2D3D] group-hover:text-[#3E8491]">
            {lead.name}
          </h3>
          <LeadAvatar name={lead.name} accent={theme.accent} />
        </div>

        {/* Middle: contact */}
        <div className="mt-3 space-y-1.5">
          <p className="flex items-center gap-2 truncate text-xs text-[#6B7C93]">
            <Mail className="h-3.5 w-3.5 shrink-0 text-[#6B7C93]/70" strokeWidth={2} />
            {lead.email}
          </p>
          <p className="flex items-center gap-2 truncate text-xs text-[#6B7C93]">
            <Phone className="h-3.5 w-3.5 shrink-0 text-[#6B7C93]/70" strokeWidth={2} />
            {lead.phone}
          </p>
        </div>

        {/* Note */}
        {lead.notes.trim() ? (
          <blockquote
            className="mt-3 border-l-2 pl-3 text-xs italic leading-relaxed text-[#6B7C93]"
            style={{borderColor: `${theme.accent}55`}}
          >
            {lead.notes}
          </blockquote>
        ) : null}

        {/* Stage picker */}
        <div className="mt-4 border-t border-[#EEF1F4] pt-3">
          <StagePicker
            leadId={lead.id}
            current={lead.stage}
            openId={openPickerId}
            onOpen={onOpenPicker}
            onStageChange={onStageChange}
          />
        </div>
      </div>
    </article>
  );
}

type Props = {
  leads: Lead[];
  onStageChange: (leadId: string, stage: LeadStage) => void;
  onAddLead?: () => void;
};

export function LeadsSection({leads, onStageChange, onAddLead}: Props) {
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = leads.length;
    const buckets = STAGES.reduce(
      (acc, stage) => {
        acc[stage] = leads.filter((l) => l.stage === stage).length;
        return acc;
      },
      {} as Record<LeadStage, number>,
    );
    const closed = buckets.CLOSED;
    const active = total - closed;
    const conversionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    return {total, buckets, closed, active, conversionRate};
  }, [leads]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mw-section-label text-[11px] text-[#6B7C93]">Lead pipeline</p>
          <p className="mt-1 text-sm text-[#6B7C93]">
            {stats.total} leads · {stats.active} active · {stats.closed} closed
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#E5E9EE] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7C93]">
          <TrendingUp className="h-3.5 w-3.5 text-[#5097A4]" strokeWidth={2} />
          {stats.conversionRate}% conversion
        </div>
      </div>

      {/* Pipeline distribution bar */}
      <div className="rounded-2xl border border-[#E5E9EE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="mw-section-label text-[10px] text-[#6B7C93]">Pipeline distribution</span>
          <span className="text-xs font-semibold tabular-nums text-[#1E2D3D]">{stats.total} total</span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-[#E5E9EE]">
          {STAGES.map((stage) => {
            const count = stats.buckets[stage];
            if (count === 0 || stats.total === 0) return null;
            const pct = (count / stats.total) * 100;
            return (
              <div
                key={stage}
                className="h-full agent-dash-transition"
                style={{width: `${pct}%`, backgroundColor: STAGE_THEME[stage].accent}}
                title={`${STAGE_THEME[stage].label}: ${count}`}
              />
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {STAGES.map((stage) => {
            const theme = STAGE_THEME[stage];
            return (
              <span key={stage} className="flex items-center gap-1.5 text-[10px] font-medium text-[#6B7C93]">
                <span className="h-2 w-2 rounded-full" style={{backgroundColor: theme.accent}} />
                {theme.label}
                <span className="font-bold tabular-nums text-[#1E2D3D]">{stats.buckets[stage]}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end">
        {onAddLead ? (
          <button
            type="button"
            onClick={onAddLead}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97]"
          >
            <Plus className="h-4 w-4" />
            Add lead
          </button>
        ) : null}
      </div>

      {/* Kanban board */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => {
          const theme = STAGE_THEME[stage];
          const Icon = theme.Icon;
          const columnLeads = leads.filter((l) => l.stage === stage);

          return (
            <div
              key={stage}
              className="agent-kanban-column flex min-h-[440px] flex-col overflow-hidden rounded-2xl border border-[#E5E9EE] bg-white"
            >
              {/* Column header */}
              <div
                className="flex items-center justify-between gap-2 border-b border-[#E5E9EE] px-4 py-3.5"
                style={{
                  backgroundColor: theme.headerBg,
                  borderTop: `3px solid ${theme.accent}`,
                }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{backgroundColor: `${theme.accent}22`, color: theme.accent}}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </span>
                  <span className="mw-section-label truncate text-[11px] font-bold text-[#1E2D3D]">
                    {theme.label}
                  </span>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-white"
                  style={{backgroundColor: theme.accent}}
                >
                  {columnLeads.length}
                </span>
              </div>

              {/* Swim lane */}
              <div
                className="flex flex-1 flex-col gap-3 overflow-y-auto p-3"
                style={{backgroundColor: theme.laneBg}}
              >
                {columnLeads.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E9EE]/80 bg-white/60 px-4 py-10 text-center">
                    <Icon className="mb-2 h-6 w-6 opacity-40" style={{color: theme.accent}} strokeWidth={1.75} />
                    <p className="text-xs font-medium text-[#6B7C93]">No leads in this stage</p>
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      openPickerId={openPickerId}
                      onOpenPicker={setOpenPickerId}
                      onStageChange={onStageChange}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
