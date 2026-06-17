import {addDoc, collection, serverTimestamp} from 'firebase/firestore';
import {firebaseRuntimeConfig, getFirebaseDb} from './client';

export async function saveWaitlistLead(email: string): Promise<boolean> {
  const db = getFirebaseDb();

  if (!db) {
    return false;
  }

  await addDoc(collection(db, firebaseRuntimeConfig.waitlistCollection), {
    email,
    createdAt: serverTimestamp(),
    environment: firebaseRuntimeConfig.appEnv,
    source: 'landing-page',
  });

  return true;
}
