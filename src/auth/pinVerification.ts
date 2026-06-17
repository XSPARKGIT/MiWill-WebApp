import type {UserRole} from './AuthContext';

const VERIFICATION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

type VerificationRecord = {
  verified: true;
  at: number;
};

function storageKey(role: UserRole): string {
  return `${role}_verified`;
}

function normalizePin(value: unknown): string {
  if (value == null) return '';
  return String(value).trim().replace(/\D/g, '');
}

export function isRoleVerified(role: UserRole): boolean {
  const raw = sessionStorage.getItem(storageKey(role));
  if (!raw) return false;

  try {
    const data = JSON.parse(raw) as VerificationRecord;
    if (data.verified !== true || typeof data.at !== 'number') return false;
    if (Date.now() - data.at > VERIFICATION_TTL_MS) {
      sessionStorage.removeItem(storageKey(role));
      return false;
    }
    return true;
  } catch {
    if (raw === 'true') {
      markRoleVerified(role);
      return true;
    }
    return false;
  }
}

export function markRoleVerified(role: UserRole): void {
  const record: VerificationRecord = {verified: true, at: Date.now()};
  sessionStorage.setItem(storageKey(role), JSON.stringify(record));
}

export function clearRoleVerification(role?: UserRole): void {
  if (role) {
    sessionStorage.removeItem(storageKey(role));
    return;
  }
  sessionStorage.removeItem('admin_verified');
  sessionStorage.removeItem('agent_verified');
}

export function getPinForRole(role: UserRole): string | null {
  const raw =
    role === 'admin' ? import.meta.env.VITE_ADMIN_PIN : import.meta.env.VITE_AGENT_PIN;
  const pin = normalizePin(raw);
  return pin.length === 4 ? pin : null;
}

export function verifyPinForRole(role: UserRole, pin: string): boolean {
  const expected = getPinForRole(role);
  if (!expected) return false;
  return normalizePin(pin) === expected;
}

export function isPinConfigured(role: UserRole): boolean {
  return getPinForRole(role) !== null;
}
