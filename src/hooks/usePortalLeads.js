import {useEffect, useState} from 'react';
import {fetchPortalLeads} from '../services/leadsService';
import {isFirebaseConfigured} from '../firebase/client';

export function usePortalLeads() {
  const [reloadKey, setReloadKey] = useState(0);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLeads() {
      setLoading(true);
      setError(null);

      if (!isFirebaseConfigured) {
        if (!cancelled) {
          setLeads([]);
          setError('Portal Firebase is not configured.');
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchPortalLeads();

        if (!cancelled) {
          setLeads(data);
          setError(null);
        }
      } catch (err) {
        const code = err && typeof err === 'object' && 'code' in err ? err.code : null;
        console.error('usePortalLeads error:', code, err instanceof Error ? err.message : err);
        if (!cancelled) {
          if (import.meta.env.DEV && code === 'permission-denied') {
            setLeads([]);
            setError(null);
          } else {
            setError(err instanceof Error ? err.message : 'Unable to load leads.');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLeads();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function appendLead(lead) {
    setLeads((prev) => [lead, ...prev]);
  }

  function refetch() {
    setReloadKey((key) => key + 1);
  }

  return {leads, loading, error, appendLead, refetch};
}
