import {Mail, Phone} from 'lucide-react';
import type {ActivityEntry, AssignedUser} from '../types';

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
  users: AssignedUser[];
  activities: ActivityEntry[];
  onLogInteraction: (userId: string, type: 'call' | 'email') => void;
};

export function EngagementSection({users, activities, onLogInteraction}: Props) {
  return (
    <div className="space-y-6">
      <p className="mw-section-label text-[11px] text-[#6B7C93]">User engagement & follow-up</p>

      <div className="space-y-4">
        {users.map((u) => {
          const log = activities.filter((a) => a.userId === u.id).slice(0, 4);
          const warn = u.completeness < 60;

          return (
            <div key={u.id} className="rounded-2xl border border-[#E5E9EE] bg-white p-5 md:p-6" style={cardShadow}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="mw-heading-display text-lg font-extrabold text-[#1E2D3D]">{u.name}</h3>
                  <p className="mt-1 text-sm text-[#1E2D3D]/90">{u.email}</p>
                  <p className="text-sm text-[#6B7C93]">{u.phone}</p>
                  {warn ? (
                    <p className="mt-3 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-800">
                      Incomplete profile — prioritize follow-up ({u.completeness}%)
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onLogInteraction(u.id, 'call')}
                    className="agent-dash-transition inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white"
                    style={{backgroundColor: '#5097A4'}}
                  >
                    <Phone className="h-4 w-4" />
                    Log call
                  </button>
                  <a
                    href={`mailto:${encodeURIComponent(u.email)}`}
                    onClick={() => onLogInteraction(u.id, 'email')}
                    className="agent-dash-transition inline-flex items-center gap-2 rounded-full border border-[#E5E9EE] bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#1E2D3D] hover:bg-[#F4F6F8]"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                </div>
              </div>

              <div className="mt-6 border-t border-[#E5E9EE] pt-4">
                <p className="mw-section-label mb-3 text-[11px] text-[#6B7C93]">Interaction log</p>
                {log.length === 0 ? (
                  <p className="text-sm text-[#6B7C93]">No touchpoints logged yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {log.map((a) => (
                      <li key={a.id} className="flex gap-2 text-sm text-[#1E2D3D]">
                        <span className="font-semibold capitalize">{a.type}</span>
                        <span className="text-[#6B7C93]">·</span>
                        <span>{a.summary}</span>
                        <span className="ml-auto text-xs text-[#6B7C93]/90">{formatTime(a.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
