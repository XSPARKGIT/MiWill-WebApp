import {ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {onAuthStateChanged, signOut as firebaseSignOut} from 'firebase/auth';
import {fetchUserProfile} from './authService';
import {resolveAgentGateStep, type AgentGateStep} from './agentGate';
import {clearRoleVerification} from './pinVerification';
import {getPortalFirebaseAuth, isFirebaseConfigured} from '../firebase/client';
import {ensureMiwillAppAuth, signOutMiwillAppAuth} from '../firebase/miwillAppAuth';
import {
  MOCK_EMAIL_STORAGE_KEY,
  MOCK_ROLE_STORAGE_KEY,
  clearMockSession,
  getMockSession,
  mockProfileFromSession,
  notifyMockAuthChanged,
} from './mockAuth';

export type UserRole = 'admin' | 'agent';

export type AgentAccountStatus =
  | 'pending_password_change'
  | 'pending_2fa_setup'
  | 'active'
  | string;

export type UserProfile = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date | null;
  status?: AgentAccountStatus;
  forcePasswordChange?: boolean;
};

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  profile: UserProfile | null;
  agentGateStep: AgentGateStep;
  applyProfile: (profile: UserProfile | null) => void;
  refreshProfile: () => Promise<UserProfile | null>;
  refreshAgentClaims: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readMockProfile(): UserProfile | null {
  const session = getMockSession();
  return session ? mockProfileFromSession(session) : null;
}

export function AuthProvider({children}: {children: ReactNode}) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authClaims, setAuthClaims] = useState<Record<string, unknown>>({});

  const agentGateStep = useMemo(() => {
    if (!profile) {
      return 'none' as AgentGateStep;
    }

    return resolveAgentGateStep(profile, authClaims);
  }, [authClaims, profile]);

  const applyProfile = useCallback((next: UserProfile | null) => {
    setProfile(next);
    setStatus(next ? 'authenticated' : 'unauthenticated');
  }, []);

  const refreshAgentClaims = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setAuthClaims({});
      return;
    }

    const auth = getPortalFirebaseAuth();
    const user = auth?.currentUser;
    if (!user) {
      setAuthClaims({});
      return;
    }

    const token = await user.getIdTokenResult(true);
    setAuthClaims(token.claims);
  }, []);

  const syncMockFromStorage = useCallback(() => {
    applyProfile(readMockProfile());
  }, [applyProfile]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      syncMockFromStorage();
      return;
    }

    const auth = getPortalFirebaseAuth();
    if (!auth) {
      syncMockFromStorage();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const mockProfile = readMockProfile();
        applyProfile(mockProfile);
        return;
      }

      try {
        const nextProfile = await fetchUserProfile(user.uid);
        if (!nextProfile) {
          await firebaseSignOut(auth);
          applyProfile(readMockProfile());
          return;
        }

        clearMockSession();
        applyProfile(nextProfile);
        await refreshAgentClaims();

        try {
          await ensureMiwillAppAuth();
        } catch {
          /* Reader credentials may be configured for cross-project client reads. */
        }
      } catch {
        applyProfile(null);
      }
    });

    return unsubscribe;
  }, [applyProfile, refreshAgentClaims, syncMockFromStorage]);

  useEffect(() => {
    if (isFirebaseConfigured) {
      return;
    }

    function onCustom() {
      syncMockFromStorage();
    }

    function onStorage(event: StorageEvent) {
      if (event.key === MOCK_ROLE_STORAGE_KEY || event.key === MOCK_EMAIL_STORAGE_KEY) {
        syncMockFromStorage();
      }
    }

    window.addEventListener('miwill-mock-auth', onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('miwill-mock-auth', onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, [isFirebaseConfigured, syncMockFromStorage]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      profile,
      applyProfile,
      refreshProfile: async () => {
        if (!isFirebaseConfigured) {
          const next = readMockProfile();
          applyProfile(next);
          return next;
        }

        const auth = getPortalFirebaseAuth();
        const user = auth?.currentUser;
        if (!user) {
          applyProfile(null);
          setAuthClaims({});
          return null;
        }

        const next = await fetchUserProfile(user.uid);
        applyProfile(next);
        await refreshAgentClaims();
        return next;
      },
      refreshAgentClaims,
      agentGateStep,
      signOutUser: async () => {
        clearMockSession();
        clearRoleVerification();

        if (isFirebaseConfigured) {
          const auth = getPortalFirebaseAuth();
          if (auth) {
            await firebaseSignOut(auth);
          }
          await signOutMiwillAppAuth();
        }

        applyProfile(null);
        setAuthClaims({});
        notifyMockAuthChanged();
      },
    }),
    [agentGateStep, applyProfile, profile, refreshAgentClaims, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
