/**
 * Seeds sample clients into miwill-dev for local admin dashboard testing.
 *
 * Usage: node scripts/seed-dev-clients.mjs
 */

import {readFileSync} from 'node:fs';
import {initializeApp, deleteApp} from 'firebase/app';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import {getFirestore, collection, addDoc, serverTimestamp} from 'firebase/firestore';

function loadEnv(file) {
  const env = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index > 0) env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return env;
}

const env = loadEnv('.env.local');
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const CLIENTS = [
  {
    firstName: 'Thabo',
    lastName: 'Mokoena',
    email: 'thabo.m@email.com',
    phone: '+27825550142',
    dateOfBirth: '1985-03-14',
    idNumber: '8503145800085',
    willStatus: 'complete',
    profileCompletion: 100,
  },
  {
    firstName: 'Lindiwe',
    lastName: 'Nkosi',
    email: 'lindiwe.nkosi@email.com',
    phone: '+27714442290',
    dateOfBirth: '1990-11-02',
    idNumber: '9011024800083',
    willStatus: 'submitted',
    profileCompletion: 88,
  },
];

const app = initializeApp(config, 'seed-dev-clients');
const auth = getAuth(app);
const db = getFirestore(app);

try {
  const email = 'testaccount@gmail.com';
  const password = env.VITE_DEMO_LOGIN_PASSWORD || 'Admin3@123';
  await signInWithEmailAndPassword(auth, email, password);
  console.log(`Signed in as ${email} on ${config.projectId}`);

  for (const client of CLIENTS) {
    const docRef = await addDoc(collection(db, 'clients'), {
      ...client,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid ?? 'seed-dev-clients',
    });
    console.log(`Created clients/${docRef.id} — ${client.firstName} ${client.lastName}`);
  }
} catch (error) {
  console.error('Seed failed:', error?.message || error);
  console.error('Publish portal rules first: node scripts/deploy-firestore-rules.mjs staging');
  process.exit(1);
} finally {
  await deleteApp(app);
}
