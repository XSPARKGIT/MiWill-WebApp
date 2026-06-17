import {InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes} from 'react';

const fieldShell =
  'w-full rounded-2xl border border-[#5097A4]/60 bg-white font-medium text-slate-600 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#5097A4] focus:ring-4 focus:ring-[#5097A4]/10 disabled:cursor-not-allowed disabled:bg-slate-100';

function fieldSizeClasses(compact?: boolean) {
  return compact ? 'px-3 py-2.5 text-sm' : 'px-4 py-3.5 text-base';
}

export function AuthInput({
  label,
  error,
  trailing,
  className = '',
  optional,
  compact,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  trailing?: ReactNode;
  optional?: boolean;
  compact?: boolean;
}) {
  const sharedFieldClasses = `${fieldShell} ${fieldSizeClasses(compact)}`;
  const labelClass = compact ? 'text-xs font-semibold' : 'text-sm font-semibold';
  const errClass = compact ? 'text-xs font-medium' : 'text-sm font-medium';

  return (
    <label className="block">
      <span className={`mb-1.5 flex items-center gap-2 ${labelClass} text-slate-700`}>
        {label}
        {optional ? (
          <span
            className={`rounded-full bg-slate-100 px-1.5 py-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase tracking-wider text-slate-500`}
          >
            Optional
          </span>
        ) : null}
      </span>
      <div className="relative">
        <input
          {...props}
          className={`${sharedFieldClasses} ${trailing ? (compact ? 'pr-11' : 'pr-12') : ''} ${className}`.trim()}
        />
        {trailing ? (
          <div className={`absolute inset-y-0 ${compact ? 'right-2.5' : 'right-3'} flex items-center`}>
            {trailing}
          </div>
        ) : null}
      </div>
      {error ? <span className={`mt-1.5 block ${errClass} text-rose-600`}>{error}</span> : null}
    </label>
  );
}

export function AuthSelect({
  label,
  error,
  className = '',
  optional,
  compact,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  optional?: boolean;
  compact?: boolean;
  children: ReactNode;
}) {
  const sharedFieldClasses = `${fieldShell} ${fieldSizeClasses(compact)}`;
  const labelClass = compact ? 'text-xs font-semibold' : 'text-sm font-semibold';
  const errClass = compact ? 'text-xs font-medium' : 'text-sm font-medium';

  return (
    <label className="block">
      <span className={`mb-1.5 flex items-center gap-2 ${labelClass} text-slate-700`}>
        {label}
        {optional ? (
          <span
            className={`rounded-full bg-slate-100 px-1.5 py-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase tracking-wider text-slate-500`}
          >
            Optional
          </span>
        ) : null}
      </span>
      <select {...props} className={`${sharedFieldClasses} appearance-none ${className}`.trim()}>
        {children}
      </select>
      {error ? <span className={`mt-1.5 block ${errClass} text-rose-600`}>{error}</span> : null}
    </label>
  );
}

export function AuthTextarea({
  label,
  error,
  className = '',
  optional,
  compact,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  optional?: boolean;
  compact?: boolean;
}) {
  const sharedFieldClasses = `${fieldShell} ${fieldSizeClasses(compact)}`;
  const labelClass = compact ? 'text-xs font-semibold' : 'text-sm font-semibold';
  const errClass = compact ? 'text-xs font-medium' : 'text-sm font-medium';

  return (
    <label className="block">
      <span className={`mb-1.5 flex items-center gap-2 ${labelClass} text-slate-700`}>
        {label}
        {optional ? (
          <span
            className={`rounded-full bg-slate-100 px-1.5 py-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase tracking-wider text-slate-500`}
          >
            Optional
          </span>
        ) : null}
      </span>
      <textarea
        {...props}
        className={`${sharedFieldClasses} ${compact ? 'min-h-[88px]' : 'min-h-[100px]'} resize-y ${className}`.trim()}
      />
      {error ? <span className={`mt-1.5 block ${errClass} text-rose-600`}>{error}</span> : null}
    </label>
  );
}

export function AuthMessage({
  tone,
  children,
  compact,
}: {
  tone: 'error' | 'success';
  children: ReactNode;
  compact?: boolean;
}) {
  const box = compact ? 'rounded-xl border px-3 py-2.5 text-xs font-semibold' : 'rounded-2xl border px-4 py-3 text-sm font-semibold';

  return (
    <div
      className={`${box} ${
        tone === 'error'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      {children}
    </div>
  );
}
