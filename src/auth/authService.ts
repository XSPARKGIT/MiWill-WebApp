import {FirebaseError} from 'firebase/app';
import {
  UserCredential,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {collection, doc, getDoc, getDocs, query, setDoc, where, type DocumentData} from 'firebase/firestore';
import {
  destroySecondaryFirebaseApp,
  getPortalFirebaseAuth,
  getPortalFirebaseDb,
  getPortalSecondaryFirebaseAuth,
  isFirebaseConfigured,
} from '../firebase/client';
import {ensureMiwillAppAuth, signOutMiwillAppAuth} from '../firebase/miwillAppAuth';
import {UserProfile, UserRole} from './AuthContext';
import {
  DEMO_ACCOUNT_EMAIL,
  findMockDbUserByEmail,
  findMockRegisteredAccount,
  resolveSessionEmailForRole,
  setLastRegisteredEmail,
  signUpMockPortalUser,
} from './mockAuth';

function profileFromFirestoreData(uid: string, data: DocumentData, fallbackEmail = ''): UserProfile | null {
  if (data.isActive === false) {
    return null;
  }

  if (data.role !== 'admin' && data.role !== 'agent') {
    return null;
  }

  return {
    uid,
    email: data.email ?? fallbackEmail,
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
    role: data.role,
    isActive: data.isActive !== false,
    createdAt: typeof data.createdAt?.toDate === 'function' ? data.createdAt.toDate() : data.createdAt ?? null,
  };
}

export type DemoLoginAccount = {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
};

export async function fetchUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const db = getPortalFirebaseDb();
  if (!db) {
    return null;
  }

  const snapshot = await getDocs(
    query(collection(db, 'users'), where('email', '==', email.trim())),
  );

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  return profileFromFirestoreData(docSnap.id, docSnap.data(), email);
}

export async function fetchLatestUserEmailForRole(role: UserRole): Promise<string | null> {
  const db = getPortalFirebaseDb();
  if (!db) {
    return null;
  }

  const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', role)));
  if (snapshot.empty) {
    return null;
  }

  const sorted = [...snapshot.docs].sort((a, b) => {
    const ta = a.data().createdAt?.toDate?.()?.getTime?.() ?? 0;
    const tb = b.data().createdAt?.toDate?.()?.getTime?.() ?? 0;
    return tb - ta;
  });

  const email = sorted[0].data().email;
  return typeof email === 'string' && email.includes('@') ? email : null;
}

export async function resolvePortalLoginEmail(role: UserRole): Promise<string | null> {
  const lastEmail = sessionStorage.getItem('miwill_last_registered_email')?.trim();
  if (lastEmail) {
    if (isFirebaseConfigured) {
      try {
        const profile = await fetchUserProfileByEmail(lastEmail);
        if (profile?.role === role) {
          return profile.email;
        }
      } catch {
        /* fall through */
      }
    }

    const mockAccount = findMockRegisteredAccount(lastEmail);
    if (mockAccount?.role === role) {
      return mockAccount.email;
    }

    const mockDb = findMockDbUserByEmail(lastEmail);
    if (mockDb?.role === role) {
      return mockDb.email;
    }
  }

  if (isFirebaseConfigured) {
    try {
      const firebaseEmail = await fetchLatestUserEmailForRole(role);
      if (firebaseEmail) {
        return firebaseEmail;
      }
    } catch {
      /* fall through to mock stores */
    }
  }

  return resolveSessionEmailForRole(role);
}

