import {InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes} from 'react';

export const portalFieldClass =
  'w-full rounded-2xl border border-[#5097A4]/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm outline-none transition focus:border-[#5097A4] focus:ring-4 focus:ring-[#5097A4]/10 disabled:cursor-not-allowed disabled:opacity-60';

export function RequiredMark() {
  return <span className="text-rose-600">*</span>;
}

export function PortalFieldLabel({
  children,
  required,
  optional,
}: {
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700">
      {children}
      {required ? <RequiredMark /> : null}
      {optional ? (
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
          Optional
        </span>
      ) : null}
    </span>
  );
}

export function PortalInput({
  label,
  error,
  required,
  optional,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <PortalFieldLabel required={required} optional={optional}>
        {label}
      </PortalFieldLabel>
      <input {...props} className={`${portalFieldClass} ${className}`.trim()} />
      {error ? <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

export function PortalSelect({
  label,
  error,
  required,
  optional,
  children,
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <PortalFieldLabel required={required} optional={optional}>
        {label}
      </PortalFieldLabel>
      <select {...props} className={`${portalFieldClass} ${className}`.trim()}>
        {children}
      </select>
      {error ? <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

export function PortalTextarea({
  label,
  error,
  required,
  optional,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <PortalFieldLabel required={required} optional={optional}>
        {label}
      </PortalFieldLabel>
      <textarea {...props} className={`${portalFieldClass} min-h-[96px] resize-y ${className}`.trim()} />
      {error ? <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

type PillOption<T extends string> = {value: T; label: string};

export function PortalPillSelector<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
  required,
}: {
  label: string;
  value: T;
  options: PillOption<T>[];
  onChange: (value: T) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <PortalFieldLabel required={required}>{label}</PortalFieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] agent-dash-transition"
              style={
                active
                  ? {
                      backgroundColor: 'rgba(80,151,164,0.14)',
                      color: '#3E8491',
                      boxShadow: 'inset 0 0 0 1px rgba(80,151,164,0.35)',
                    }
                  : {backgroundColor: '#fff', color: '#6B7C93', boxShadow: 'inset 0 0 0 1px #E5E9EE'}
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error ? <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span> : null}
    </div>
  );
}
