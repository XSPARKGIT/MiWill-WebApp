import {FormEvent, useState} from 'react';
import {X} from 'lucide-react';

export type NewClientInput = {
  name: string;
  email: string;
  phone: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewClientInput) => void;
};

export function AdminCreateClientModal({open, onClose, onCreate}: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  function reset() {
    setName('');
    setEmail('');
    setPhone('');
    setError('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Name, email, and phone are required.');
      return;
    }
    onCreate({name: name.trim(), email: email.trim(), phone: phone.trim()});
    reset();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div
        className="agent-client-drawer w-full max-w-md rounded-2xl border border-[#E5E9EE] bg-white p-6 shadow-[0_12px_40px_rgba(30,45,61,0.12)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-client-title"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="mw-section-label text-[10px] text-[#6B7C93]">MiWill client</p>
            <h2 id="create-client-title" className="text-lg font-bold text-[#1E2D3D]">
              Add new client
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-[#6B7C93] agent-dash-transition hover:bg-[#F4F6F8] hover:text-[#1E2D3D]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {error}
            </p>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Thabo Mokoena"
              className="w-full rounded-2xl border border-[#5097A4]/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm outline-none transition focus:border-[#5097A4] focus:ring-4 focus:ring-[#5097A4]/10"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@email.com"
              className="w-full rounded-2xl border border-[#5097A4]/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm outline-none transition focus:border-[#5097A4] focus:ring-4 focus:ring-[#5097A4]/10"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+27 82 000 0000"
              className="w-full rounded-2xl border border-[#5097A4]/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm outline-none transition focus:border-[#5097A4] focus:ring-4 focus:ring-[#5097A4]/10"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-2xl border border-[#E5E9EE] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#6B7C93] agent-dash-transition hover:bg-[#F4F6F8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-[#5097A4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97]"
            >
              Add client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
