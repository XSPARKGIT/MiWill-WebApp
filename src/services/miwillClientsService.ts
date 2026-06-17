import {collection, getDocs} from 'firebase/firestore';
import {ensureMiwillAppAuth} from '../firebase/miwillAppAuth';
import {isMiwillAppConfigured, miwillDb} from '../firebase/miwillAppDb';

export type MiwillClientRecord = {
  id: string;
  [key: string]: unknown;
};

async function readCollection(name: string): Promise<MiwillClientRecord[]> {
  if (!miwillDb) {
    throw new Error('MiWill App Firebase is not configured.');
  }

  const snap = await getDocs(collection(miwillDb, name));
  return snap.docs.map((docSnap) => ({id: docSnap.id, ...docSnap.data()}));
}

export async function fetchMiwillClients(): Promise<MiwillClientRecord[]> {
  if (!isMiwillAppConfigured || !miwillDb) {
    throw new Error('MiWill App Firebase is not configured. Add VITE_MIWILL_APP_* keys to your env.');
  }

  await ensureMiwillAppAuth();

  const [userDocs, clientDocs] = await Promise.all([
    readCollection('users'),
    readCollection('clients'),
  ]);

  return [...userDocs, ...clientDocs];
}
