/** @typedef {'admin' | 'agent'} PortalRole */
/** @typedef {'active' | 'disabled'} PortalUserStatus */
/** @typedef {'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED'} LeadStage */
/** @typedef {'draft' | 'review' | 'submitted' | 'complete'} WillStatus */

export const ADMIN_OVERVIEW_STATS = [
  {label: 'Total Portal Users', value: 5},
  {label: 'Total Active Agents', value: 3},
  {label: 'Total Leads', value: 12},
  {label: 'Total Wills in Progress', value: 6},
  {label: 'Completed Wills This Month', value: 4},
  {label: 'Total Touchpoints (7D)', value: 47},
];

export const ADMIN_PLATFORM_ACTIVITY = [
  {id: 'pa1', agentName: 'Thabo Nkosi', actionType: 'call', client: 'Lindiwe Nkosi', timestamp: '2026-06-08T10:30:00'},
  {id: 'pa2', agentName: 'Lindiwe Mokoena', actionType: 'email', client: 'James Pretorius', timestamp: '2026-06-08T09:15:00'},
  {id: 'pa3', agentName: 'Amelia Govender', actionType: 'note', client: 'Peter Moloi', timestamp: '2026-06-07T16:45:00'},
  {id: 'pa4', agentName: 'Thabo Nkosi', actionType: 'meeting', client: 'Sarah van der Berg', timestamp: '2026-06-07T14:00:00'},
  {id: 'pa5', agentName: 'Lindiwe Mokoena', actionType: 'call', client: 'Nomsa Dlamini', timestamp: '2026-06-07T11:20:00'},
  {id: 'pa6', agentName: 'Amelia Govender', actionType: 'email', client: 'Daniel Fourie', timestamp: '2026-06-06T15:30:00'},
  {id: 'pa7', agentName: 'Thabo Nkosi', actionType: 'call', client: 'Thabo Mokoena', timestamp: '2026-06-06T10:00:00'},
  {id: 'pa8', agentName: 'Lindiwe Mokoena', actionType: 'email', client: 'Amelia Govender', timestamp: '2026-06-05T13:45:00'},
];

export const ADMIN_PORTAL_USERS = [
  {id: 'pu1', name: 'Mpumelelo Dube', email: 'testaccount@gmail.com', role: 'admin', status: 'active', joined: '1 Jan 2025', lastActive: 'Today'},
  {id: 'pu2', name: 'Thabo Nkosi', email: 't.nkosi@miwill.co.za', role: 'agent', status: 'active', joined: '15 Feb 2025', lastActive: '2 days ago'},
  {id: 'pu3', name: 'Lindiwe Mokoena', email: 'l.mokoena@miwill.co.za', role: 'agent', status: 'active', joined: '3 Mar 2025', lastActive: 'Today'},
  {id: 'pu4', name: 'James Fourie', email: 'j.fourie@miwill.co.za', role: 'agent', status: 'disabled', joined: '20 Mar 2025', lastActive: '14 days ago'},
  {id: 'pu5', name: 'Amelia Govender', email: 'a.govender@miwill.co.za', role: 'agent', status: 'active', joined: '10 Apr 2025', lastActive: 'Yesterday'},
];

export const ADMIN_AGENT_PERFORMANCE = [
  {
    id: 'ap1',
    name: 'Thabo Nkosi',
    assignedClients: 8,
    leadsHandled: 14,
    touchpoints: {calls: 22, emails: 18, meetings: 4},
    lastActivity: '2026-06-08T10:30:00',
    timeline: [
      {id: 't1', type: 'call', summary: 'Follow-up with Lindiwe Nkosi', createdAt: '2026-06-08T10:30:00'},
      {id: 't2', type: 'email', summary: 'Sent signing checklist to Thabo Mokoena', createdAt: '2026-06-07T14:20:00'},
      {id: 't3', type: 'meeting', summary: 'Discovery call — Sarah van der Berg', createdAt: '2026-06-07T11:00:00'},
    ],
  },
  {
    id: 'ap2',
    name: 'Lindiwe Mokoena',
    assignedClients: 6,
    leadsHandled: 11,
    touchpoints: {calls: 15, emails: 21, meetings: 3},
    lastActivity: '2026-06-08T09:15:00',
    timeline: [
      {id: 't4', type: 'email', summary: 'Onboarding reminder — James Pretorius', createdAt: '2026-06-08T09:15:00'},
      {id: 't5', type: 'call', summary: 'Beneficiary form check-in', createdAt: '2026-06-07T16:00:00'},
    ],
  },
  {
    id: 'ap3',
    name: 'Amelia Govender',
    assignedClients: 7,
    leadsHandled: 9,
    touchpoints: {calls: 19, emails: 14, meetings: 5},
    lastActivity: '2026-06-07T16:45:00',
    timeline: [
      {id: 't6', type: 'note', summary: 'Flagged business clause for review', createdAt: '2026-06-07T16:45:00'},
      {id: 't7', type: 'email', summary: 'Policy PDF request sent', createdAt: '2026-06-06T15:30:00'},
    ],
  },
];

