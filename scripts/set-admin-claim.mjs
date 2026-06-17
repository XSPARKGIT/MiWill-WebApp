/**
 * Set Firebase Auth custom claim { role: "admin" } for a portal admin user.
 *
 * Usage:
 *   node scripts/set-admin-claim.mjs user@example.com
 *
 * Prerequisite:
 *   GOOGLE_APPLICATION_CREDENTIALS or firebase login with admin access
 */

import {initializeApp, cert, applicationDefault} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {readFileSync} from 'node:fs';

const email = process.argv[2]?.trim();
const projectId = process.env.FIREBASE_PROJECT_ID ?? 'miwill-dev';

if (!email) {
  console.error('Usage: node scripts/set-admin-claim.mjs <admin-email>');
  process.exit(1);
}

function initAdmin() {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (serviceAccountPath) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id ?? projectId,
    });
    return;
  }

  initializeApp({
    credential: applicationDefault(),
    projectId,
  });
}

initAdmin();

const auth = getAuth();
const user = await auth.getUserByEmail(email);
const existingClaims = user.customClaims ?? {};

await auth.setCustomUserClaims(user.uid, {
  ...existingClaims,
  role: 'admin',
});

console.log(`Set admin custom claim for ${email} (${user.uid})`);
