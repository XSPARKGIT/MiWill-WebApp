import {getAnalytics, isSupported as analyticsSupported} from 'firebase/analytics';
import {
  FirebaseApp,
  FirebaseOptions,
  deleteApp,
  getApps,
  initializeApp,
} from 'firebase/app';
import {Auth, getAuth} from 'firebase/auth';
import {Firestore, getFirestore} from 'firebase/firestore';

function inferAppEnv(projectId?: string): 'local' | 'staging' | 'production' {
  if (!projectId) {
    return 'local';
  }

  const normalized = projectId.toLowerCase();

  if (normalized.includes('staging') || normalized.includes('stage') || normalized.includes('dev')) {
    return 'staging';
  }

  return 'local';
}

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const resolvedAppEnv = import.meta.env.VITE_FIREBASE_APP_ENV ?? inferAppEnv(firebaseConfig.projectId);

const requiredFirebaseKeys = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
];

export const firebaseRuntimeConfig = {
  appEnv: resolvedAppEnv,
  waitlistCollection: import.meta.env.VITE_FIREBASE_WAITLIST_COLLECTION ?? 'waitlist',
  projectId: firebaseConfig.projectId ?? null,
  authDomain: firebaseConfig.authDomain ?? null,
};

export const isStagingFirebaseRuntime = firebaseRuntimeConfig.appEnv === 'staging';

export const isFirebaseConfigured = requiredFirebaseKeys.every(
  (value) => typeof value === 'string' && value.length > 0,
);

export function assertStagingFirebaseRuntime(action: string) {
  if (!isStagingFirebaseRuntime) {
    throw new Error(
      `The admin portal ${action} is locked to staging. Start the app with the staging Firebase config (for example: npm run dev:staging).`,
    );
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) {
    return null;
  }

  const defaultApp = getApps().find((app) => app.name === '[DEFAULT]');
  if (defaultApp) {
    return defaultApp;
  }

  return initializeApp(firebaseConfig);
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getStagingFirebaseDb(): Firestore | null {
  assertStagingFirebaseRuntime('database access');
  return getFirebaseDb();
}

export function getStagingFirebaseAuth(): Auth | null {
  assertStagingFirebaseRuntime('sign-in');
  return getFirebaseAuth();
}

/** Login / signup / profile reads — uses configured Firebase without requiring staging env. */
export function getPortalFirebaseAuth(): Auth | null {
  return getFirebaseAuth();
}

export function getPortalFirebaseDb(): Firestore | null {
  return getFirebaseDb();
}

export function createSecondaryFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) {
    return null;
  }

  const existing = getApps().find((app) => app.name === 'signup-secondary');
  return existing ?? initializeApp(firebaseConfig, 'signup-secondary');
}

export function getSecondaryFirebaseAuth(): Auth | null {
  const app = createSecondaryFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getStagingSecondaryFirebaseAuth(): Auth | null {
  assertStagingFirebaseRuntime('account creation');
  return getSecondaryFirebaseAuth();
}

/** Secondary Auth for creating users while another session stays on primary (admin tools). */
export function getPortalSecondaryFirebaseAuth(): Auth | null {
  return getSecondaryFirebaseAuth();
}

export async function destroySecondaryFirebaseApp(): Promise<void> {
  const app = getApps().find((entry) => entry.name === 'signup-secondary');

  if (app) {
    await deleteApp(app);
  }
}

export async function initializeFirebaseAnalytics(): Promise<void> {
  if (!firebaseConfig.measurementId || typeof window === 'undefined') {
    return;
  }

  const app = getFirebaseApp();
  if (!app) {
    return;
  }

  if (await analyticsSupported()) {
    getAnalytics(app);
  }
}
