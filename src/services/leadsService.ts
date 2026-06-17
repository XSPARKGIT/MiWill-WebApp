import {addDoc, collection, doc, getDocs, serverTimestamp, updateDoc} from 'firebase/firestore';
import {getPortalFirebaseAuth, getPortalFirebaseDb, isFirebaseConfigured} from '../firebase/client';
import {mapFirestoreLead} from '../utils/firestoreMappers';
import {
  appendDevLead,
  buildStoredLead,
  isPermissionDenied,
  readDevLeads,
  updateDevLeadStage,
} from './leadsDevStore';

/** Portal Firestore collection — created automatically on first write. */
export const PORTAL_LEADS_COLLECTION = 'leads';

export type LeadPipeline = 'miwill' | 'capital';

export type LeadStage = 'new' | 'contacted' | 'in_progress' | 'closed';

/** UI/dashboard stages use uppercase; Firestore stores lowercase snake_case. */
export function toStorageLeadStage(stage: string): LeadStage {
  const normalized = String(stage ?? 'new').toLowerCase().replace(/\s+/g, '_');
  if (normalized === 'contacted') return 'contacted';
  if (normalized === 'in_progress' || normalized === 'inprogress') return 'in_progress';
  if (normalized === 'closed') return 'closed';
  return 'new';
}

export type CreateLeadInput = {
  fullName: string;
  phone: string;
  email: string;
  pipeline: LeadPipeline;
  stage: LeadStage;
  source: string;
  notes: string;
  assignedAgentId: string;
  assignedAgentName: string;
  createdBy: string;
};

const USE_DEV_ADMIN_PROXY =
  import.meta.env.DEV && import.meta.env.VITE_PORTAL_LEADS_ADMIN_PROXY !== 'false';

export function getPortalActorId(): string | null {
  if (!isFirebaseConfigured) {
    return null;
  }

  const auth = getPortalFirebaseAuth();
  return auth?.currentUser?.uid ?? null;
}

function getPortalDbOrThrow() {
  const db = getPortalFirebaseDb();
  if (!db || !isFirebaseConfigured) {
    throw new Error('Portal Firebase is not configured.');
  }
  return db;
}

async function getPortalIdToken(): Promise<string | null> {
  const auth = getPortalFirebaseAuth();
  const user = auth?.currentUser;
  if (!user) {
    return null;
  }

  return user.getIdToken();
}

function buildLeadDocument(input: CreateLeadInput) {
  return {
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    pipeline: input.pipeline,
    brand: input.pipeline,
    stage: input.stage,
    source: input.source.trim(),
    notes: input.notes.trim(),
    assignedAgentId: input.assignedAgentId,
    assignedAgentName: input.assignedAgentName,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    isActive: true,
  };
}

function mapCreatedLead(id: string, input: CreateLeadInput) {
  return mapFirestoreLead({
    id,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    pipeline: input.pipeline,
    brand: input.pipeline,
    stage: input.stage,
    source: input.source.trim(),
    notes: input.notes.trim(),
    assignedAgentId: input.assignedAgentId,
    assignedAgentName: input.assignedAgentName,
    createdAt: new Date().toISOString(),
  });
}

async function createLeadViaAdminProxy(input: CreateLeadInput) {
  const token = await getPortalIdToken();
  if (!token) {
    throw new Error('Missing portal auth session.');
  }

  const response = await fetch('/__portal/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof payload.error === 'string' ? payload.error : 'Portal leads admin proxy unavailable.',
    );
  }

  return mapFirestoreLead(payload);
}

async function fetchPortalLeadsViaAdminProxy() {
  const token = await getPortalIdToken();
  if (!token) {
    throw new Error('Missing portal auth session.');
  }

  const response = await fetch('/__portal/leads', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Portal leads admin proxy unavailable.';
    throw new Error(message);
  }

  return (Array.isArray(payload) ? payload : []).map((record) => mapFirestoreLead(record));
}

/**
 * Creates a lead in portal Firestore (`leads` collection).
 * Firestore creates the collection on the first document write.
 */
export async function createLead(input: CreateLeadInput) {
  if (USE_DEV_ADMIN_PROXY) {
    try {
      return await createLeadViaAdminProxy(input);
    } catch (proxyError) {
      console.warn('createLead admin proxy failed, falling back to client SDK:', proxyError);
    }
  }

  try {
    const db = getPortalDbOrThrow();
    const docRef = await addDoc(collection(db, PORTAL_LEADS_COLLECTION), buildLeadDocument(input));
    return mapCreatedLead(docRef.id, input);
  } catch (error) {
    if (import.meta.env.DEV && isPermissionDenied(error)) {
      const stored = buildStoredLead(`local-${Date.now()}`, input);
      appendDevLead(stored);
      console.warn(
        'createLead: saved to local dev store because Firestore rules blocked the write. ' +
          'Run: firebase login && npm run firebase:deploy:portal-rules',
      );
      return mapFirestoreLead(stored);
    }

    throw error;
  }
}

/** Fetches all leads from the portal `leads` collection. */
export async function fetchPortalLeads() {
  if (USE_DEV_ADMIN_PROXY) {
    try {
      return await fetchPortalLeadsViaAdminProxy();
    } catch (proxyError) {
      console.warn('fetchPortalLeads admin proxy failed, falling back to client SDK:', proxyError);
    }
  }

  try {
    const db = getPortalDbOrThrow();
    const snap = await getDocs(collection(db, PORTAL_LEADS_COLLECTION));
    const cloudLeads = snap.docs.map((docSnap) => mapFirestoreLead({id: docSnap.id, ...docSnap.data()}));

    if (import.meta.env.DEV) {
      const localOnly = readDevLeads().filter(
        (lead) => !cloudLeads.some((cloudLead) => cloudLead.id === lead.id),
      );
      return [...cloudLeads, ...localOnly.map((lead) => mapFirestoreLead(lead))].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return cloudLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    if (import.meta.env.DEV && isPermissionDenied(error)) {
      return readDevLeads().map((lead) => mapFirestoreLead(lead));
    }

    throw error;
  }
}

/** Updates a lead's pipeline stage in portal Firestore. */
export async function updateLeadStage(leadId: string, stage: string) {
  const storageStage = toStorageLeadStage(stage);
  if (!leadId || leadId.startsWith('local-')) {
    if (import.meta.env.DEV && updateDevLeadStage(leadId, storageStage)) {
      return;
    }
    throw new Error('Cannot update this lead in Firestore.');
  }

  try {
    const db = getPortalDbOrThrow();
    await updateDoc(doc(db, PORTAL_LEADS_COLLECTION, leadId), {stage: storageStage});
  } catch (error) {
    if (import.meta.env.DEV && isPermissionDenied(error)) {
      if (updateDevLeadStage(leadId, storageStage)) {
        console.warn(
          'updateLeadStage: saved to local dev store because Firestore rules blocked the write. ' +
            'Run: firebase login && npm run firebase:deploy:portal-rules',
        );
        return;
      }
    }

    throw error;
  }
}
