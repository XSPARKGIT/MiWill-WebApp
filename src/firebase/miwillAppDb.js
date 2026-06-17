import {initializeApp, getApps} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getFirebaseApp} from './client';

function readConfigValue(miwillKey, portalKey) {
  const value = import.meta.env[miwillKey] ?? import.meta.env[portalKey];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

const miwillAppConfig = {
  apiKey: readConfigValue('VITE_MIWILL_APP_API_KEY', 'VITE_FIREBASE_API_KEY'),
  authDomain: readConfigValue('VITE_MIWILL_APP_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readConfigValue('VITE_MIWILL_APP_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readConfigValue('VITE_MIWILL_APP_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readConfigValue(
    'VITE_MIWILL_APP_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
  ),
  appId: readConfigValue('VITE_MIWILL_APP_APP_ID', 'VITE_FIREBASE_APP_ID'),
};

const requiredMiwillAppKeys = Object.values(miwillAppConfig);

export const miwillAppProjectId = miwillAppConfig.projectId ?? null;

export const isMiwillAppConfigured = requiredMiwillAppKeys.every(
  (value) => typeof value === 'string' && value.length > 0,
);

export const isMiwillAppSeparateFromPortal =
  isMiwillAppConfigured &&
  typeof import.meta.env.VITE_FIREBASE_PROJECT_ID === 'string' &&
  miwillAppConfig.projectId !== import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Ensure the portal default app exists before creating the named MiWill App instance.
getFirebaseApp();

export function getMiwillFirebaseApp() {
  if (!isMiwillAppConfigured) {
    return null;
  }

  return getApps().find((app) => app.name === 'miwill-app') ?? initializeApp(miwillAppConfig, 'miwill-app');
}

export function getMiwillAppAuth() {
  const app = getMiwillFirebaseApp();
  return app ? getAuth(app) : null;
}

const miwillApp = getMiwillFirebaseApp();

export const miwillDb = miwillApp ? getFirestore(miwillApp) : null;
