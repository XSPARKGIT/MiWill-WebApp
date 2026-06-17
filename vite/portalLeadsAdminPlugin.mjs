import admin from 'firebase-admin';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const LEADS_COLLECTION = 'leads';

function loadServiceAccountFromEnv() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    return JSON.parse(json);
  }

  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (path) {
    return JSON.parse(readFileSync(resolve(path), 'utf8'));
  }

  return null;
}

function buildLeadDocument(input) {
  return {
    fullName: String(input.fullName ?? '').trim(),
    phone: String(input.phone ?? '').trim(),
    email: String(input.email ?? '').trim().toLowerCase(),
    pipeline: input.pipeline,
    brand: input.pipeline,
    stage: input.stage,
    source: String(input.source ?? '').trim(),
    notes: String(input.notes ?? '').trim(),
    assignedAgentId: String(input.assignedAgentId ?? ''),
    assignedAgentName: String(input.assignedAgentName ?? ''),
    createdBy: String(input.createdBy ?? ''),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true,
  };
}

function mapLeadRecord(id, data) {
  return {
    id,
    fullName: data.fullName ?? '',
    phone: data.phone ?? '',
    email: data.email ?? '',
    pipeline: data.pipeline ?? data.brand ?? 'miwill',
    brand: data.brand ?? data.pipeline ?? 'miwill',
    stage: data.stage ?? 'new',
    source: data.source ?? '',
    notes: data.notes ?? '',
    assignedAgentId: data.assignedAgentId ?? '',
    assignedAgentName: data.assignedAgentName ?? '',
    createdBy: data.createdBy ?? '',
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function portalLeadsAdminPlugin(projectId) {
  let db = null;
  let initError = null;

  function getDb() {
    if (db) {
      return db;
    }

    if (initError) {
      throw initError;
    }

    try {
      if (!admin.apps.length) {
        const serviceAccount = loadServiceAccountFromEnv();
        admin.initializeApp(
          serviceAccount
            ? {
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id ?? projectId,
              }
            : {
                credential: admin.credential.applicationDefault(),
                projectId,
              },
        );
      }

      db = admin.firestore();
      return db;
    } catch (error) {
      initError = error;
      throw error;
    }
  }

  async function readBody(req) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    if (chunks.length === 0) {
      return {};
    }

    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  }

  async function verifyRequest(req) {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      throw new Error('Missing Firebase ID token.');
    }

    await admin.auth().verifyIdToken(token);
  }

  return {
    name: 'portal-leads-admin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__portal/leads')) {
          next();
          return;
        }

        try {
          getDb();
          await verifyRequest(req);

          if (req.method === 'GET') {
            const snap = await getDb().collection(LEADS_COLLECTION).get();
            const leads = snap.docs.map((doc) => mapLeadRecord(doc.id, doc.data()));
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(leads));
            return;
          }

          if (req.method === 'POST') {
            const input = await readBody(req);
            const docRef = await getDb().collection(LEADS_COLLECTION).add(buildLeadDocument(input));
            const created = await docRef.get();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(mapLeadRecord(docRef.id, created.data() ?? {})));
            return;
          }

          res.statusCode = 405;
          res.end('Method not allowed');
        } catch (error) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Portal leads admin proxy unavailable.',
            }),
          );
        }
      });
    },
  };
}