export const ADMIN_LEADS = [
  {id: 'al1', name: 'Karen Swanepoel', email: 'k.swan@email.com', phone: '+27 82 111 2233', stage: 'NEW', notes: 'Referral from advisor.', agentName: 'Thabo Nkosi', brand: 'miwill', createdAt: '2026-04-28T09:00:00'},
  {id: 'al2', name: 'Michael Xu', email: 'mxu@email.com', phone: '+27 72 444 5566', stage: 'NEW', notes: 'Website inquiry.', agentName: 'Lindiwe Mokoena', brand: 'miwill', createdAt: '2026-05-01T11:20:00'},
  {id: 'al3', name: 'Zanele Khumalo', email: 'z.khumalo@email.com', phone: '+27 83 777 8899', stage: 'CONTACTED', notes: 'Left voicemail.', agentName: 'Amelia Govender', brand: 'capital', createdAt: '2026-04-22T14:00:00'},
  {id: 'al4', name: 'Robert Haumann', email: 'r.haumann@email.com', phone: '+27 84 333 1020', stage: 'CONTACTED', notes: 'Scheduled callback.', agentName: 'Thabo Nkosi', brand: 'capital', createdAt: '2026-04-25T16:30:00'},
  {id: 'al5', name: 'Priya Naidoo', email: 'priya.n@email.com', phone: '+27 79 555 4411', stage: 'IN_PROGRESS', notes: 'Discovery call completed.', agentName: 'Lindiwe Mokoena', brand: 'miwill', createdAt: '2026-04-18T10:00:00'},
  {id: 'al6', name: 'Chris Botha', email: 'c.botha@email.com', phone: '+27 76 222 9988', stage: 'IN_PROGRESS', notes: 'Awaiting documents.', agentName: 'Amelia Govender', brand: 'miwill', createdAt: '2026-04-30T08:45:00'},
  {id: 'al7', name: 'Ayanda Mbatha', email: 'a.mbatha@email.com', phone: '+27 71 888 3344', stage: 'IN_PROGRESS', notes: 'Trial started.', agentName: 'Thabo Nkosi', brand: 'capital', createdAt: '2026-05-02T13:15:00'},
  {id: 'al8', name: 'Helena Steyn', email: 'h.steyn@email.com', phone: '+27 82 666 1200', stage: 'CLOSED', notes: 'Converted.', agentName: 'Lindiwe Mokoena', brand: 'miwill', createdAt: '2026-03-10T12:00:00'},
  {id: 'al9', name: 'Victor Mensah', email: 'v.mensah@email.com', phone: '+27 73 999 5566', stage: 'CLOSED', notes: 'Referred out.', agentName: 'Amelia Govender', brand: 'capital', createdAt: '2026-04-05T15:00:00'},
  {id: 'al10', name: 'Tiffany Cloete', email: 't.cloete@email.com', phone: '+27 81 432 8765', stage: 'NEW', notes: 'Cold outreach reply.', agentName: 'Thabo Nkosi', brand: 'miwill', createdAt: '2026-05-03T07:30:00'},
  {id: 'al11', name: 'Sipho Maseko', email: 's.maseko@email.com', phone: '+27 78 222 3344', stage: 'CONTACTED', notes: 'Capital Legacy webinar lead.', agentName: 'Lindiwe Mokoena', brand: 'capital', createdAt: '2026-05-10T09:00:00'},
  {id: 'al12', name: 'Grace Pillay', email: 'g.pillay@email.com', phone: '+27 82 999 1122', stage: 'NEW', notes: 'MiWill app download.', agentName: 'Amelia Govender', brand: 'miwill', createdAt: '2026-06-01T08:00:00'},
];

