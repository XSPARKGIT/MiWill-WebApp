import {useCallback, useEffect, useMemo, useState} from 'react';
import {miwillAppProjectId, isMiwillAppConfigured} from '../firebase/miwillAppDb';
import {MOCK_ASSIGNED_USERS} from '../pages/agent-dashboard/mockData';
import {fetchMiwillClients} from '../services/miwillClientsService';
import {
  isAppClientRecord,
  mapFirestoreClientToAssignedUser,
  mapFirestoreClientToWillRow,
} from '../utils/firestoreMappers';

function devMockClientRecords() {
  return MOCK_ASSIGNED_USERS.map((user) => ({
    id: user.id,
    firstName: user.name.split(/\s+/)[0] ?? user.name,
    lastName: user.name.split(/\s+/).slice(1).join(' '),
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    idNumber: user.idNumber,
    willStatus: user.willStatus,
    profileCompletion: user.completeness,
    updatedAt: user.lastUpdated,
    createdAt: user.lastUpdated,
  }));
}

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useClients(options = {}) {
  const {enabled = true} = options;
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const appClients = useMemo(
    () => clients.filter((client) => isAppClientRecord(client)),
    [clients],
  );

  const assignedUsers = useMemo(
    () => appClients.map((client) => mapFirestoreClientToAssignedUser(client)),
    [appClients],
  );

  const willRows = useMemo(
    () => appClients.map((client) => mapFirestoreClientToWillRow(client)),
    [appClients],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchClients() {
      setLoading(true);
      setError(null);

      if (!isMiwillAppConfigured) {
        if (!cancelled) {
          setError('MiWill App Firebase is not configured. Add VITE_MIWILL_APP_* keys to your env.');
          setLoading(false);
        }
        return;
      }

      try {
        const merged = await fetchMiwillClients();

        if (!cancelled) {
          setClients(merged);
        }
      } catch (err) {
        console.error('useClients error:', err);
        if (!cancelled) {
          const code = err && typeof err === 'object' && 'code' in err ? err.code : null;
          if (import.meta.env.DEV && code === 'permission-denied') {
            console.warn(
              'useClients: Firestore rules blocked client reads. Showing dev mock data. ' +
                'Publish rules: npm run firebase:deploy:portal-rules then npm run seed:dev-clients',
            );
            setClients(devMockClientRecords());
            setError(null);
          } else if (code === 'permission-denied') {
            setError(
              `Permission denied reading clients from ${miwillAppProjectId ?? 'MiWill App'}. ` +
                'Publish Firestore rules for the MiWill App project.',
            );
          } else {
            setError(err instanceof Error ? err.message : 'Unable to load clients.');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchClients();

    return () => {
      cancelled = true;
    };
  }, [enabled, reloadKey]);

  const appendClient = useCallback((assignedUser) => {
    setClients((prev) => [
      ...prev,
      {
        id: assignedUser.id,
        firstName: assignedUser.name.split(/\s+/)[0] ?? assignedUser.name,
        lastName: assignedUser.name.split(/\s+/).slice(1).join(' '),
        email: assignedUser.email,
        phone: assignedUser.phone,
        dateOfBirth: assignedUser.dateOfBirth,
        idNumber: assignedUser.idNumber,
        willStatus: assignedUser.willStatus,
        profileCompletion: assignedUser.completeness,
        updatedAt: assignedUser.lastUpdated,
        createdAt: assignedUser.lastUpdated,
      },
    ]);
  }, []);

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  return {clients: appClients, assignedUsers, willRows, loading, error, appendClient, refetch};
}
