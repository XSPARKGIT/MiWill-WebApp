export type AdminSection =
  | 'overview'
  | 'users'
  | 'agents'
  | 'performance'
  | 'leads'
  | 'settings';

export type AdminNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};
