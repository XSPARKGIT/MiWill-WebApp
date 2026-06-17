import type {ReactNode} from 'react';
import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {createManagedUserAccount} from '../../auth/authService';
import {useAuth} from '../../auth/AuthContext';
import {AddClientModal} from '../../components/portal/AddClientModal';
import {CreateAgentModal} from '../../components/portal/CreateAgentModal';
import {PortalToastProvider, usePortalToast} from '../../components/portal/PortalToast';
import {useDashboardData} from '../../context/DashboardDataContext';
import {useAgents} from '../../hooks/useAgents';
import {UserDetailDrawer} from '../agent-dashboard/components/UserDrawer';
import type {AssignedUser} from '../agent-dashboard/types';
import {AdminCreateUserModal, type NewPortalUserInput} from './components/AdminCreateUserModal';
import {AdminAgentDetailDrawer, type AdminAgentView} from './components/AdminAgentDetailDrawer';
import {AdminHeader} from './components/AdminHeader';
import {AdminSidebar} from './components/AdminSidebar';
import {AdminAgentPerformanceSection} from './sections/AdminAgentPerformanceSection';
import {AdminAgentsSection} from './sections/AdminAgentsSection';
import {AdminLeadsOverviewSection} from './sections/AdminLeadsOverviewSection';
import {AdminOverviewSection} from './sections/AdminOverviewSection';
import {AdminSettingsSection} from './sections/AdminSettingsSection';
import {AdminUsersSection} from './sections/AdminUsersSection';
import type {AdminNotification, AdminSection} from './types';

type UsersTab = 'portal' | 'registered';

function agentNameFromRecord(agent: Record<string, unknown>) {
  const firstName = String(agent.firstName ?? agent.first_name ?? '').trim();
  const lastName = String(agent.lastName ?? agent.last_name ?? '').trim();
  return [firstName, lastName].filter(Boolean).join(' ') || String(agent.name ?? 'Agent');
}

