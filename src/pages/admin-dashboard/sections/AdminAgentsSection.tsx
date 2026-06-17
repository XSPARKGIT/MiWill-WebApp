import {Search} from 'lucide-react';
import {useMemo, useState} from 'react';
import {useDashboardData} from '../../../context/DashboardDataContext';
import {ClientAvatar} from '../../agent-dashboard/components/clientUi';
import type {AdminAgentView} from '../components/AdminAgentDetailDrawer';

type Props = {
  onAgentClick: (agent: AdminAgentView) => void;
};

function StatusBadge({status}: {status: string}) {
  const active = status === 'active';
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ring-1"
      style={
        active
          ? {backgroundColor: 'rgba(46,204,154,0.14)', color: '#15803d', boxShadow: 'inset 0 0 0 1px rgba(46,204,154,0.35)'}
          : {backgroundColor: 'rgba(239,68,68,0.12)', color: '#b91c1c', boxShadow: 'inset 0 0 0 1px rgba(239,68,68,0.3)'}
      }
    >
      {status}
    </span>
  );
}

export function AdminAgentsSection({onAgentClick}: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const {agentViews, portalLoading, portalError} = useDashboardData();

  const filtered = useMemo(() => {
    return agentViews.filter((agent) => {
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || agent.name.toLowerCase().includes(q) || agent.email.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [agentViews, search, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#E5E9EE] bg-[rgba(80,151,164,0.08)] px-4 py-3 text-xs font-medium text-[#3E8491]">
        View all portal agents, their workload, and recent activity. Account changes are managed under Portal users.
      </div>

      {portalError ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          Could not load agents. Check your connection.
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7C93]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents…"
              className="w-full rounded-2xl border border-[#5097A4]/60 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-600 shadow-sm outline-none transition focus:border-[#5097A4] focus:ring-4 focus:ring-[#5097A4]/10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'disabled'] as const).map((key) => {
              const active = statusFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className="rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] agent-dash-transition"
                  style={
                    active
                      ? {backgroundColor: 'rgba(80,151,164,0.14)', color: '#3E8491', boxShadow: 'inset 0 0 0 1px rgba(80,151,164,0.35)'}
                      : {backgroundColor: '#fff', color: '#6B7C93', boxShadow: 'inset 0 0 0 1px #E5E9EE'}
                  }
                >
                  {key === 'all' ? 'All' : key}
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-xs font-semibold text-[#6B7C93]">
          {portalLoading ? 'Loading…' : `${filtered.length} agent${filtered.length === 1 ? '' : 's'}`}
        </p>
      </div>

      <div className="agent-users-grid-header hidden rounded-xl border border-[#E5E9EE] bg-[#F4F6F8]/80 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7C93] lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_90px_80px_80px_90px_minmax(0,0.9fr)] lg:items-center lg:gap-4">
        <span>Agent</span>
        <span>Email</span>
        <span>Status</span>
        <span>Clients</span>
        <span>Leads</span>
        <span>Wills</span>
        <span>Last active</span>
      </div>

      <ul className="space-y-3">
        {filtered.map((agent) => (
          <li key={agent.id}>
            <button
              type="button"
              onClick={() => onAgentClick(agent)}
              className="agent-user-row group w-full rounded-2xl border border-[#E5E9EE] bg-white px-4 py-4 text-left agent-dash-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5097A4]/40 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_90px_80px_80px_90px_minmax(0,0.9fr)] lg:items-center lg:gap-4 lg:px-5"
            >
              <div className="flex items-center gap-3">
                <ClientAvatar name={agent.name} size="sm" />
                <span className="font-bold text-[#1E2D3D] group-hover:text-[#5097A4]">{agent.name}</span>
              </div>
              <span className="truncate text-sm text-[#6B7C93]">{agent.email}</span>
              <StatusBadge status={agent.status} />
              <span className="text-sm font-semibold text-[#1E2D3D]">{agent.assignedClients}</span>
              <span className="text-sm font-semibold text-[#1E2D3D]">{agent.leadsHandled}</span>
              <span className="text-sm font-semibold text-[#1E2D3D]">{agent.willsInProgress}</span>
              <span className="text-sm text-[#6B7C93]">{agent.lastActive}</span>
            </button>
          </li>
        ))}
      </ul>

      {!portalLoading && filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#E5E9EE] bg-white px-4 py-10 text-center text-sm text-[#6B7C93]">
          No agents match your search.
        </p>
      ) : null}
    </div>
  );
}
