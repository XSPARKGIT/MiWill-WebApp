import {Link} from 'react-router-dom';
import {
  BarChart3,
  KanbanSquare,
  LayoutDashboard,
  Settings,
  UserSearch,
  Users,
} from 'lucide-react';
import {ClientAvatar} from '../../agent-dashboard/components/clientUi';
import type {AdminSection} from '../types';

const NAV: {id: AdminSection; label: string; Icon: typeof LayoutDashboard}[] = [
  {id: 'overview', label: 'Overview', Icon: LayoutDashboard},
  {id: 'users', label: 'Clients', Icon: Users},
  {id: 'agents', label: 'Agents', Icon: UserSearch},
  {id: 'performance', label: 'Agent Performance', Icon: BarChart3},
  {id: 'leads', label: 'Leads Overview', Icon: KanbanSquare},
  {id: 'settings', label: 'Settings', Icon: Settings},
];

type Props = {
  active: AdminSection;
  adminName: string;
  adminInitials: string;
  onNavigate: (section: AdminSection) => void;
  onLogoHome: () => void;
};

export function AdminSidebar({active, adminName, adminInitials, onNavigate, onLogoHome}: Props) {
  return (
    <aside
      className="fixed bottom-0 left-0 top-0 z-30 flex w-[200px] shrink-0 flex-col border-r border-[#E5E9EE]"
      style={{backgroundColor: '#F4F6F8'}}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-[#E5E9EE] px-4">
        <button
          type="button"
          onClick={onLogoHome}
          className="agent-dash-transition flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#5097A4]/40"
          title="Overview home"
        >
          <img src="/assets/MainMiwillLogo.png" alt="MiWill" className="h-8 w-auto" />
          <span className="font-bold tracking-tight text-[#1E2D3D] text-lg">MiWill</span>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-5">
        {NAV.map(({id, label, Icon}) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => onNavigate(id)}
              className={`agent-dash-transition flex items-center gap-3 border-l-[3px] px-5 py-3 ${
                isActive
                  ? 'border-[#5097A4] bg-[rgba(80,151,164,0.08)] font-semibold text-[#5097A4]'
                  : 'border-transparent text-[#1E2D3D] hover:bg-[rgba(80,151,164,0.06)] hover:text-[#5097A4]'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              <span className="mw-section-label text-[11px]">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-[#E5E9EE] p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <ClientAvatar name={adminName} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#1E2D3D]">{adminName}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5097A4]">{adminInitials}</p>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="agent-dash-transition flex w-full items-center justify-center rounded-xl border border-[#E5E9EE] bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#5097A4] hover:bg-[rgba(80,151,164,0.06)]"
        >
          Back to agent view
        </Link>
      </div>
    </aside>
  );
}
