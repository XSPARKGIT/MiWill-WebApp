import type {UserProfile, UserRole} from './AuthContext';
import {USERS, splitPortalName} from './users';

/** localStorage key for portal role (per product requirements). */
export const MOCK_ROLE_STORAGE_KEY = 'role';

/** Optional second key so dashboards can show the signed-in email. */
export const MOCK_EMAIL_STORAGE_KEY = 'mockAuthEmail';

/**
 * Local "database" of users for mock mode (so logins persist like a DB).
 */
export const MOCK_DB_USERS_KEY = 'mockDbUsers';

/** Self-registered accounts created via signup when Firebase is not configured. */
export const MOCK_REGISTERED_USERS_KEY = 'mockRegisteredUsers';

/** Email for the seeded demo / primary admin account. */
export const DEMO_ACCOUNT_EMAIL = USERS[0].email;

export const LAST_REGISTERED_EMAIL_KEY = 'miwill_last_registered_email';

export type MockSession = {
  role: UserRole;
  email: string;
};

type MockDbUser = Pick<UserProfile, 'uid' | 'email' | 'firstName' | 'lastName' | 'role' | 'isActive' | 'createdAt'>;

type MockAccount = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
};

type MockRegisteredUser = MockAccount & {
  uid: string;
  dateOfBirth: string;
  idNumber: string;
  phone: string | null;
  createdAt: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function readMockRegisteredUsers(): MockRegisteredUser[] {
  const parsed = safeParseJson<unknown>(localStorage.getItem(MOCK_REGISTERED_USERS_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(Boolean) as MockRegisteredUser[];
}

function writeMockRegisteredUsers(users: MockRegisteredUser[]): void {
  localStorage.setItem(MOCK_REGISTERED_USERS_KEY, JSON.stringify(users));
}

function listRegisteredUsersForRole(role: UserRole): MockRegisteredUser[] {
  return readMockRegisteredUsers()
    .filter((u) => u.role === role)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function listDbUsersForRole(role: UserRole): MockDbUser[] {
  return readMockDbUsers()
    .filter((u) => u.role === role)
    .sort((a, b) => {
      const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt ?? 0).getTime();
      const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt ?? 0).getTime();
      return tb - ta;
    });
}

export function setLastRegisteredEmail(email: string): void {
  sessionStorage.setItem(LAST_REGISTERED_EMAIL_KEY, email.trim());
}

export function getLastRegisteredEmail(): string | null {
  const email = sessionStorage.getItem(LAST_REGISTERED_EMAIL_KEY);
  return email?.trim() || null;
}

/** Prefer the account the user just created, then the newest registered user for the role. */
export function resolveSessionEmailForRole(role: UserRole): string | null {
  const lastEmail = getLastRegisteredEmail();
  if (lastEmail) {
    const lastAccount = findMockRegisteredAccount(lastEmail);
    if (lastAccount?.role === role) {
      return lastAccount.email;
    }
    const lastDb = findMockDbUserByEmail(lastEmail);
    if (lastDb?.role === role) {
      return lastDb.email;
    }
  }

  const registered = listRegisteredUsersForRole(role);
  if (registered[0]) {
    return registered[0].email;
  }

  const dbUsers = listDbUsersForRole(role);
  if (dbUsers[0]) {
    return dbUsers[0].email;
  }

  if (role === 'admin') {
    const seed = findMockRegisteredAccount(DEMO_ACCOUNT_EMAIL);
    if (seed?.role === 'admin') return seed.email;
    const seedDb = findMockDbUserByEmail(DEMO_ACCOUNT_EMAIL);
    if (seedDb?.role === 'admin') return seedDb.email;
  }

  return null;
}

export function ensureSeedMockUsers(): void {
  ensureDemoQuickFillUsers();
}

export function ensureDemoQuickFillUsers(): void {
  for (const user of USERS) {
    const {firstName, lastName} = splitPortalName(user.name);
    const existing = findMockRegisteredAccount(user.email);
    const createdAt = existing?.createdAt ?? new Date().toISOString();
    const registeredUser: MockRegisteredUser = {
      uid: existing?.uid ?? `mock-demo-${user.id}`,
      firstName,
      lastName,
      email: user.email,
      password: user.password,
      role: user.role,
      dateOfBirth: existing?.dateOfBirth ?? '1990-01-01',
      idNumber: existing?.idNumber ?? '9001015800085',
      phone: existing?.phone ?? null,
      createdAt,
    };

    const list = readMockRegisteredUsers().filter(
      (entry) => normalizeEmail(entry.email) !== normalizeEmail(user.email),
    );
    writeMockRegisteredUsers([...list, registeredUser]);
    upsertMockDbUser({
      uid: registeredUser.uid,
      email: registeredUser.email,
      firstName: registeredUser.firstName,
      lastName: registeredUser.lastName,
      role: registeredUser.role,
      isActive: true,
      createdAt: new Date(createdAt),
    });
  }
}

export function findMockRegisteredAccount(email: string): MockRegisteredUser | null {
  const e = normalizeEmail(email);
  return readMockRegisteredUsers().find((u) => normalizeEmail(u.email) === e) ?? null;
}

export function findMockDbUserByEmail(email: string): MockDbUser | null {
  const e = normalizeEmail(email);
  return readMockDbUsers().find((u) => normalizeEmail(u.email) === e) ?? null;
}

function findMockAccountByEmail(email: string): MockAccount | null {
  return findMockRegisteredAccount(email);
}

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function readMockDbUsers(): MockDbUser[] {
  const parsed = safeParseJson<unknown>(localStorage.getItem(MOCK_DB_USERS_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(Boolean) as MockDbUser[];
}

function writeMockDbUsers(users: MockDbUser[]): void {
  localStorage.setItem(MOCK_DB_USERS_KEY, JSON.stringify(users));
}

function upsertMockDbUser(user: MockDbUser): void {
  const list = readMockDbUsers();
  const emailKey = normalizeEmail(user.email);
  const next = [
    user,
    ...list.filter((u) => normalizeEmail(u.email) !== emailKey),
  ];
  writeMockDbUsers(next);
}

export function attemptMockLogin(email: string, password: string): MockSession | null {
  const match = findMockAccountByEmail(email);
  if (!match || match.password !== password) return null;
  return {role: match.role, email: match.email};
}

export async function signUpMockPortalUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  dateOfBirth: string;
  idNumber: string;
  phone: string | null;
}): Promise<void> {
  const normalizedEmail = input.email.trim();
  if (findMockAccountByEmail(normalizedEmail)) {
    throw new Error('That email is already registered. Try signing in instead.');
  }

  const uid = `mock-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
  const createdAt = new Date().toISOString();
  const registeredUser: MockRegisteredUser = {
    uid,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: normalizedEmail,
    password: input.password,
    role: input.role,
    dateOfBirth: input.dateOfBirth,
    idNumber: input.idNumber,
    phone: input.phone,
    createdAt,
  };

  writeMockRegisteredUsers([...readMockRegisteredUsers(), registeredUser]);
  upsertMockDbUser({
    uid: registeredUser.uid,
    email: registeredUser.email,
    firstName: registeredUser.firstName,
    lastName: registeredUser.lastName,
    role: registeredUser.role,
    isActive: true,
    createdAt: new Date(createdAt),
  });

  setLastRegisteredEmail(normalizedEmail);
}

export function saveMockSession(session: MockSession): void {
  localStorage.setItem(MOCK_ROLE_STORAGE_KEY, session.role);
  localStorage.setItem(MOCK_EMAIL_STORAGE_KEY, session.email);

  // Persist the person to the local "database" on successful login.
  const profile = mockProfileFromSession(session);
  upsertMockDbUser({
    ...profile,
    createdAt: profile.createdAt ?? new Date(),
  });
}

export function clearMockSession(): void {
  localStorage.removeItem(MOCK_ROLE_STORAGE_KEY);
  localStorage.removeItem(MOCK_EMAIL_STORAGE_KEY);
}

export function getMockSession(): MockSession | null {
  const role = localStorage.getItem(MOCK_ROLE_STORAGE_KEY);
  const email = localStorage.getItem(MOCK_EMAIL_STORAGE_KEY);

  if (role !== 'admin' && role !== 'agent') {
    return null;
  }

  if (!email || !email.includes('@')) {
    return null;
  }

  return {role, email};
}

export function mockProfileFromSession(session: MockSession): UserProfile {
  const registered = findMockRegisteredAccount(session.email);
  const dbUser = findMockDbUserByEmail(session.email);
  const label = registered
    ? {firstName: registered.firstName, lastName: registered.lastName}
    : dbUser
      ? {firstName: dbUser.firstName, lastName: dbUser.lastName}
      : session.role === 'admin'
        ? {firstName: 'Admin', lastName: 'User'}
        : {firstName: 'Agent', lastName: 'User'};

  return {
    uid: dbUser?.uid ?? registered?.uid ?? 'mock-auth',
    email: session.email,
    firstName: label.firstName,
    lastName: label.lastName,
    role: session.role,
    isActive: true,
    createdAt: dbUser?.createdAt ?? null,
  };
}

/** Fire after updating mock auth so AuthProvider can sync without a full reload. */
export function notifyMockAuthChanged(): void {
  window.dispatchEvent(new CustomEvent('miwill-mock-auth'));
}
