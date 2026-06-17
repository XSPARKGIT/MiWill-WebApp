import {formatJoinedDate, toIsoTimestamp} from './firestoreTimestamps';

/** @typedef {'draft' | 'review' | 'submitted' | 'complete'} WillStatus */
/** @typedef {'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED'} LeadStage */

const DEFAULT_PROFILE_SECTIONS = [
  {key: 'personal', label: 'Personal info', complete: false},
  {key: 'assets', label: 'Assets', complete: false},
  {key: 'policies', label: 'Policies', complete: false},
  {key: 'beneficiaries', label: 'Beneficiaries', complete: false},
  {key: 'executors', label: 'Executors', complete: false},
];

export function isPortalStaffRecord(record) {
  const role = String(record.role ?? '').toLowerCase();
  return role === 'admin' || role === 'agent';
}

export function isAppClientRecord(record) {
  return !isPortalStaffRecord(record);
}

/** @param {unknown} status @returns {WillStatus} */
export function normalizeWillStatus(status) {
  const normalized = String(status ?? 'draft').toLowerCase().replace(/\s+/g, '_');
  if (normalized === 'complete' || normalized === 'completed') {
    return 'complete';
  }
  if (normalized === 'submitted') {
    return 'submitted';
  }
  if (normalized === 'review' || normalized === 'in_review') {
    return 'review';
  }
  return 'draft';
}

/** @param {unknown} stage @returns {LeadStage} */
export function normalizeLeadStage(stage) {
  const normalized = String(stage ?? 'NEW').toUpperCase().replace(/\s+/g, '_');
  if (normalized === 'CONTACTED') return 'CONTACTED';
  if (normalized === 'IN_PROGRESS' || normalized === 'INPROGRESS') return 'IN_PROGRESS';
  if (normalized === 'CLOSED') return 'CLOSED';
  return 'NEW';
}

