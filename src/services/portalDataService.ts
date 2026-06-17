import {createUserWithEmailAndPassword, signOut} from 'firebase/auth';
import {addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, where} from 'firebase/firestore';
import {
  destroySecondaryFirebaseApp,
  getPortalFirebaseDb,
  getPortalSecondaryFirebaseAuth,
  isFirebaseConfigured,
} from '../firebase/client';
import {ensureMiwillAppAuth} from '../firebase/miwillAppAuth';
import {isMiwillAppConfigured, miwillDb} from '../firebase/miwillAppDb';
import {mapFirestoreClientToAssignedUser} from '../utils/firestoreMappers';

export type {CreateLeadInput} from './leadsService';
export {createLead as createPortalLead, getPortalActorId as getCurrentAuthUid} from './leadsService';

export type CreateAgentInput = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  idNumber: string;
  email: string;
  phone: string;
  password: string;
  createdBy: string;
};

export type CreateClientInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  idNumber: string;
  willStatus: 'draft' | 'review' | 'submitted' | 'complete';
  assignedAgentId: string;
  assignedAgentName: string;
  notes: string;
  createdBy: string;
};

export async function emailExistsInPortalUsers(email: string): Promise<boolean> {
  const db = getPortalFirebaseDb();
  if (!db) return false;

  const snapshot = await getDocs(
    query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase())),
  );
  return !snapshot.empty;
}

export async function createPortalAgent(input: CreateAgentInput) {
  const db = getPortalFirebaseDb();
  const secondaryAuth = getPortalSecondaryFirebaseAuth();

  if (!db || !secondaryAuth || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured for agent creation.');
  }

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      input.email.trim(),
      input.password,
    );

    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      dateOfBirth: input.dateOfBirth,
      idNumber: input.idNumber,
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      role: 'agent',
      isActive: true,
      createdAt: serverTimestamp(),
      createdBy: input.createdBy,
    });

    await signOut(secondaryAuth);

    return {
      id: credential.user.uid,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      role: 'agent',
    };
  } finally {
    await destroySecondaryFirebaseApp();
  }
}

export async function createMiwillAppClient(input: CreateClientInput) {
  if (!isFirebaseConfigured || !isMiwillAppConfigured || !miwillDb) {
    throw new Error('Firebase is not configured.');
  }

  await ensureMiwillAppAuth();

  const docRef = await addDoc(collection(miwillDb, 'clients'), {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    dateOfBirth: input.dateOfBirth || null,
    idNumber: input.idNumber || null,
    willStatus: input.willStatus,
    profileCompletion: 0,
    assignedAgentId: input.assignedAgentId,
    assignedAgentName: input.assignedAgentName,
    notes: input.notes.trim(),
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
  });

  return mapFirestoreClientToAssignedUser({
    id: docRef.id,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    dateOfBirth: input.dateOfBirth || undefined,
    idNumber: input.idNumber || undefined,
    willStatus: input.willStatus,
    profileCompletion: 0,
    assignedAgentId: input.assignedAgentId,
    assignedAgentName: input.assignedAgentName,
    notes: input.notes.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