export async function fetchDemoLoginAccount(): Promise<DemoLoginAccount | null> {
  const email = DEMO_ACCOUNT_EMAIL;
  const registered = findMockRegisteredAccount(email);
  const fillPassword =
    registered?.password ?? import.meta.env.VITE_DEMO_LOGIN_PASSWORD?.trim() ?? '';

  if (isFirebaseConfigured) {
    try {
      const profile = await fetchUserProfileByEmail(email);
      if (profile) {
        return {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          role: profile.role,
          password: fillPassword,
        };
      }
    } catch {
      /* fall through to local mock stores */
    }
  }

  if (registered) {
    return {
      firstName: registered.firstName,
      lastName: registered.lastName,
      email: registered.email,
      role: registered.role,
      password: registered.password,
    };
  }

  const dbUser = findMockDbUserByEmail(email);
  if (dbUser) {
    return {
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      role: dbUser.role,
      password: fillPassword,
    };
  }

  if (fillPassword) {
    return {
      firstName: 'Thabo',
      lastName: 'Ndlovu',
      email,
      role: 'agent',
      password: fillPassword,
    };
  }

  return null;
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getPortalFirebaseDb();
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) {
    return null;
  }

  return profileFromFirestoreData(uid, snapshot.data());
}

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const auth = getPortalFirebaseAuth();
  const db = getPortalFirebaseDb();

  if (!auth || !db) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* keys to your env.');
  }

  await setPersistence(auth, browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const snapshot = await getDoc(doc(db, 'users', credential.user.uid));

  if (!snapshot.exists()) {
    await signOut(auth);
    throw new Error('No user profile exists for this account.');
  }

  const data = snapshot.data();

  if (data.isActive === false) {
    await signOut(auth);
    throw new Error('Account disabled. Contact admin.');
  }

  const profile = profileFromFirestoreData(
    credential.user.uid,
    data,
    credential.user.email ?? email,
  );

  if (!profile) {
    await signOut(auth);
    throw new Error('This account does not have a valid admin portal role.');
  }

  try {
    await ensureMiwillAppAuth({email, password});
  } catch {
    /* Client reads may still work via VITE_MIWILL_APP_READER_* credentials. */
  }

  return profile;
}

export async function createManagedUserAccount(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<UserCredential> {
  const db = getPortalFirebaseDb();
  const secondaryAuth = getPortalSecondaryFirebaseAuth();

  if (!db || !secondaryAuth) {
    throw new Error('Firebase is not configured for managed account creation.');
  }

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      input.email,
      input.password,
    );

    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email: credential.user.email ?? input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      isActive: true,
      createdAt: new Date(),
    });

    await signOut(secondaryAuth);
    return credential;
  } finally {
    await destroySecondaryFirebaseApp();
  }
}

/**
 * Self-service signup (staging Firebase only).
 * Uses the **primary** Auth instance so Firestore sees `request.auth` when writing `users/{uid}`.
 * (Secondary Auth creates users in the same project but does not attach tokens to the Firestore client,
 * which triggers “Missing or insufficient permissions” under typical rules.)
 */
export async function signUpPortalUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  dateOfBirth: string;
  idNumber: string;
  phone: string | null;
}): Promise<void> {
  if (!isFirebaseConfigured) {
    await signUpMockPortalUser(input);
    return;
  }

  const db = getPortalFirebaseDb();
  const auth = getPortalFirebaseAuth();

  if (!db || !auth) {
    await signUpMockPortalUser(input);
    return;
  }

  await setPersistence(auth, browserSessionPersistence);

  let credential: UserCredential;
  try {
    credential = await createUserWithEmailAndPassword(auth, input.email, input.password);

    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email: credential.user.email ?? input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      isActive: true,
      createdAt: new Date(),
      dateOfBirth: input.dateOfBirth,
      idNumber: input.idNumber,
      phone: input.phone,
      popiaAcceptedAt: new Date(),
    });
  } catch (error) {
    try {
      await signOut(auth);
    } catch {
      /* ignore */
    }
    throw error;
  }

  await signOut(auth);

  setLastRegisteredEmail(input.email.trim());
}

export function mapLoginError(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      return 'Invalid email or password.';
    }
    if (error.code === 'auth/user-not-found') {
      return 'No account found for this email.';
    }
    if (error.code === 'auth/too-many-requests') {
      return 'Too many attempts. Wait a moment and try again.';
    }
    if (error.code === 'auth/network-request-failed') {
      return 'Network error. Check your connection and try again.';
    }
  }

  const message = error instanceof Error ? error.message : 'Unable to sign in.';

  if (message.includes('not configured')) {
    return message;
  }

  return message;
}

export function mapPortalSignupError(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') {
      return 'Missing or insufficient permissions. Ensure Firestore rules allow authenticated users to create their own user profile.';
    }
    if (error.code === 'auth/email-already-in-use') {
      return 'That email is already registered. Try signing in instead.';
    }
    if (error.code === 'auth/weak-password') {
      return 'Password is too weak. Use a stronger password.';
    }
    if (error.code === 'auth/invalid-email') {
      return 'Invalid email address.';
    }
    if (error.code === 'auth/network-request-failed') {
      return 'Network error. Check your connection and try again.';
    }
    if (error.code === 'auth/operation-not-allowed') {
      return 'Email/password sign-up is disabled in Firebase. Enable it in the console.';
    }
  }

  const message = error instanceof Error ? error.message : 'Unable to create your account.';

  if (message.includes('not configured') || message.includes('locked to staging')) {
    return message;
  }

  return message;
}

