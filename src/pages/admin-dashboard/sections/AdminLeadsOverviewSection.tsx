import {Mail, Phone, Plus} from 'lucide-react';
import {useMemo, useState} from 'react';
import {AddLeadModal} from '../../../components/portal/AddLeadModal';
import {usePortalToast} from '../../../components/portal/PortalToast';
import {useDashboardData} from '../../../context/DashboardDataContext';
import {useAgents} from '../../../hooks/useAgents';
import {clientInitials} from '../../agent-dashboard/components/clientUi';
import type {Lead, LeadStage} from '../../agent-dashboard/types';

const STAGES: LeadStage[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED'];

const STAGE_THEME: Record<
  LeadStage,
  {label: string; accent: string; headerBg: string; laneBg: string}
> = {
  NEW: {label: 'New', accent: '#5097A4', headerBg: 'rgba(80, 151, 164, 0.1)', laneBg: 'rgba(80, 151, 164, 0.04)'},
  CONTACTED: {label: 'Contacted', accent: '#4A8FAE', headerBg: 'rgba(74, 143, 174, 0.1)', laneBg: 'rgba(74, 143, 174, 0.04)'},
  IN_PROGRESS: {label: 'In progress', accent: '#D97706', headerBg: 'rgba(217, 119, 6, 0.1)', laneBg: 'rgba(217, 119, 6, 0.04)'},
  CLOSED: {label: 'Closed', accent: '#2ecc9a', headerBg: 'rgba(46, 204, 154, 0.1)', laneBg: 'rgba(46, 204, 154, 0.04)'},
};

type BrandFilter = 'all' | 'miwill' | 'capital';

function agentNameFromRecord(agent: Record<string, unknown>) {
  const firstName = String(agent.firstName ?? agent.first_name ?? '').trim();
  const lastName = String(agent.lastName ?? agent.last_name ?? '').trim();
  return [firstName, lastName].filter(Boolean).join(' ') || String(agent.name ?? 'Agent');
}

export function AdminLeadsOverviewSection() {
  const [brand, setBrand] = useState<BrandFilter>('all');
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const {leads: allLeads, appendLead} = useDashboardData();
  const {agents} = useAgents();
  const {showToast} = usePortalToast();

  const agentOptions = useMemo(
    () => agents.map((agent) => ({id: String(agent.id), name: agentNameFromRecord(agent)})),
    [agents],
  );

  const leads = useMemo(() => {
    if (brand === 'all') return allLeads;
    return allLeads.filter((l) => l.brand === brand);
  }, [allLeads, brand]);

  const byStage = useMemo(() => {
    const map: Record<LeadStage, Lead[]> = {NEW: [], CONTACTED: [], IN_PROGRESS: [], CLOSED: []};
    for (const lead of leads) {
      map[lead.stage as LeadStage].push(lead);
    }
    return map;
  }, [leads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            {key: 'all' as const, label: 'All leads'},
            {key: 'miwill' as const, label: 'MiWill'},
            {key: 'capital' as const, label: 'Capital Legacy'},
          ].map(({key, label}) => {
            const active = brand === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setBrand(key)}
                className="rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] agent-dash-transition"
                style={
                  active
                    ? {backgroundColor: 'rgba(80,151,164,0.14)', color: '#3E8491', boxShadow: 'inset 0 0 0 1px rgba(80,151,164,0.35)'}
                    : {backgroundColor: '#fff', color: '#6B7C93', boxShadow: 'inset 0 0 0 1px #E5E9EE'}
                }
              >
                {label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setAddLeadOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97]"
        >
          <Plus className="h-4 w-4" />
          Add lead
        </button>
      </div>

      {leads.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#E5E9EE] bg-white px-4 py-10 text-center text-sm text-[#6B7C93]">
          No leads found in Firestore.
        </p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-4">
          {STAGES.map((stage) => {
            const theme = STAGE_THEME[stage];
            const items = byStage[stage];
            return (
              <div key={stage} className="rounded-2xl border border-[#E5E9EE] bg-white">
                <div className="rounded-t-2xl px-4 py-3" style={{backgroundColor: theme.headerBg}}>
                  <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{color: theme.accent}}>
                    {theme.label} · {items.length}
                  </p>
                </div>
                <ul className="space-y-3 p-3" style={{backgroundColor: theme.laneBg}}>
                  {items.map((lead) => (
                    <li key={lead.id} className="rounded-xl border border-[#E5E9EE] bg-white p-4">
                      <div className="flex items-start gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`}}
                        >
                          {clientInitials(lead.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-[#1E2D3D]">{lead.name}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#6B7C93]">
                            <Mail className="h-3 w-3" />
                            {lead.email || '—'}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#6B7C93]">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </p>
                          {lead.notes ? (
                            <p className="mt-2 border-l-2 border-[#5097A4]/35 pl-2 text-xs italic text-[#6B7C93]">
                              {lead.notes}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <AddLeadModal
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        isAdmin
        agents={agentOptions}
        onSuccess={(lead) => {
          appendLead(lead);
          showToast('Lead added successfully');
        }}
      />
    </div>
  );
}
