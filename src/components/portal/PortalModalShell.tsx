import {ReactNode} from 'react';
import {X} from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidthClass?: string;
};

export function PortalModalShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = 'max-w-[480px]',
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`agent-client-drawer w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto rounded-2xl border border-[#E5E9EE] bg-white p-6 shadow-[0_12px_40px_rgba(30,45,61,0.12)]`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {subtitle ? <p className="mw-section-label text-[10px] text-[#6B7C93]">{subtitle}</p> : null}
            <h2 className="text-lg font-bold text-[#1E2D3D]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#6B7C93] agent-dash-transition hover:bg-[#F4F6F8] hover:text-[#1E2D3D]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
