import {useEffect, useState} from 'react';
import {collection, getDocs} from 'firebase/firestore';
import {getPortalFirebaseDb} from '../firebase/client';
import {mapPortalUser} from '../utils/firestoreMappers';

export function usePortalUsers() {
  const [reloadKey, setReloadKey] = useState(0);
  const [portalUsers, setPortalUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPortalUsers() {
      setLoading(true);
      setError(null);

      const db = getPortalFirebaseDb();
      if (!db) {
        if (!cancelled) {
          setPortalUsers([]);
          setError('Portal Firebase is not configured.');
          setLoading(false);
        }
        return;
      }

      try {
        const snap = await getDocs(collection(db, 'users'));
        const staff = snap.docs
          .map((docSnap) => mapPortalUser(docSnap.id, docSnap.data()))
          .filter((user) => user.role === 'admin' || user.role === 'agent');

        if (!cancelled) {
          setPortalUsers(staff);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load portal users.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPortalUsers();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function refetch() {
    setReloadKey((key) => key + 1);
  }

  return {portalUsers, loading, error, refetch};
}
