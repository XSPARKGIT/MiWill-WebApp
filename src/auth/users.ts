import type {UserRole} from './AuthContext';

export type PortalUser = {
  id: number;
  name: string;
  role: UserRole;
  email: string;
  password: string;
};

export const USERS: PortalUser[] = [
  {
    id: 1,
    name: 'Mpumelelo Dube',
    role: 'admin',
    email: 'testaccount@gmail.com',
    password: 'Admin3@123',
  },
  {
    id: 2,
    name: 'Agent User',
    role: 'agent',
    email: 'gifac12045@aspensif.com',
    password: 'Agent3@123',
  },
];

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function splitPortalName(name: string): {firstName: string; lastName: string} {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return {firstName: parts[0], lastName: parts.slice(1).join(' ')};
  }
  return {firstName: name, lastName: ''};
}

export function authenticatePortalUser(email: string, password: string): PortalUser | null {
  const normalized = normalizeEmail(email);
  return USERS.find((user) => normalizeEmail(user.email) === normalized && user.password === password) ?? null;
}

export function portalUserLabel(user: PortalUser): string {
  return user.role === 'admin' ? 'Admin' : 'Agent';
}
