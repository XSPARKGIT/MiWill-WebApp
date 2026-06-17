import {Outlet} from 'react-router-dom';

/** Layout route grouping `/login` and `/signup` under one outlet (SPA navigation, no extra chrome). */
export function AuthRoutesLayout() {
  return <Outlet />;
}
