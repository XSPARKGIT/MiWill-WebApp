export type WillStatus = 'draft' | 'review' | 'submitted' | 'complete';

export type LeadStage = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED';

export type DashboardSection =
  | 'overview'
  | 'users'
  | 'leads'
  | 'engagement'
  | 'notes'
  | 'notifications'
  | 'admin';

export type ProfileSectionKey = 'personal' | 'assets' | 'policies' | 'beneficiaries' | 'executors';

export interface ProfileSectionProgress {
  key: ProfileSectionKey;
  label: string;
  complete: boolean;
}

export interface AssignedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  idNumber?: string;
  willStatus: WillStatus;
  completeness: number;
  lastUpdated: string;
  profileSections: ProfileSectionProgress[];
  assetsSummary: string;
  policiesSummary: string;
  beneficiariesSummary: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: LeadStage;
  notes: string;
  createdAt: string;
  brand?: string;
  agentName?: string;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  type: 'call' | 'email' | 'meeting';
  summary: string;
  createdAt: string;
}

export type NoteEntryType = 'call' | 'email' | 'meeting' | 'note';

export interface DashboardNote {
  id: string;
  userId: string;
  authorName: string;
  type: NoteEntryType;
  body: string;
  createdAt: string;
  edited?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  scope: 'user' | 'lead';
}
