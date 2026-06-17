import {
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  getMiwillAppAuth,
  isMiwillAppConfigured,
  isMiwillAppSeparateFromPortal,
} from './miwillAppDb';

type Credentials = {
  email: string;
  password: string;
};

function readReaderCredentials(): Credentials | null {
  const email = import.meta.env.VITE_MIWILL_APP_READER_EMAIL?.trim();
  const password = import.meta.env.VITE_MIWILL_APP_READER_PASSWORD ?? '';

  if (!email || !password) {
    return null;
  }

  return {email, password};
}

async function signInMiwillApp(credentials: Credentials): Promise<void> {
  const auth = getMiwillAppAuth();
  if (!auth) {
    return;
  }

  await setPersistence(auth, browserSessionPersistence);
  await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
}

/**
 * The MiWill App Firestore client uses a named Firebase app (`miwill-app`).
 * Auth on that app is separate from portal Auth, so client reads need an explicit sign-in.
 */
export async function ensureMiwillAppAuth(portalCredentials?: Credentials): Promise<void> {
  if (!isMiwillAppConfigured) {
    return;
  }

  const auth = getMiwillAppAuth();
  if (!auth || auth.currentUser) {
    return;
  }

  const readerCredentials = readReaderCredentials();
  if (readerCredentials) {
    try {
      await signInMiwillApp(readerCredentials);
      return;
    } catch {
      if (!portalCredentials) {
        throw new Error('Unable to authenticate with the MiWill App reader account.');
      }
    }
  }

  if (portalCredentials) {
    try {
      await signInMiwillApp(portalCredentials);
      return;
    } catch {
      if (!isMiwillAppSeparateFromPortal) {
        throw new Error('Unable to authenticate with the MiWill App database.');
      }
    }
  }
}

export async function signOutMiwillAppAuth(): Promise<void> {
  const auth = getMiwillAppAuth();
  if (auth?.currentUser) {
    await signOut(auth);
  }
}
