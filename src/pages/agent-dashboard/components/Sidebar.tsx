import {Link} from 'react-router-dom';
import {
  Bell,
  KanbanSquare,
  LayoutDashboard,
  MessageCircle,
  Shield,
  ShieldCheck,
  StickyNote,
  Users,
} from 'lucide-react';
import type {UserRole} from '../../../auth/AuthContext';
import type {DashboardSection} from '../types';

const ALL_NAV: {id: DashboardSection; label: string; Icon: typeof LayoutDashboard}[] = [
  {id: 'overview', label: 'Overview', Icon: LayoutDashboard},
  {id: 'users', label: 'My Users', Icon: Users},
  {id: 'leads', label: 'Leads', Icon: KanbanSquare},
  {id: 'engagement', label: 'Engagement', Icon: MessageCircle},
  {id: 'notes', label: 'Notes', Icon: StickyNote},
  {id: 'notifications', label: 'Notifications', Icon: Bell},
  {id: 'admin', label: 'Admin Panel', Icon: ShieldCheck},
];

export function sectionsForRole(role: UserRole): DashboardSection[] {
  if (role === 'admin') {
    return ALL_NAV.map(({id}) => id);
  }
  return ALL_NAV.filter(({id}) => id !== 'admin').map(({id}) => id);
}

type Props = {
  active: DashboardSection;
  role: UserRole;
  onNavigate: (s: DashboardSection) => void;
  onLogoHome: () => void;
};

export function AgentSidebar({active, role, onNavigate, onLogoHome}: Props) {
  const nav = role === 'admin' ? ALL_NAV : ALL_NAV.filter(({id}) => id !== 'admin');

  return (
    <aside
      className="fixed bottom-0 left-0 top-0 z-30 flex w-16 shrink-0 flex-col border-r border-[#E5E9EE] md:w-[240px]"
      style={{backgroundColor: '#F4F6F8'}}
    >
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-[#E5E9EE] px-2 md:justify-start md:gap-2 md:px-4">
        <button
          type="button"
          onClick={onLogoHome}
          className="agent-dash-transition flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#5097A4]/40 md:gap-2.5"
          title="Overview home"
        >
          <img src="/assets/MainMiwillLogo.png" alt="MiWill" className="hidden h-8 w-auto md:block" />
          <span className="hidden font-bold tracking-tight text-[#1E2D3D] md:inline md:text-lg">MiWill</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E2D3D] md:hidden">MW</span>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-3 md:py-5">
        {nav.map(({id, label, Icon}) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => onNavigate(id)}
              className={`agent-dash-transition flex items-center justify-center gap-3 border-l-[3px] px-2 py-3 md:justify-start md:px-5 ${
                isActive
                  ? 'border-[#5097A4] bg-[rgba(80,151,164,0.08)] font-semibold text-[#5097A4]'
                  : 'border-transparent text-[#1E2D3D] hover:bg-[rgba(80,151,164,0.06)] hover:text-[#5097A4]'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              <span className="mw-section-label hidden text-[11px] md:inline">{label}</span>
            </button>
          );
        })}
      </nav>

      {role === 'admin' ? (
        <div className="shrink-0 border-t border-[#E5E9EE] p-3 md:p-4">
          <Link
            to="/admin-dashboard"
            className="agent-dash-transition flex items-center justify-center gap-3 rounded-lg border border-[#E5E9EE] bg-white px-2 py-2.5 text-[#1E2D3D] hover:border-[#5097A4]/35 hover:text-[#5097A4] md:justify-start md:px-3"
          >
            <Shield className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <span className="mw-section-label hidden text-[11px] md:inline">Admin Dashboard</span>
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