export const ADMIN_WILL_CLIENTS = [
  {id: 'wc1', name: 'Thabo Mokoena', email: 'thabo.m@email.com', phone: '+27 82 555 0142', assignedAgent: 'Thabo Nkosi', willStatus: 'complete', completeness: 100, lastUpdated: '2026-05-03T07:00:00', dateOfBirth: '1985-03-14', idNumber: '8503145800085', profileSections: [{key: 'personal', label: 'Personal info', complete: true}, {key: 'assets', label: 'Assets', complete: true}, {key: 'policies', label: 'Policies', complete: true}, {key: 'beneficiaries', label: 'Beneficiaries', complete: true}, {key: 'executors', label: 'Executors', complete: true}], assetsSummary: 'Property, vehicle, retirement funds.', policiesSummary: 'Life policy MiWill-8842.', beneficiariesSummary: 'Spouse and two children.'},
  {id: 'wc2', name: 'Lindiwe Nkosi', email: 'lindiwe.nkosi@email.com', phone: '+27 71 444 2290', assignedAgent: 'Lindiwe Mokoena', willStatus: 'submitted', completeness: 88, lastUpdated: '2026-05-02T14:22:00', dateOfBirth: '1990-11-02', idNumber: '9011024800083', profileSections: [{key: 'personal', label: 'Personal info', complete: true}, {key: 'assets', label: 'Assets', complete: true}, {key: 'policies', label: 'Policies', complete: true}, {key: 'beneficiaries', label: 'Beneficiaries', complete: true}, {key: 'executors', label: 'Executors', complete: false}], assetsSummary: 'Townhouse, unit trusts.', policiesSummary: 'Group life via employer.', beneficiariesSummary: 'Partner, sibling contingency.'},
  {id: 'wc3', name: 'Sarah van der Berg', email: 'svberg@email.com', phone: '+27 83 201 9934', assignedAgent: 'Thabo Nkosi', willStatus: 'review', completeness: 62, lastUpdated: '2026-04-30T16:00:00', dateOfBirth: '1978-07-21', profileSections: [{key: 'personal', label: 'Personal info', complete: true}, {key: 'assets', label: 'Assets', complete: true}, {key: 'policies', label: 'Policies', complete: false}, {key: 'beneficiaries', label: 'Beneficiaries', complete: true}, {key: 'executors', label: 'Executors', complete: false}], assetsSummary: 'Investment portfolio.', policiesSummary: 'Pending verification.', beneficiariesSummary: 'Parents, charitable 5%.'},
  {id: 'wc4', name: 'James Pretorius', email: 'j.pretorius@email.com', phone: '+27 84 112 7788', assignedAgent: 'Amelia Govender', willStatus: 'draft', completeness: 35, lastUpdated: '2026-05-01T09:10:00', dateOfBirth: '1995-01-08', profileSections: [{key: 'personal', label: 'Personal info', complete: true}, {key: 'assets', label: 'Assets', complete: false}, {key: 'policies', label: 'Policies', complete: false}, {key: 'beneficiaries', label: 'Beneficiaries', complete: false}, {key: 'executors', label: 'Executors', complete: false}], assetsSummary: 'Incomplete — real estate only.', policiesSummary: 'Not added.', beneficiariesSummary: 'Draft placeholders.'},
  {id: 'wc5', name: 'Nomsa Dlamini', email: 'nomsa.d@email.com', phone: '+27 72 900 4412', assignedAgent: 'Lindiwe Mokoena', willStatus: 'complete', completeness: 96, lastUpdated: '2026-04-27T10:15:00', dateOfBirth: '1982-09-30', idNumber: '8209304800087', profileSections: [{key: 'personal', label: 'Personal info', complete: true}, {key: 'assets', label: 'Assets', complete: true}, {key: 'policies', label: 'Policies', complete: true}, {key: 'beneficiaries', label: 'Beneficiaries', complete: true}, {key: 'executors', label: 'Executors', complete: true}], assetsSummary: 'Farm share, savings.', policiesSummary: 'Two policies consolidated.', beneficiariesSummary: 'Children, trust for minors.'},
  {id: 'wc6', name: 'Daniel Fourie', email: 'daniel.fourie@email.com', phone: '+27 76 334 1200', assignedAgent: 'Thabo Nkosi', willStatus: 'draft', completeness: 22, lastUpdated: '2026-04-25T08:00:00', profileSections: [{key: 'personal', label: 'Personal info', complete: false}, {key: 'assets', label: 'Assets', complete: false}, {key: 'policies', label: 'Policies', complete: false}, {key: 'beneficiaries', label: 'Beneficiaries', complete: false}, {key: 'executors', label: 'Executors', complete: false}], assetsSummary: 'Minimal entries.', policiesSummary: 'Missing.', beneficiariesSummary: 'Missing.'},
  {id: 'wc7', name: 'Amelia Govender', email: 'amelia.g@email.com', phone: '+27 79 556 8811', assignedAgent: 'Amelia Govender', willStatus: 'review', completeness: 74, lastUpdated: '2026-04-29T11:30:00', dateOfBirth: '1988-04-17', profileSections: [{key: 'personal', label: 'Personal info', complete: true}, {key: 'assets', label: 'Assets', complete: true}, {key: 'policies', label: 'Policies', complete: true}, {key: 'beneficiaries', label: 'Beneficiaries', complete: true}, {key: 'executors', label: 'Executors', complete: false}], assetsSummary: 'Business interest flagged.', policiesSummary: 'Key-person policy.', beneficiariesSummary: 'Spouse + business partner.'},
  {id: 'wc8', name: 'Peter Moloi', email: 'p.moloi@email.com', phone: '+27 81 667 3021', assignedAgent: 'Lindiwe Mokoena', willStatus: 'submitted', completeness: 91, lastUpdated: '2026-05-02T18:00:00', dateOfBirth: '1975-12-05', idNumber: '7512055800081', profileSections: [{key: 'personal', label: 'Personal info', complete: true}, {key: 'assets', label: 'Assets', complete: true}, {key: 'policies', label: 'Policies', complete: true}, {key: 'beneficiaries', label: 'Beneficiaries', complete: true}, {key: 'executors', label: 'Executors', complete: true}], assetsSummary: 'Complete asset inventory.', policiesSummary: 'Medical aid gap cover noted.', beneficiariesSummary: 'Standard hierarchical.'},
];

