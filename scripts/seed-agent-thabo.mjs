/**
 * Seeds Thabo Nkosi as a portal agent in miwill-dev Firestore.
 *
 * Agents live in the `users` collection with role === "agent" (not a separate agents table).
 *
 * Usage (from MiWill-WebApp):
 *   node scripts/seed-agent-thabo.mjs
 *
 * Requires Firebase Auth + Firestore API access for miwill-dev.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, deleteApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  connectAuthEmulator,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnvFile(filename) {
  const path = resolve(root, filename);
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i === -1) continue;
    env[trimmed.slice(0, i)] = trimmed.slice(i + 1);
  }
  return env;
}

const env = {...loadEnvFile('.env.local'), ...loadEnvFile('.env')};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const AGENT = {
  firstName: 'Thabo',
  lastName: 'Nkosi',
  email: 't.nkosi@miwill.co.za',
  password: env.SEED_AGENT_PASSWORD || 'Agent3@123',
  phone: '+27821234567',
  dateOfBirth: '1985-06-15',
  idNumber: '8506155800085',
  role: 'agent',
};

function assertConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length) {
    throw new Error(`Missing Firebase config in .env.local: ${missing.join(', ')}`);
  }
  if (firebaseConfig.projectId !== 'miwill-dev') {
    console.warn(`Warning: project is "${firebaseConfig.projectId}", expected miwill-dev.`);
  }
}

async function getOrCreateAuthUser(auth) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, AGENT.email, AGENT.password);
    console.log(`Created Firebase Auth user: ${credential.user.uid}`);
    return credential.user;
  } catch (error) {
    if (error?.code !== 'auth/email-already-in-use') {
      throw error;
    }
    console.log('Auth user already exists — signing in to attach Firestore profile…');
    const credential = await signInWithEmailAndPassword(auth, AGENT.email, AGENT.password);
    return credential.user;
  }
}

async function main() {
  assertConfig();

  const appName = 'seed-agent-thabo';
  const existing = getApps().find((entry) => entry.name === appName);
  if (existing) {
    await deleteApp(existing);
  }

  const app = initializeApp(firebaseConfig, appName);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const user = await getOrCreateAuthUser(auth);
  const profileRef = doc(db, 'users', user.uid);
  const existingProfile = await getDoc(profileRef);

  const profile = {
    uid: user.uid,
    email: AGENT.email,
    firstName: AGENT.firstName,
    lastName: AGENT.lastName,
    role: AGENT.role,
    isActive: true,
    phone: AGENT.phone,
    dateOfBirth: AGENT.dateOfBirth,
    idNumber: AGENT.idNumber,
    createdAt: serverTimestamp(),
    seededBy: 'scripts/seed-agent-thabo.mjs',
  };

  if (existingProfile.exists()) {
    console.log(`Firestore profile already exists at users/${user.uid}`);
    console.log(JSON.stringify(existingProfile.data(), null, 2));
    await deleteApp(app);
    return;
  }

  await setDoc(profileRef, profile);
  console.log(`Created Firestore agent profile at users/${user.uid}`);
  console.log(
    JSON.stringify(
      {
        ...profile,
        createdAt: '(server timestamp)',
        loginEmail: AGENT.email,
        loginPassword: AGENT.password,
      },
      null,
      2,
    ),
  );

  await deleteApp(app);
}

main().catch((error) => {
  console.error('Seed failed:', error?.message || error);
  process.exit(1);
});
