import {ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {onAuthStateChanged, signOut as firebaseSignOut} from 'firebase/auth';
import {fetchUserProfile} from './authService';
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

export type UserProfile = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date | null;
};

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  profile: UserProfile | null;
  applyProfile: (profile: UserProfile | null) => void;
  refreshProfile: () => Promise<UserProfile | null>;
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

  const applyProfile = useCallback((next: UserProfile | null) => {
    setProfile(next);
    setStatus(next ? 'authenticated' : 'unauthenticated');
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
  }, [applyProfile, syncMockFromStorage]);

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
          return null;
        }

        const next = await fetchUserProfile(user.uid);
        applyProfile(next);
        return next;
      },
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
        notifyMockAuthChanged();
      },
    }),
    [applyProfile, profile, status],
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