export const ADMIN_NOTIFICATIONS = [
  {id: 'an1', title: 'New agent signup', body: 'Amelia Govender completed registration.', read: false, createdAt: '2026-06-08T08:00:00'},
  {id: 'an2', title: 'Will submitted', body: 'Peter Moloi submitted for review.', read: false, createdAt: '2026-06-07T18:00:00'},
  {id: 'an3', title: 'Lead converted', body: 'Helena Steyn moved to assigned users.', read: true, createdAt: '2026-06-07T12:00:00'},
  {id: 'an4', title: 'Account disabled', body: 'James Fourie account deactivated.', read: false, createdAt: '2026-06-06T09:00:00'},
  {id: 'an5', title: 'Platform milestone', body: '4 wills completed this month.', read: true, createdAt: '2026-06-05T14:00:00'},
];

export const ADMIN_ACCESS_TABLE = [
  {page: 'Overview', admin: true, agent: true},
  {page: 'My Users / Wills', admin: true, agent: true},
  {page: 'Leads', admin: true, agent: true},
  {page: 'Engagement', admin: true, agent: true},
  {page: 'Notes', admin: true, agent: true},
  {page: 'Notifications', admin: true, agent: true},
  {page: 'Admin Panel', admin: true, agent: false},
  {page: 'Admin Dashboard (/admin-dashboard)', admin: true, agent: false},
  {page: 'Create accounts (/signup)', admin: true, agent: false},
];
