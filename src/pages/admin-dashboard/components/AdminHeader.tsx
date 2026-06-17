import {Bell, LogOut, UserCircle} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {AdminNotification, AdminSection} from '../types';

const TITLES: Record<AdminSection, {before: string; accent: string; after: string}> = {
  overview: {before: 'Admin ', accent: 'overview', after: ''},
  users: {before: '', accent: 'Clients', after: ''},
  agents: {before: 'Portal ', accent: 'agents', after: ''},
  performance: {before: 'Agent ', accent: 'performance', after: ''},
  leads: {before: 'Leads ', accent: 'overview', after: ''},
  settings: {before: '', accent: 'Settings', after: ''},
};

function formatShort(ts: string) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type Props = {
  section: AdminSection;
  notifications: AdminNotification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  adminName: string;
  adminInitials: string;
  adminPhotoUrl: string | null;
  onSignOut: () => void;
};

export function AdminHeader({
  section,
  notifications,
  onMarkAllRead,
  onMarkRead,
  adminName,
  adminInitials,
  adminPhotoUrl,
  onSignOut,
}: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const title = TITLES[section];
  const titleContent =
    section === 'overview' ? (
      <h1 className="mw-section-label truncate text-sm font-bold uppercase tracking-[0.28em] text-[#1E2D3D]">
        Overview —
      </h1>
    ) : (
      <h1 className="truncate text-lg font-bold tracking-tight text-[#1E2D3D] md:text-xl">
        {title.before}
        <span className="mw-accent-serif font-extrabold text-[#5097A4]">{title.accent}</span>
        {title.after}
      </h1>
    );

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#E5E9EE] bg-white px-4 md:px-8">
      <div className="min-w-0 flex-1">{titleContent}</div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="agent-dash-transition relative rounded-full p-2 text-[#1E2D3D] hover:bg-[#F4F6F8]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} />
            {unread > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#5097A4] px-1 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            ) : null}
          </button>
          {notifOpen ? (
            <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-[#E5E9EE] bg-white shadow-[0_12px_40px_rgba(30,45,61,0.12)]">
              <div className="flex items-center justify-between border-b border-[#E5E9EE] px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#6B7C93]">Notifications</span>
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5097A4] hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.slice(0, 6).map((n) => (
                  <li key={n.id} className="border-b border-[#E5E9EE] px-4 py-3 hover:bg-[#F4F6F8]/80">
                    <button type="button" className="w-full text-left" onClick={() => onMarkRead(n.id)}>
                      <p className={`text-sm font-semibold ${n.read ? 'text-[#6B7C93]' : 'text-[#1E2D3D]'}`}>{n.title}</p>
                      <p className="mt-0.5 text-xs text-[#6B7C93]">{n.body}</p>
                      <p className="mt-1 text-[10px] font-medium text-[#6B7C93]/75">{formatShort(n.createdAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="relative flex items-center gap-2" ref={accountRef}>
          <span className="hidden text-sm font-semibold text-[#1E2D3D] md:inline">{adminName}</span>
          <button
            type="button"
            onClick={() => setAccountOpen((v) => !v)}
            className="agent-dash-transition flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white ring-2 ring-[#E5E9EE] hover:ring-[#5097A4]/35"
            style={{backgroundColor: '#5097A4'}}
            aria-label="Account menu"
          >
            {adminPhotoUrl ? (
              <img src={adminPhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              adminInitials
            )}
          </button>
          {accountOpen ? (
            <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-[#E5E9EE] bg-white py-2 shadow-[0_12px_40px_rgba(30,45,61,0.12)]">
              <div className="border-b border-[#E5E9EE] px-4 py-3">
                <p className="truncate text-sm font-bold text-[#1E2D3D]">{adminName}</p>
                <span
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5097A4]"
                  style={{backgroundColor: 'rgba(80,151,164,0.12)'}}
                >
                  ADMIN
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  onSignOut();
                }}
                className="agent-dash-transition flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-[#1E2D3D] hover:bg-[#F4F6F8]"
              >
                <LogOut className="h-4 w-4 shrink-0 text-[#5097A4]" strokeWidth={1.75} />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
