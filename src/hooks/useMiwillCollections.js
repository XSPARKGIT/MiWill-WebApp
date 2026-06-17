import {useEffect, useState} from 'react';
import {collection, getDocs} from 'firebase/firestore';
import {ensureMiwillAppAuth} from '../firebase/miwillAppAuth';
import {miwillDb} from '../firebase/miwillAppDb';
import {
  mapFirestoreActivity,
  mapFirestoreLead,
  mapFirestoreNote,
} from '../utils/firestoreMappers';

async function safeCollection(name) {
  if (!miwillDb) {
    return [];
  }

  try {
    await ensureMiwillAppAuth();
    const snap = await getDocs(collection(miwillDb, name));
    return snap.docs.map((docSnap) => ({id: docSnap.id, ...docSnap.data()}));
  } catch {
    return [];
  }
}

export function useMiwillCollections() {
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCollections() {
      setLoading(true);
      setError(null);

      try {
        const [leadDocs, activityDocs, noteDocs] = await Promise.all([
          safeCollection('leads'),
          safeCollection('activities'),
          safeCollection('notes'),
        ]);

        if (!cancelled) {
          setLeads(leadDocs.map((doc) => mapFirestoreLead(doc)));
          setActivities(
            activityDocs
              .map((doc) => mapFirestoreActivity(doc))
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          );
          setNotes(
            noteDocs
              .map((doc) => mapFirestoreNote(doc))
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCollections();

    return () => {
      cancelled = true;
    };
  }, []);

  return {leads, activities, notes, loading, error};
}
