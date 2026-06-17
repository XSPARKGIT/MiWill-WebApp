import {ReactNode} from 'react';
import logo from '/assets/MainMiwillLogo.png';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  belowLogo,
  containerClassName = 'max-w-md',
  compact,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  belowLogo?: ReactNode;
  /** Outer width constraint for the card column (e.g. max-w-xl for long forms). */
  containerClassName?: string;
  /** Smaller typography and tighter spacing (e.g. signup). */
  compact?: boolean;
}) {
  const cardPad = compact ? 'px-5 py-6 sm:px-6' : 'px-6 py-8 sm:px-8';
  const headerMb = compact ? 'mb-6' : 'mb-8';
  const logoCls = compact
    ? 'mb-4 h-12 w-auto object-contain sm:h-14'
    : 'mb-5 h-16 w-auto object-contain sm:h-20';
  const tabWrapMb = compact ? 'mb-4' : 'mb-6';
  const titleCls = compact ? 'text-2xl font-black tracking-tight text-slate-900' : 'text-3xl font-black tracking-tight text-slate-900';
  const subtitleCls = compact ? 'mt-1.5 text-xs font-medium text-slate-500' : 'mt-2 text-sm font-medium text-slate-500';
  const bodyGap = compact ? 'space-y-4' : 'space-y-5';
  const footerCls = compact ? 'mt-5 text-center text-xs text-slate-500' : 'mt-6 text-center text-sm text-slate-500';

  return (
    <div className="min-h-screen bg-[#5097A4] bg-[radial-gradient(ellipse_at_top_left,_#62A8B5_0%,_#5097A4_52%,_#458A97_100%)] px-4 py-10 sm:px-6">
      <div
        className={`mx-auto flex min-h-[calc(100vh-5rem)] items-center justify-center ${containerClassName}`}
      >
        <div className={`relative w-full overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_rgba(17,24,39,0.20)] ${cardPad}`}>
          <div className="pointer-events-none absolute inset-x-10 top-0 h-1 rounded-full bg-[#5097A4]/20" />
          <div className={`${headerMb} flex flex-col items-center text-center`}>
            <img src={logo} alt="MiWill logo" className={logoCls} />
            {belowLogo ? <div className={`${tabWrapMb} w-full max-w-sm`}>{belowLogo}</div> : null}
            <h1 className={titleCls}>{title}</h1>
            <p className={subtitleCls}>{subtitle}</p>
          </div>
          <div className={bodyGap}>{children}</div>
          {footer ? <div className={footerCls}>{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
