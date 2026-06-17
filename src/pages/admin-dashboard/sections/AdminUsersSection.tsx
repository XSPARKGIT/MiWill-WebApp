import {ChevronRight, Mail, Phone, Plus, Search, UserPlus, Users} from 'lucide-react';
import {useMemo, useState} from 'react';
import {useDashboardData} from '../../../context/DashboardDataContext';
import {
  ClientAvatar,
  ProfileProgressBar,
  WillStatusBadge,
  formatShortDate,
} from '../../agent-dashboard/components/clientUi';
import {UserListSkeleton} from '../../agent-dashboard/components/UserListSkeleton';
import type {AssignedUser} from '../../agent-dashboard/types';

type PortalUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  lastActive: string;
};

type UsersTab = 'portal' | 'registered';

type Props = {
  activeTab: UsersTab;
  onTabChange: (tab: UsersTab) => void;
  portalUsers: PortalUser[];
  onCreateUser: () => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onClientClick: (user: AssignedUser) => void;
  onCreateAgent?: () => void;
  onAddClient?: () => void;
};

function RoleBadge({role}: {role: string}) {
  const isAdmin = role === 'admin';
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ring-1"
      style={
        isAdmin
          ? {backgroundColor: 'rgba(80,151,164,0.16)', color: '#3E8491', boxShadow: 'inset 0 0 0 1px rgba(80,151,164,0.4)'}
          : {backgroundColor: 'rgba(74,143,174,0.14)', color: '#1e4d63', boxShadow: 'inset 0 0 0 1px rgba(74,143,174,0.35)'}
      }
    >
      {role}
    </span>
  );
}

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

