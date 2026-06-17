import {Bell, LogOut, UserCircle} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {DashboardSection, NotificationItem} from '../types';

const TITLES: Record<Exclude<DashboardSection, 'overview'>, {before: string; accent: string; after: string}> = {
  users: {before: 'Assigned ', accent: 'users', after: ''},
  leads: {before: 'Lead ', accent: 'pipeline', after: ''},
  engagement: {before: 'Engagement & ', accent: 'follow-up', after: ''},
  notes: {before: 'Notes & ', accent: 'activity', after: ''},
  notifications: {before: '', accent: 'Notifications', after: ''},
  admin: {before: 'Admin ', accent: 'panel', after: ''},
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
  section: DashboardSection;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  agentName: string;
  agentEmail: string;
  agentInitials: string;
  agentPhotoUrl: string | null;
  userRole: 'admin' | 'agent';
  onOpenProfile: () => void;
  onSignOut: () => void;
};

export function AgentHeader({
  section,
  notifications,
  onMarkAllRead,
  onMarkRead,
  agentName,
  agentEmail,
  agentInitials,
  agentPhotoUrl,
  userRole,
  onOpenProfile,
  onSignOut,
}: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function close(e: MouseEvent) {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
      if (accountRef.current && !accountRef.current.contains(t)) setAccountOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const titleContent =
    section === 'overview' ? (
      <h1 className="mw-section-label truncate text-lg font-bold tracking-[0.28em] text-[#1E2D3D] md:text-xl">
        OVERVIEW —
      </h1>
    ) : (
      (() => {
        const t = TITLES[section as Exclude<DashboardSection, 'overview'>];
        return (
          <h1 className="mw-heading-display truncate text-lg font-extrabold tracking-tight text-[#1E2D3D] md:text-xl">
            {t.before}
            <span className="mw-accent-serif font-extrabold text-[#5097A4]">{t.accent}</span>
            {t.after}
          </h1>
        );
      })()
    );

  function openProfileFromMenu() {
    setAccountOpen(false);
    onOpenProfile();
  }

  function signOutFromMenu() {
    setAccountOpen(false);
    void onSignOut();
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#E5E9EE] bg-white px-4 md:px-8">
      <div className="min-w-0 flex-1">{titleContent}</div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setAccountOpen(false);
            }}
            className="agent-dash-transition relative rounded-full p-2 text-[#1E2D3D] hover:bg-[#F4F6F8]"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6" strokeWidth={1.75} />
            {unread > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#5097A4] px-1 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            ) : null}
          </button>

          {notifOpen ? (
            <div className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,360px)] overflow-hidden rounded-2xl border border-[#E5E9EE] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between border-b border-[#E5E9EE] px-4 py-3">
                <span className="mw-section-label text-[11px] text-[#6B7C93]">Alerts</span>
                <button
                  type="button"
                  onClick={() => {
                    onMarkAllRead();
                  }}
                  className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5097A4] hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.slice(0, 6).map((n) => (
                  <li key={n.id} className="border-b border-[#E5E9EE] px-4 py-3 hover:bg-[#F4F6F8]/80">
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        onMarkRead(n.id);
                      }}
                    >
                      <p className={`text-sm font-semibold ${n.read ? 'text-[#6B7C93]' : 'text-[#1E2D3D]'}`}>{n.title}</p>
                      <p className="mt-0.5 text-xs text-[#6B7C93]">{n.body}</p>
                      <p className="mt-1 text-[10px] text-[#6B7C93]/80">{formatShort(n.createdAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="relative" ref={accountRef}>
          <button
            type="button"
            onClick={() => {
              setAccountOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="agent-dash-transition flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white ring-2 ring-[#E5E9EE] hover:ring-[#5097A4]/35"
            style={{backgroundColor: '#5097A4'}}
            aria-expanded={accountOpen}
            aria-haspopup="true"
            aria-label="Account menu"
          >
            {agentPhotoUrl ? (
              <img src={agentPhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              agentInitials
            )}
          </button>

          {accountOpen ? (
            <div className="absolute right-0 top-full mt-2 w-[min(calc(100vw-2rem),280px)] overflow-hidden rounded-2xl border border-[#E5E9EE] bg-white py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <div className="border-b border-[#E5E9EE] px-4 pb-3">
                <p className="truncate text-sm font-semibold text-[#1E2D3D]">{agentName}</p>
                <p className="mt-0.5 truncate text-xs text-[#6B7C93]">{agentEmail}</p>
                <div
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5097A4]"
                  style={{backgroundColor: 'rgba(80,151,164,0.12)'}}
                >
                  <span className="text-[8px] leading-none text-[#5097A4]" aria-hidden>
                    ●
                  </span>
                  {userRole === 'admin' ? 'ADMIN' : 'AGENT'}
                </div>
              </div>
              <div className="py-1 pt-2">
                <button
                  type="button"
                  onClick={openProfileFromMenu}
                  className="agent-dash-transition flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-[#1E2D3D] hover:bg-[#F4F6F8]"
                >
                  <UserCircle className="h-4 w-4 shrink-0 text-[#5097A4]" strokeWidth={1.75} />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={signOutFromMenu}
                  className="agent-dash-transition flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-[#1E2D3D] hover:bg-[#F4F6F8]"
                >
                  <LogOut className="h-4 w-4 shrink-0 text-[#6B7C93]" strokeWidth={1.75} />
                  Sign out
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