function fullNameFromRecord(record) {
  const firstName = String(record.firstName ?? record.first_name ?? '').trim();
  const lastName = String(record.lastName ?? record.last_name ?? '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  return fullName || String(record.name ?? record.displayName ?? 'Unknown').trim();
}

/** @param {Record<string, unknown> & { id: string }} client */
export function mapFirestoreClientToAssignedUser(client) {
  const name = fullNameFromRecord(client);

  const completeness = Number(
    client.profileCompletion ??
      client.profileCompletionPct ??
      client.completeness ??
      client.profile_completion ??
      0,
  );

  const profileSections = Array.isArray(client.profileSections)
    ? client.profileSections
    : DEFAULT_PROFILE_SECTIONS;

  return {
    id: client.id,
    name,
    email: String(client.email ?? ''),
    phone: String(client.phone ?? client.phoneNumber ?? ''),
    dateOfBirth: client.dateOfBirth ? String(client.dateOfBirth) : undefined,
    idNumber: client.idNumber ? String(client.idNumber) : undefined,
    willStatus: normalizeWillStatus(client.willStatus ?? client.will_status),
    completeness: Number.isFinite(completeness) ? Math.max(0, Math.min(100, completeness)) : 0,
    lastUpdated: toIsoTimestamp(
      client.updatedAt ?? client.lastUpdated ?? client.last_updated ?? client.createdAt ?? client.created_at,
    ),
    profileSections,
    assetsSummary: String(client.assetsSummary ?? client.assets_summary ?? 'Not yet added.'),
    policiesSummary: String(client.policiesSummary ?? client.policies_summary ?? 'Not yet added.'),
    beneficiariesSummary: String(
      client.beneficiariesSummary ?? client.beneficiaries_summary ?? 'Not yet added.',
    ),
  };
}

/** @param {Record<string, unknown> & { id: string }} client */
export function mapFirestoreClientToWillRow(client) {
  return {
    ...mapFirestoreClientToAssignedUser(client),
    assignedAgent: String(
      client.assignedAgent ?? client.assigned_agent ?? client.agentName ?? client.agent_name ?? '—',
    ),
  };
}

/** @param {string} id @param {Record<string, unknown>} data */
export function mapPortalUser(id, data) {
  const name = fullNameFromRecord(data);
  return {
    id,
    name,
    email: String(data.email ?? ''),
    role: String(data.role ?? 'agent'),
    status: data.isActive === false ? 'disabled' : 'active',
    joined: formatJoinedDate(data.createdAt),
    lastActive: data.lastActive
      ? String(data.lastActive)
      : formatJoinedDate(data.updatedAt ?? data.createdAt),
  };
}

/** @param {Record<string, unknown> & { id: string }} record */
export function mapFirestoreLead(record) {
  const pipeline = String(record.pipeline ?? record.brand ?? 'miwill').toLowerCase();
  return {
    id: record.id,
    name: String(record.fullName ?? '').trim() || fullNameFromRecord(record),
    email: String(record.email ?? ''),
    phone: String(record.phone ?? record.phoneNumber ?? ''),
    stage: normalizeLeadStage(record.stage ?? record.leadStage ?? record.lead_stage),
    notes: String(record.notes ?? record.note ?? ''),
    createdAt: toIsoTimestamp(record.createdAt ?? record.created_at),
    agentName: String(
      record.assignedAgentName ?? record.agentName ?? record.agent_name ?? record.assignedAgent ?? '',
    ),
    brand: pipeline === 'capital' ? 'capital' : 'miwill',
  };
}

/** @param {Record<string, unknown> & { id: string }} record */
export function mapFirestoreActivity(record) {
  const type = String(record.type ?? record.actionType ?? record.action_type ?? 'note').toLowerCase();
  const normalizedType =
    type === 'call' || type === 'email' || type === 'meeting' ? type : 'email';

  return {
    id: record.id,
    userId: String(record.userId ?? record.user_id ?? record.clientId ?? record.client_id ?? ''),
    type: normalizedType,
    summary: String(record.summary ?? record.description ?? record.body ?? 'Activity logged.'),
    createdAt: toIsoTimestamp(record.createdAt ?? record.created_at ?? record.timestamp),
    agentName: String(record.agentName ?? record.agent_name ?? ''),
  };
}

/** @param {Record<string, unknown> & { id: string }} record */
export function mapFirestoreNote(record) {
  const type = String(record.type ?? 'note').toLowerCase();
  const normalizedType =
    type === 'call' || type === 'email' || type === 'meeting' || type === 'note'
      ? type
      : 'note';

  return {
    id: record.id,
    userId: String(record.userId ?? record.user_id ?? record.clientId ?? record.client_id ?? ''),
    authorName: String(record.authorName ?? record.author_name ?? record.agentName ?? 'Agent'),
    type: normalizedType,
    body: String(record.body ?? record.note ?? record.summary ?? ''),
    createdAt: toIsoTimestamp(record.createdAt ?? record.created_at),
    edited: Boolean(record.edited),
  };
}

/** @param {ReturnType<typeof mapFirestoreClientToAssignedUser>[]} users */
export function deriveNotificationsFromClients(users) {
  return users
    .slice()
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 12)
    .map((user) => ({
      id: `nt-${user.id}-${user.lastUpdated}`,
      title:
        user.willStatus === 'submitted'
          ? 'Will submitted'
          : user.willStatus === 'complete'
            ? 'Will completed'
            : 'Profile updated',
      body: `${user.name} · ${user.completeness}% complete`,
      read: false,
      createdAt: user.lastUpdated,
      scope: 'user',
    }));
}

/** @param {ReturnType<typeof mapFirestoreActivity>[]} activities @param {ReturnType<typeof mapFirestoreClientToAssignedUser>[]} users */
export function derivePlatformActivity(activities, users) {
  if (activities.length > 0) {
    return activities
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((activity) => {
        const client = users.find((user) => user.id === activity.userId);
        return {
          id: activity.id,
          agentName: activity.agentName || 'Agent',
          actionType: activity.type,
          client: client?.name ?? 'Client',
          timestamp: activity.createdAt,
        };
      });
  }

  return users
    .slice()
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 8)
    .map((user) => ({
      id: `pa-${user.id}`,
      agentName: 'Platform',
      actionType: user.willStatus === 'submitted' ? 'note' : 'email',
      client: user.name,
      timestamp: user.lastUpdated,
    }));
}

