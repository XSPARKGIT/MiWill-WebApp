/** Email format (practical RFC-inspired check). */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PasswordRuleChecks = {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  noSpaces: boolean;
};

export function getPasswordRuleChecks(password: string): PasswordRuleChecks {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9\s]/.test(password),
    noSpaces: !/\s/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const c = getPasswordRuleChecks(password);
  return c.minLength && c.uppercase && c.lowercase && c.number && c.special && c.noSpaces;
}

export function getPasswordStrengthScore(password: string): number {
  const c = getPasswordRuleChecks(password);
  return [c.minLength, c.uppercase, c.lowercase, c.number, c.special, c.noSpaces].filter(Boolean).length;
}

export type PasswordStrengthLabel = 'weak' | 'fair' | 'good' | 'strong';

export function getPasswordStrengthLabel(score: number): PasswordStrengthLabel {
  if (score <= 2) return 'weak';
  if (score === 3) return 'fair';
  if (score === 4) return 'good';
  return 'strong';
}

export function getPasswordError(password: string): string {
  if (!password) return 'Password is required.';
  const c = getPasswordRuleChecks(password);
  if (!c.noSpaces) return 'Password cannot contain spaces.';
  if (!c.minLength) return 'Use at least 8 characters.';
  if (!c.uppercase) return 'Include an uppercase letter.';
  if (!c.lowercase) return 'Include a lowercase letter.';
  if (!c.number) return 'Include a number.';
  if (!c.special) return 'Include a special character.';
  return '';
}

/** SA mobile/landline: +27 + 9 digits, or 0 + 9 digits (spaces stripped). */
export function normalizeSaPhone(input: string): string {
  return input.replace(/\s/g, '');
}

export function isValidSouthAfricanPhone(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  const n = normalizeSaPhone(trimmed);
  if (n.startsWith('+27')) {
    const rest = n.slice(3);
    return /^[1-9][0-9]{8}$/.test(rest);
  }
  if (n.startsWith('0')) {
    return /^0[1-9][0-9]{8}$/.test(n);
  }
  return false;
}

/** Returns message only when input is non-empty but invalid. */
export function getSaPhoneError(input: string): string {
  if (!input.trim()) return '';
  return isValidSouthAfricanPhone(input) ? '' : 'Enter a valid SA number (+27… or 082… format).';
}

export function sanitizeSaIdDigits(input: string): string {
  return input.replace(/\D/g, '').slice(0, 13);
}

export function getSaIdRequiredError(digitsOnly: string): string {
  if (!digitsOnly) return 'ID number is required.';
  if (digitsOnly.length !== 13) return 'Must be a 13-digit SA ID number.';
  return '';
}

export function isAtLeast18(dateOfBirth: string): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 18;
}