function AdminDashboardContent() {
  const navigate = useNavigate();
  const {profile, signOutUser} = useAuth();
  const {showToast} = usePortalToast();
  const {
    portalUsers,
    activities,
    notes,
    notifications: firestoreNotifications,
    refetchPortalUsers,
    appendClient,
  } = useDashboardData();
  const {agents, refetch: refetchAgents} = useAgents();
  const [section, setSection] = useState<AdminSection>('overview');
  const [usersTab, setUsersTab] = useState<UsersTab>('registered');
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [createUserLockRole, setCreateUserLockRole] = useState<'admin' | 'agent' | undefined>(undefined);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [drawerUser, setDrawerUser] = useState<AssignedUser | null>(null);
  const [drawerAgent, setDrawerAgent] = useState<AdminAgentView | null>(null);
  const [createUserError, setCreateUserError] = useState('');
  const [performanceRefreshKey, setPerformanceRefreshKey] = useState(0);

  const agentOptions = useMemo(
    () => agents.map((agent) => ({id: String(agent.id), name: agentNameFromRecord(agent)})),
    [agents],
  );

  useEffect(() => {
    setNotifications(
      firestoreNotifications.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        read: item.read,
        createdAt: item.createdAt,
      })),
    );
  }, [firestoreNotifications]);

  const adminName = useMemo(
    () => [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.email || 'Admin',
    [profile?.firstName, profile?.lastName, profile?.email],
  );

  const adminInitials = useMemo(() => {
    const parts = adminName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return adminName.slice(0, 2).toUpperCase() || 'AD';
  }, [adminName]);

  async function handleSignOut() {
    await signOutUser();
    navigate('/login', {replace: true});
  }

  function onMarkRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? {...n, read: true} : n)));
  }

  function onMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({...n, read: true})));
  }

  async function onToggleUserStatus(id: string) {
    void id;
  }

  async function onDeleteUser(id: string) {
    void id;
  }

  async function onCreatePortalUser(input: NewPortalUserInput) {
    setCreateUserError('');
    const parts = input.name.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? input.name.trim();
    const lastName = parts.slice(1).join(' ');

    try {
      await createManagedUserAccount({
        firstName,
        lastName,
        email: input.email,
        password: input.password,
        role: input.role,
      });
      refetchPortalUsers();
    } catch (error) {
      setCreateUserError(error instanceof Error ? error.message : 'Unable to create user.');
      throw error;
    }
  }

  function openCreateUser() {
    setCreateUserLockRole(undefined);
    setCreateUserOpen(true);
  }

  function openCreateAgent() {
    setCreateAgentOpen(true);
  }

  function openAddClient() {
    setUsersTab('registered');
    setSection('users');
    setAddClientOpen(true);
  }

  function openRegisteredUsers() {
    setUsersTab('registered');
    setSection('users');
  }

  function openAgents() {
    setSection('agents');
  }

  let body: ReactNode = null;
  switch (section) {
    case 'overview':
      body = (
        <AdminOverviewSection
          onAddAgent={openCreateAgent}
          onAddClient={openAddClient}
          onViewAgents={openAgents}
          onViewClients={openRegisteredUsers}
        />
      );
      break;
    case 'users':
      body = (
        <AdminUsersSection
          activeTab={usersTab}
          onTabChange={setUsersTab}
          portalUsers={portalUsers}
          onCreateUser={openCreateUser}
          onToggleStatus={onToggleUserStatus}
          onDelete={onDeleteUser}
          onClientClick={setDrawerUser}
          onCreateAgent={openCreateAgent}
          onAddClient={() => setAddClientOpen(true)}
        />
      );
      break;
    case 'agents':
      body = <AdminAgentsSection onAgentClick={setDrawerAgent} />;
      break;
    case 'performance':
      body = <AdminAgentPerformanceSection key={performanceRefreshKey} onCreateAgent={openCreateAgent} />;
      break;
    case 'leads':
      body = <AdminLeadsOverviewSection />;
      break;
    case 'settings':
      body = (
        <AdminSettingsSection
          adminName={adminName}
          adminEmail={profile?.email ?? ''}
          onSignOut={() => void handleSignOut()}
        />
      );
      break;
    default:
      body = null;
  }

  return (
    <div className="agent-dashboard agent-dashboard-canvas min-h-screen text-[15px] leading-relaxed text-[#1E2D3D]">
      <AdminSidebar
        active={section}
        adminName={adminName}
        adminInitials={adminInitials}
        onNavigate={setSection}
        onLogoHome={() => setSection('overview')}
      />

      <div className="ml-[200px] flex min-h-screen flex-col">
        <AdminHeader
          section={section}
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
          onMarkRead={onMarkRead}
          adminName={adminName}
          adminInitials={adminInitials}
          adminPhotoUrl={null}
          onSignOut={() => void handleSignOut()}
        />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{body}</main>
      </div>

      <UserDetailDrawer
        user={drawerUser}
        activities={activities.filter((a) => a.userId === drawerUser?.id)}
        notes={notes.filter((n) => n.userId === drawerUser?.id)}
        onClose={() => setDrawerUser(null)}
        readOnly
      />

      <AdminAgentDetailDrawer agent={drawerAgent} onClose={() => setDrawerAgent(null)} />

      <AdminCreateUserModal
        open={createUserOpen}
        onClose={() => {
          setCreateUserOpen(false);
          setCreateUserError('');
        }}
        onCreate={onCreatePortalUser}
        lockRole={createUserLockRole}
        errorMessage={createUserError}
      />

      <CreateAgentModal
        open={createAgentOpen}
        onClose={() => setCreateAgentOpen(false)}
        onSuccess={(agent) => {
          refetchPortalUsers();
          refetchAgents();
          setPerformanceRefreshKey((key) => key + 1);
          showToast('Agent account created successfully');
          void agent;
        }}
      />

      <AddClientModal
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
        agents={agentOptions}
        onSuccess={(client) => {
          appendClient(client);
          showToast('Client added successfully');
        }}
      />
    </div>
  );
}

export function AdminDashboardPage() {
  return (
    <PortalToastProvider>
      <AdminDashboardContent />
    </PortalToastProvider>
  );
}
