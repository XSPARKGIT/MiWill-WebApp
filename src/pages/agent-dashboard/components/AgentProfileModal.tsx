import {Camera} from 'lucide-react';
import {useEffect, useId, useRef} from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  fullName: string;
  email: string;
  phone?: string | null;
  initials: string;
  photoUrl: string | null;
  onPhotoSelected: (dataUrl: string) => void;
};

export function AgentProfileModal({
  open,
  onClose,
  fullName,
  email,
  phone,
  initials,
  photoUrl,
  onPhotoSelected,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') onPhotoSelected(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[80] bg-black/35 backdrop-blur-[2px] agent-dash-transition"
        aria-label="Close profile"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${inputId}-profile-title`}
        className="fixed left-1/2 top-1/2 z-[90] w-[min(100vw-2rem,400px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        style={{borderColor: '#E5E9EE', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'}}
      >
        <h2 id={`${inputId}-profile-title`} className="text-lg font-bold tracking-tight text-[#1E2D3D]">
          Profile
        </h2>

        <div className="mt-6 flex flex-col items-center">
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-xl font-bold text-white"
            style={{borderColor: '#5097A4', backgroundColor: '#5097A4'}}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>

          <input ref={inputRef} id={inputId} type="file" accept="image/*" className="sr-only" onChange={onFileChange} />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="agent-dash-transition mt-4 inline-flex items-center gap-2 rounded-full border border-[#5097A4]/35 bg-[rgba(80,151,164,0.08)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#5097A4] hover:bg-[rgba(80,151,164,0.14)]"
          >
            <Camera className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            UPLOAD PHOTO
          </button>
        </div>

        <dl className="mt-8 space-y-4 text-sm">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7C93]">Full name</dt>
            <dd className="mt-1 font-semibold text-[#1E2D3D]">{fullName}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7C93]">Email</dt>
            <dd className="mt-1 text-[#1E2D3D]">{email}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7C93]">Role</dt>
            <dd className="mt-1 text-[#1E2D3D]">Agent</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7C93]">Phone</dt>
            <dd className="mt-1 text-[#1E2D3D]">{phone?.trim() ? phone : '—'}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onClose}
          className="agent-dash-transition mt-8 w-full rounded-xl border border-[#E5E9EE] py-3 text-sm font-semibold text-[#1E2D3D] hover:bg-[#F4F6F8]"
        >
          Close
        </button>
      </div>
    </>
  );
}
