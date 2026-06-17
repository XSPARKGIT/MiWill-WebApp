import {NavLink} from 'react-router-dom';

export function AuthSegmentTabs({compact}: {compact?: boolean}) {
  const tabClass = ({isActive}: {isActive: boolean}) =>
    `flex-1 rounded-full text-center font-semibold transition-colors ${
      compact ? 'py-2 text-xs' : 'py-2.5 text-sm'
    } ${
      isActive ? 'bg-white text-[#5097A4] shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`;

  return (
    <div
      className={`flex w-full rounded-full bg-slate-100 p-1 ${compact ? 'text-xs' : 'text-sm'}`}
      role="tablist"
    >
      <NavLink to="/login" end role="tab" className={tabClass}>
        Login
      </NavLink>
      <NavLink to="/signup" role="tab" className={tabClass}>
        Sign up
      </NavLink>
    </div>
  );
}
