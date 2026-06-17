import {ChevronRight, Mail, Phone, Users} from 'lucide-react';
import {useDashboardData} from '../../../context/DashboardDataContext';
import {
  ClientAvatar,
  ProfileProgressBar,
  WillStatusBadge,
  formatShortDate,
} from '../components/clientUi';
import {UserListSkeleton} from '../components/UserListSkeleton';
import type {AssignedUser} from '../types';

type Props = {
  users?: AssignedUser[];
  onRowClick: (user: AssignedUser) => void;
};

function ClientsLoadError() {
  return (
    <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
      Could not load clients. Check your connection.
    </p>
  );
}

export function UsersSection({users: externalUsers, onRowClick}: Props) {
  const dashboard = useDashboardData();
  const fetchFromFirestore = externalUsers === undefined;
  const users = externalUsers ?? dashboard.assignedUsers;
  const loading = fetchFromFirestore ? dashboard.clientsLoading : false;
  const error = fetchFromFirestore ? dashboard.clientsError : null;

  const completeCount = users.filter((u) => u.willStatus === 'complete').length;
  const needsAttention = users.filter((u) => u.completeness < 60).length;

  if (fetchFromFirestore && loading) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mw-section-label text-[11px] text-[#6B7C93]">Assigned clients</p>
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

  if (fetchFromFirestore && error) {
    return (
      <div className="space-y-5">
        <div>
          <p className="mw-section-label text-[11px] text-[#6B7C93]">Assigned clients</p>
        </div>
        <ClientsLoadError />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mw-section-label text-[11px] text-[#6B7C93]">Assigned clients</p>
          <p className="mt-1 text-sm text-[#6B7C93]">
            {users.length} clients · {completeCount} complete
            {needsAttention > 0 ? (
              <span className="ml-1 font-semibold text-amber-700">· {needsAttention} need follow-up</span>
            ) : null}
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-[#E5E9EE] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7C93] sm:flex">
          <Users className="h-3.5 w-3.5 text-[#5097A4]" strokeWidth={2} />
          Tap a row for client details
        </div>
      </div>

      {/* Column headers — desktop only */}
      <div className="agent-users-grid-header hidden rounded-xl border border-[#E5E9EE] bg-[#F4F6F8]/80 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7C93] lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_28px] lg:items-center lg:gap-4">
        <span>Client</span>
        <span>Contact</span>
        <span>Will status</span>
        <span>Profile</span>
        <span aria-hidden />
      </div>

      <ul className="space-y-2.5">
        {users.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => onRowClick(u)}
              className="agent-user-row group w-full rounded-2xl border border-[#E5E9EE] bg-white text-left agent-dash-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5097A4]/40"
            >
              <div className="flex flex-col gap-4 p-4 sm:p-5 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_28px] lg:items-center lg:gap-4">
                {/* Client identity */}
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

                {/* Contact */}
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

                {/* Status */}
                <div className="pl-[3.25rem] lg:pl-0">
                  <WillStatusBadge status={u.willStatus} />
                </div>

                {/* Progress */}
                <div className="pl-[3.25rem] lg:pl-0">
                  <ProfileProgressBar pct={u.completeness} />
                </div>

                {/* Chevron */}
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
