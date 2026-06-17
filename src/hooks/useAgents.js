import {useCallback, useEffect, useState} from 'react';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {getPortalFirebaseDb} from '../firebase/client';

export function useAgents() {
  const [reloadKey, setReloadKey] = useState(0);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAgents() {
      setLoading(true);
      setError(null);

      const db = getPortalFirebaseDb();
      if (!db) {
        if (!cancelled) {
          setAgents([]);
          setError('Portal Firebase is not configured.');
          setLoading(false);
        }
        return;
      }

      try {
        const q = query(collection(db, 'users'), where('role', '==', 'agent'));
        const snap = await getDocs(q);
        const data = snap.docs.map((docSnap) => ({id: docSnap.id, ...docSnap.data()}));
        if (!cancelled) {
          setAgents(data);
          setError(null);
        }
      } catch (err) {
        const code = err && typeof err === 'object' && 'code' in err ? err.code : null;
        const message = err instanceof Error ? err.message : 'Unable to load agents.';
        console.error('useAgents error:', code, message);
        if (!cancelled) {
          if (import.meta.env.DEV && code === 'permission-denied') {
            console.warn(
              'useAgents: Firestore rules blocked agent reads. Publish portal rules: npm run firebase:deploy:portal-rules',
            );
            setAgents([]);
            setError(null);
          } else {
            setError(message);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAgents();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const appendAgent = useCallback((agent) => {
    setAgents((prev) => [agent, ...prev]);
  }, []);

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  return {agents, loading, error, appendAgent, refetch};
}
