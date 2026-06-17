import {createContext, useContext, useMemo} from 'react';
import {useClients} from '../hooks/useClients';
import {useMiwillCollections} from '../hooks/useMiwillCollections';
import {usePortalLeads} from '../hooks/usePortalLeads';
import {usePortalUsers} from '../hooks/usePortalUsers';
import {
  buildAdminOverviewStats,
  buildAgentPerformance,
  buildAgentViews,
  deriveNotificationsFromClients,
  derivePlatformActivity,
} from '../utils/firestoreMappers';

const DashboardDataContext = createContext(null);

export function DashboardDataProvider({children}) {
  const clientsState = useClients();
  const portalState = usePortalUsers();
  const portalLeadsState = usePortalLeads();
  const collectionsState = useMiwillCollections();

  const notifications = useMemo(
    () => deriveNotificationsFromClients(clientsState.assignedUsers),
    [clientsState.assignedUsers],
  );

  const platformActivity = useMemo(
    () => derivePlatformActivity(collectionsState.activities, clientsState.assignedUsers),
    [collectionsState.activities, clientsState.assignedUsers],
  );

  const overviewStats = useMemo(
    () =>
      buildAdminOverviewStats(
        clientsState.willRows,
        portalLeadsState.leads,
        portalState.portalUsers,
        collectionsState.activities,
      ),
    [
      clientsState.willRows,
      portalLeadsState.leads,
      portalState.portalUsers,
      collectionsState.activities,
    ],
  );

  const agentPerformance = useMemo(
    () =>
      buildAgentPerformance(
        portalState.portalUsers,
        clientsState.willRows,
        portalLeadsState.leads,
        collectionsState.activities,
      ),
    [
      portalState.portalUsers,
      clientsState.willRows,
      portalLeadsState.leads,
      collectionsState.activities,
    ],
  );

  const agentViews = useMemo(
    () =>
      buildAgentViews(
        portalState.portalUsers,
        clientsState.willRows,
        portalLeadsState.leads,
        collectionsState.activities,
      ),
    [
      portalState.portalUsers,
      clientsState.willRows,
      portalLeadsState.leads,
      collectionsState.activities,
    ],
  );

  const value = useMemo(
    () => ({
      assignedUsers: clientsState.assignedUsers,
      willRows: clientsState.willRows,
      clientsLoading: clientsState.loading,
      clientsError: clientsState.error,
      appendClient: clientsState.appendClient,
      refetchClients: clientsState.refetch,
      portalUsers: portalState.portalUsers,
      portalLoading: portalState.loading,
      portalError: portalState.error,
      leads: portalLeadsState.leads,
      leadsLoading: portalLeadsState.loading,
      leadsError: portalLeadsState.error,
      appendLead: portalLeadsState.appendLead,
      refetchLeads: portalLeadsState.refetch,
      activities: collectionsState.activities,
      notes: collectionsState.notes,
      collectionsLoading: collectionsState.loading,
      collectionsError: collectionsState.error,
      notifications,
      platformActivity,
      overviewStats,
      agentPerformance,
      agentViews,
      refetchPortalUsers: portalState.refetch,
    }),
    [
      clientsState.assignedUsers,
      clientsState.willRows,
      clientsState.loading,
      clientsState.error,
      clientsState.appendClient,
      clientsState.refetch,
      portalState.portalUsers,
      portalState.loading,
      portalState.error,
      portalLeadsState.leads,
      portalLeadsState.loading,
      portalLeadsState.error,
      portalLeadsState.appendLead,
      portalLeadsState.refetch,
      collectionsState.activities,
      collectionsState.notes,
      collectionsState.loading,
      collectionsState.error,
      notifications,
      platformActivity,
      overviewStats,
      agentPerformance,
      agentViews,
      portalState.refetch,
    ],
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData must be used within DashboardDataProvider');
  }
  return context;
}
