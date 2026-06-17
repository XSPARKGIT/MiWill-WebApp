import type {NotificationItem} from '../types';

const cardShadow = {boxShadow: '0 2px 8px rgba(0,0,0,0.06)'};

function formatTime(ts: string) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type Props = {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

export function NotificationsSection({notifications, onMarkRead, onMarkAllRead}: Props) {
  const sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="mw-section-label text-[11px] text-[#6B7C93]">Notifications</p>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="rounded-full border border-[#E5E9EE] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#1E2D3D] agent-dash-transition hover:bg-[#F4F6F8]"
        >
          Mark all read
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E9EE] bg-white" style={cardShadow}>
        <ul>
          {sorted.map((n) => (
            <li
              key={n.id}
              className="flex gap-4 border-b border-[#E5E9EE] px-5 py-4 md:px-6 agent-dash-transition hover:bg-[#F4F6F8]/80"
            >
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? 'bg-[#6B7C93]/40' : ''}`}
                style={{backgroundColor: n.read ? undefined : '#5097A4'}}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`text-sm font-semibold ${n.read ? 'text-[#6B7C93]' : 'text-[#1E2D3D]'}`}>{n.title}</p>
                  <span className="rounded-full bg-[rgba(80,151,164,0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#5097A4]">
                    {n.scope}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#6B7C93]">{n.body}</p>
                <p className="mt-2 text-xs text-[#6B7C93]/80">{formatTime(n.createdAt)}</p>
                {!n.read ? (
                  <button
                    type="button"
                    onClick={() => onMarkRead(n.id)}
                    className="mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#5097A4] hover:underline"
                  >
                    Mark as read
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-[#6B7C93]">Scoped to your assigned users and leads only.</p>
    </div>
  );
}
