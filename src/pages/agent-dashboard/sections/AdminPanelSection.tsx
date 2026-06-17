import {Link} from 'react-router-dom';
import {ShieldCheck, UserRoundPlus} from 'lucide-react';

const cardShadow = {boxShadow: '0 2px 8px rgba(0,0,0,0.04)'};

export function AdminPanelSection() {
  return (
    <div className="space-y-5">
      <p className="mw-section-label text-[11px] text-[#6B7C93]">Admin panel</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[12px] border border-[#E5E9EE] bg-white p-5 md:p-6" style={cardShadow}>
          <div
            className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
            style={{backgroundColor: 'rgba(29,158,117,0.12)', color: '#1D9E75'}}
          >
            <UserRoundPlus className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-bold text-[#1E2D3D]">Create new account</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#6B7C93]">
            Add a new admin or agent without interrupting your signed-in session.
          </p>
          <Link
            to="/signup"
            className="mt-4 inline-flex rounded-[12px] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:brightness-95"
            style={{backgroundColor: '#1D9E75'}}
          >
            Open sign up
          </Link>
        </div>

        <div className="rounded-[12px] border border-[#E5E9EE] bg-white p-5 md:p-6" style={cardShadow}>
          <div
            className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
            style={{backgroundColor: 'rgba(29,158,117,0.12)', color: '#1D9E75'}}
          >
            <ShieldCheck className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-bold text-[#1E2D3D]">Portal access</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#6B7C93]">
            Admins have full dashboard access including engagement, notifications, and this panel.
            Agents see a limited set of pages.
          </p>
        </div>
      </div>
    </div>
  );
}