/** @param {ReturnType<typeof mapFirestoreClientToWillRow>[]} willRows @param {ReturnType<typeof mapFirestoreLead>[]} leads @param {ReturnType<typeof mapPortalUser>[]} portalUsers @param {ReturnType<typeof mapFirestoreActivity>[]} activities */
export function buildAdminOverviewStats(willRows, leads, portalUsers, activities) {
  const agents = portalUsers.filter((user) => user.role === 'agent' && user.status === 'active');
  const willsInProgress = willRows.filter((row) => row.willStatus !== 'complete').length;
  const completedThisMonth = willRows.filter((row) => {
    if (row.willStatus !== 'complete') return false;
    const updated = new Date(row.lastUpdated);
    const now = new Date();
    return updated.getMonth() === now.getMonth() && updated.getFullYear() === now.getFullYear();
  }).length;

  return [
    {label: 'Total Portal Users', value: portalUsers.length},
    {label: 'Total Active Agents', value: agents.length},
    {label: 'Total Leads', value: leads.length},
    {label: 'Total Wills in Progress', value: willsInProgress},
    {label: 'Completed Wills This Month', value: completedThisMonth},
    {label: 'Total Touchpoints (7D)', value: activities.length},
  ];
}

/** @param {ReturnType<typeof mapPortalUser>[]} portalUsers @param {ReturnType<typeof mapFirestoreClientToWillRow>[]} willRows @param {ReturnType<typeof mapFirestoreLead>[]} leads @param {ReturnType<typeof mapFirestoreActivity>[]} activities */
export function buildAgentPerformance(portalUsers, willRows, leads, activities) {
  return portalUsers
    .filter((user) => user.role === 'agent')
    .map((agent) => {
      const agentClients = willRows.filter((row) => row.assignedAgent === agent.name);
      const agentLeads = leads.filter((lead) => lead.agentName === agent.name);
      const agentActivities = activities
        .filter((entry) => entry.agentName === agent.name)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const touchpoints = {
        calls: agentActivities.filter((entry) => entry.type === 'call').length,
        emails: agentActivities.filter((entry) => entry.type === 'email').length,
        meetings: agentActivities.filter((entry) => entry.type === 'meeting').length,
      };
      const lastActivity = agentActivities[0]?.createdAt;

      return {
        id: agent.id,
        name: agent.name,
        assignedClients: agentClients.length,
        leadsHandled: agentLeads.length,
        touchpoints,
        lastActivity,
        timeline: agentActivities.slice(0, 6).map((entry) => ({
          id: entry.id,
          type: entry.type,
          summary: entry.summary,
          createdAt: entry.createdAt,
        })),
      };
    });
}

/** @param {ReturnType<typeof mapPortalUser>[]} portalUsers @param {ReturnType<typeof mapFirestoreClientToWillRow>[]} willRows @param {ReturnType<typeof mapFirestoreLead>[]} leads @param {ReturnType<typeof mapFirestoreActivity>[]} activities */
export function buildAgentViews(portalUsers, willRows, leads, activities) {
  return portalUsers
    .filter((user) => user.role === 'agent')
    .map((agent) => {
      const performance = buildAgentPerformance([agent], willRows, leads, activities)[0];
      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        status: agent.status,
        joined: agent.joined,
        lastActive: agent.lastActive,
        assignedClients: performance?.assignedClients ?? 0,
        leadsHandled: performance?.leadsHandled ?? 0,
        willsInProgress: willRows.filter(
          (row) => row.assignedAgent === agent.name && row.willStatus !== 'complete',
        ).length,
        touchpoints: performance?.touchpoints ?? {calls: 0, emails: 0, meetings: 0},
        lastActivity: performance?.lastActivity,
        timeline: performance?.timeline ?? [],
      };
    });
}