function ClientsTabContent({
  onClientClick,
  onCreateAgent,
  onAddClient,
}: {
  onClientClick: (user: AssignedUser) => void;
  onCreateAgent?: () => void;
  onAddClient?: () => void;
}) {
  const {assignedUsers, clientsLoading: loading, clientsError: error} = useDashboardData();
  const [search, setSearch] = useState('');

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assignedUsers;
    return assignedUsers.filter(
      (user) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q),
    );
  }, [assignedUsers, search]);

  const completeCount = filteredClients.filter((u) => u.willStatus === 'complete').length;
  const needsAttention = filteredClients.filter((u) => u.completeness < 60).length;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mw-section-label text-[11px] text-[#6B7C93]">Clients</p>
            <div className="mt-2 h-4 w-40 animate-pulse rounded-full bg-[#EEF1F4]" />
          </div>
        </div>
        <div className="agent-users-grid-header hidden rounded-xl border border-[#E5E9EE] bg-[#F4F6F8]/80 px-5 py-3 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_28px] lg:items-center lg:gap-4">
          <span className="h-3 w-12 animate-pulse rounded-full bg-[#E5E9EE]" />
          <span className="h-3 w-14 animate-pulse rounded-full bg-[#E5E9EE]" />
          <span className="h-3 w-16 animate-pulse rounded-full bg-[#E5E9EE]" />
          <span className="h-3 w-12 animate-pulse rounded-full bg-[#E5E9EE]" />
          <span aria-hidden />
        </div>
        <UserListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div>
          <p className="mw-section-label text-[11px] text-[#6B7C93]">Clients</p>
        </div>
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          Could not load clients. Check your Firestore connection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#E5E9EE] bg-[rgba(80,151,164,0.08)] px-4 py-3 text-xs font-medium text-[#3E8491]">
        Read-only view — client wills and profile details cannot be edited from the admin dashboard.
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7C93]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full rounded-2xl border border-[#5097A4]/60 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-600 shadow-sm outline-none transition focus:border-[#5097A4] focus:ring-4 focus:ring-[#5097A4]/10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onCreateAgent ? (
            <button
              type="button"
              onClick={onCreateAgent}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97]"
            >
              <UserPlus className="h-4 w-4" />
              Create agent
            </button>
          ) : null}
          {onAddClient ? (
            <button
              type="button"
              onClick={onAddClient}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#5097A4]/60 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-[#5097A4] transition hover:bg-[rgba(80,151,164,0.08)]"
            >
              <Plus className="h-4 w-4" />
              Add client
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mw-section-label text-[11px] text-[#6B7C93]">Clients</p>
          <p className="mt-1 text-sm text-[#6B7C93]">
            {filteredClients.length} clients · {completeCount} complete
            {needsAttention > 0 ? (
              <span className="ml-1 font-semibold text-amber-700">· {needsAttention} need follow-up</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="agent-users-grid-header hidden rounded-xl border border-[#E5E9EE] bg-[#F4F6F8]/80 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7C93] lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_28px] lg:items-center lg:gap-4">
        <span>Client</span>
        <span>Contact</span>
        <span>Will status</span>
        <span>Profile</span>
        <span aria-hidden />
      </div>

      <ul className="space-y-2.5">
        {filteredClients.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => onClientClick(u)}
              className="agent-user-row group w-full rounded-2xl border border-[#E5E9EE] bg-white text-left agent-dash-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5097A4]/40"
            >
              <div className="flex flex-col gap-4 p-4 sm:p-5 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_28px] lg:items-center lg:gap-4">
                <div className="flex min-w-0 items-center gap-3.5">
                  <ClientAvatar name={u.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold tracking-tight text-[#1E2D3D] group-hover:text-[#3E8491]">
                      {u.name}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-[#6B7C93]/90">
                      Updated {formatShortDate(u.lastUpdated)}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 pl-[3.25rem] lg:pl-0">
                  <p className="flex items-center gap-1.5 truncate text-xs text-[#1E2D3D]/90">
                    <Mail className="h-3 w-3 shrink-0 text-[#6B7C93]" strokeWidth={2} />
                    {u.email}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#6B7C93]">
                    <Phone className="h-3 w-3 shrink-0 text-[#6B7C93]/70" strokeWidth={2} />
                    {u.phone}
                  </p>
                </div>

                <div className="pl-[3.25rem] lg:pl-0">
                  <WillStatusBadge status={u.willStatus} />
                </div>

                <div className="pl-[3.25rem] lg:pl-0">
                  <ProfileProgressBar pct={u.completeness} />
                </div>

                <div className="hidden justify-end lg:flex">
                  <ChevronRight
                    className="h-5 w-5 text-[#6B7C93]/50 agent-dash-transition group-hover:translate-x-0.5 group-hover:text-[#5097A4]"
                    strokeWidth={2}
                  />
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-[#6B7C93] lg:hidden">Tap a client card to open client details.</p>
    </div>
  );
}

export function AdminUsersSection({
  activeTab,
  onTabChange,
  portalUsers,
  onCreateUser,
  onToggleStatus,
  onDelete,
  onClientClick,
  onCreateAgent,
  onAddClient,
}: Props) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'agent'>('all');

  const filteredPortal = useMemo(() => {
    return portalUsers.filter((u) => {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [portalUsers, search, roleFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {[
          {key: 'portal' as const, label: 'Portal staff'},
          {key: 'registered' as const, label: 'Clients'},
        ].map(({key, label}) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
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

      {activeTab === 'registered' ? (
        <ClientsTabContent
          onClientClick={onClientClick}
          onCreateAgent={onCreateAgent}
          onAddClient={onAddClient}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1 max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7C93]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search portal users…"
                  className="w-full rounded-2xl border border-[#5097A4]/60 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-600 shadow-sm outline-none transition focus:border-[#5097A4] focus:ring-4 focus:ring-[#5097A4]/10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'admin', 'agent'] as const).map((key) => {
                  const active = roleFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRoleFilter(key)}
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
            <button
              type="button"
              onClick={onCreateUser}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97]"
            >
              <UserPlus className="h-4 w-4" />
              Create new user
            </button>
          </div>

          <div className="agent-users-grid-header hidden rounded-xl border border-[#E5E9EE] bg-[#F4F6F8]/80 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7C93] lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_100px_100px_minmax(0,0.9fr)_minmax(0,1fr)] lg:items-center lg:gap-4">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Date created</span>
            <span>Actions</span>
          </div>

          <ul className="space-y-3">
            {filteredPortal.map((user) => (
              <li
                key={user.id}
                className="agent-user-row rounded-2xl border border-[#E5E9EE] bg-white px-4 py-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_100px_100px_minmax(0,0.9fr)_minmax(0,1fr)] lg:items-center lg:gap-4 lg:px-5"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#1E2D3D]">{user.name}</span>
                </div>
                <span className="truncate text-sm text-[#6B7C93]">{user.email}</span>
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
                <span className="text-sm text-[#6B7C93]">{user.joined}</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(user.id)}
                    className="rounded-full border border-[#E5E9EE] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#1E2D3D] agent-dash-transition hover:bg-[#F4F6F8]"
                  >
                    {user.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(user.id)}
                    className="rounded-full border border-[#E5E9EE] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-rose-700 agent-dash-transition hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
