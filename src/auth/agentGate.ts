import type {UserProfile} from './AuthContext';

export type AgentGateStep = 'password' | 'enroll' | 'totp' | 'none';

/** MFA gates apply only to accounts with the agent custom claim (admin-provisioned flow). */
export function isAgentMfaSubject(
  profile: UserProfile,
  claims: Record<string, unknown>,
): boolean {
  return profile.role === 'agent' && claims.role === 'agent';
}

export function resolveAgentGateStep(
  profile: UserProfile,
  claims: Record<string, unknown>,
): AgentGateStep {
  if (!isAgentMfaSubject(profile, claims)) {
    return 'none';
  }

  if (profile.forcePasswordChange === true || profile.status === 'pending_password_change') {
    return 'password';
  }

  if (profile.status === 'pending_2fa_setup') {
    return 'enroll';
  }

  if (profile.status === 'active' && !claims.mfaVerifiedAt) {
    return 'totp';
  }

  return 'none';
}

export function agentNeedsOnboarding(
  profile: UserProfile,
  claims: Record<string, unknown>,
): boolean {
  return resolveAgentGateStep(profile, claims) !== 'none';
}
