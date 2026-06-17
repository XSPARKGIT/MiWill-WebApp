import {LoaderCircle} from 'lucide-react';

export function AuthSubmitButton({
  children,
  disabled,
  loading,
  compact,
}: {
  children: string;
  disabled: boolean;
  loading: boolean;
  compact?: boolean;
}) {
  const btnCls = compact
    ? 'gap-1.5 px-3 py-2.5 text-xs font-black uppercase tracking-[0.2em]'
    : 'gap-2 px-4 py-3.5 text-sm font-black uppercase tracking-[0.28em]';

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`flex w-full items-center justify-center rounded-2xl bg-[#5097A4] text-white transition hover:bg-[#458A97] disabled:cursor-not-allowed disabled:bg-[#5097A4]/45 ${btnCls}`}
    >
      {loading ? <LoaderCircle className={compact ? 'h-3.5 w-3.5 animate-spin' : 'h-4 w-4 animate-spin'} /> : null}
      <span>{loading ? 'Please wait' : children}</span>
    </button>
  );
}
