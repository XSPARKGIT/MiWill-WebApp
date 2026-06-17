import type {ReactNode} from 'react';
import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AddLeadModal} from '../../components/portal/AddLeadModal';
import {PortalToastProvider, usePortalToast} from '../../components/portal/PortalToast';
import {useAuth} from '../../auth/AuthContext';
import {useDashboardData} from '../../context/DashboardDataContext';
import {updateLeadStage} from '../../services/leadsService';
import {AgentProfileModal} from './components/AgentProfileModal';
import {AgentHeader} from './components/Header';
import {AgentSidebar, sectionsForRole} from './components/Sidebar';
import {UserDetailDrawer} from './components/UserDrawer';
import {AdminPanelSection} from './sections/AdminPanelSection';
import {EngagementSection} from './sections/EngagementSection';
import {LeadsSection} from './sections/LeadsSection';
import {NotesSection} from './sections/NotesSection';
import {NotificationsSection} from './sections/NotificationsSection';
import {OverviewSection} from './sections/OverviewSection';
import {UsersSection} from './sections/UsersSection';
import type {ActivityEntry, AssignedUser, DashboardNote, DashboardSection, Lead, LeadStage, NoteEntryType, NotificationItem} from './types';

function AgentDashboardContent() {
  const navigate = useNavigate();
  const {profile, signOutUser} = useAuth();
  const {showToast} = usePortalToast();
  const {
    assignedUsers,
    leads: firestoreLeads,
    activities: firestoreActivities,
    notes: firestoreNotes,
    notifications: firestoreNotifications,
    appendLead,
  } = useDashboardData();
  const role = profile?.role ?? 'agent';
  const allowedSections = useMemo(() => sectionsForRole(role), [role]);
  const [section, setSection] = useState<DashboardSection>('overview');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [notes, setNotes] = useState<DashboardNote[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setLeads(firestoreLeads);
  }, [firestoreLeads]);

  useEffect(() => {
    setActivities(firestoreActivities);
  }, [firestoreActivities]);

  useEffect(() => {
    setNotes(firestoreNotes);
  }, [firestoreNotes]);

  useEffect(() => {
    setNotifications(firestoreNotifications);
  }, [firestoreNotifications]);

  useEffect(() => {
    if (!allowedSections.includes(section)) {
      setSection('overview');
    }
  }, [allowedSections, section]);

  async function handleSignOut() {
    await signOutUser();
    navigate('/login', {replace: true});
  }

  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<AssignedUser | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  const agentName = useMemo(
    () => [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.email || 'Agent',
    [profile?.firstName, profile?.lastName, profile?.email],
  );

  const agentInitials = useMemo(() => {
    const parts = agentName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return agentName.slice(0, 2).toUpperCase() || 'AG';
  }, [agentName]);

  function onStageChange(leadId: string, stage: LeadStage) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? {...l, stage} : l)));
    void updateLeadStage(leadId, stage).catch((error) => {
      console.error('updateLeadStage failed:', error);
      showToast('Could not save lead stage change');
      setLeads(firestoreLeads);
    });
  }

  function onLogInteraction(userId: string, type: 'call' | 'email') {
    const summary =
      type === 'call' ? 'Call logged from dashboard.' : 'Email touch logged from dashboard.';
    const entry: ActivityEntry = {
      id: `a-${Date.now()}`,
      userId,
      type,
      summary,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [entry, ...prev]);
  }

  function onAddNote(userId: string, body: string, type: NoteEntryType) {
    const note: DashboardNote = {
      id: `n-${Date.now()}`,
      userId,
      authorName: agentName,
      type,
      body,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
  }

  function onEditNote(id: string, body: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? {...n, body, edited: true} : n)),
    );
  }

  function onMarkRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? {...n, read: true} : n)));
  }

  function onMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({...n, read: true})));
  }

  let body: ReactNode = null;
  switch (section) {
    case 'overview':
      body = <OverviewSection users={assignedUsers} leads={leads} activities={activities} />;
      break;
    case 'users':
      body = <UsersSection onRowClick={setDrawerUser} />;
      break;
    case 'leads':
      body = (
        <LeadsSection
          leads={leads}
          onStageChange={onStageChange}
          onAddLead={() => setAddLeadOpen(true)}
        />
      );
      break;
    case 'engagement':
      body = (
        <EngagementSection users={assignedUsers} activities={activities} onLogInteraction={onLogInteraction} />
      );
      break;
    case 'notes':
      body = <NotesSection users={assignedUsers} notes={notes} onAddNote={onAddNote} onEditNote={onEditNote} />;
      break;
    case 'notifications':
      body = (
        <NotificationsSection notifications={notifications} onMarkRead={onMarkRead} onMarkAllRead={onMarkAllRead} />
      );
      break;
    case 'admin':
      body = role === 'admin' ? <AdminPanelSection /> : null;
      break;
    default:
      body = null;
  }

  return (
    <div className="agent-dashboard agent-dashboard-canvas min-h-screen text-[15px] leading-relaxed text-[#1E2D3D]">
      <AgentSidebar active={section} role={role} onNavigate={setSection} onLogoHome={() => setSection('overview')} />

      <div className="ml-16 flex min-h-screen flex-col md:ml-[240px]">
        <AgentHeader
          section={section}
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
          onMarkRead={onMarkRead}
          agentName={agentName}
          agentEmail={profile?.email ?? ''}
          agentInitials={agentInitials}
          agentPhotoUrl={profilePhotoUrl}
          userRole={role}
          onOpenProfile={() => setProfileModalOpen(true)}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{body}</main>
      </div>

      <AgentProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        fullName={agentName}
        email={profile?.email ?? ''}
        phone={null}
        initials={agentInitials}
        photoUrl={profilePhotoUrl}
        onPhotoSelected={setProfilePhotoUrl}
      />

      <UserDetailDrawer
        user={drawerUser}
        activities={activities.filter((a) => a.userId === drawerUser?.id)}
        notes={notes.filter((n) => n.userId === drawerUser?.id)}
        onClose={() => setDrawerUser(null)}
      />

      <AddLeadModal
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        onSuccess={(lead) => {
          appendLead(lead);
          setLeads((prev) => [lead, ...prev]);
          showToast('Lead added successfully');
        }}
      />
    </div>
  );
}

export function AgentDashboardPage() {
  return (
    <PortalToastProvider>
      <AgentDashboardContent />
    </PortalToastProvider>
  );
}
