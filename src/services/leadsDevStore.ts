import type {LeadPipeline, LeadStage} from './leadsService';

const STORAGE_KEY = 'miwill_portal_leads_dev';

export type StoredLead = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  pipeline: LeadPipeline;
  brand: LeadPipeline;
  stage: LeadStage;
  source: string;
  notes: string;
  assignedAgentId: string;
  assignedAgentName: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
};

function readAll(): StoredLead[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(leads: StoredLead[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function readDevLeads(): StoredLead[] {
  return readAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function appendDevLead(lead: StoredLead) {
  writeAll([lead, ...readAll()]);
}

export function updateDevLeadStage(leadId: string, stage: LeadStage) {
  const leads = readAll();
  const index = leads.findIndex((lead) => lead.id === leadId);
  if (index === -1) {
    return false;
  }

  leads[index] = {...leads[index], stage};
  writeAll(leads);
  return true;
}

export function buildStoredLead(id: string, input: {
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
}): StoredLead {
  return {
    id,
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
    createdAt: new Date().toISOString(),
    isActive: true,
  };
}

export function isPermissionDenied(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied');
}
