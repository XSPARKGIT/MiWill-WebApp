/**
 * Deploy Firestore rules via Google Application Default Credentials.
 *
 * Usage:
 *   node scripts/deploy-firestore-rules.mjs staging firestore.rules
 *   node scripts/deploy-firestore-rules.mjs production firestore.miwillapp.rules
 *
 * Prerequisite (one-time):
 *   gcloud auth application-default login
 *   OR firebase login
 */

import {readFileSync} from 'node:fs';
import {GoogleAuth} from 'google-auth-library';

const PROJECTS = {
  staging: 'miwill-dev',
  production: 'miwillapp',
};

const target = process.argv[2] ?? 'staging';
const rulesFile = process.argv[3] ?? (target === 'production' ? 'firestore.miwillapp.rules' : 'firestore.rules');
const projectId = PROJECTS[target];

if (!projectId) {
  console.error(`Unknown target "${target}". Use: staging | production`);
  process.exit(1);
}

const rulesSource = readFileSync(rulesFile, 'utf8');

async function deploy() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const headers = {
    Authorization: `Bearer ${await client.getAccessToken().then((t) => t.token)}`,
    'Content-Type': 'application/json',
  };

  const createRes = await fetch(`https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source: {
        files: [{name: 'firestore.rules', content: rulesSource}],
      },
    }),
  });

  const createBody = await createRes.json();
  if (!createRes.ok) {
    throw new Error(createBody.error?.message ?? `Failed to create ruleset (${createRes.status})`);
  }

  const rulesetName = createBody.name;
  const releaseRes = await fetch(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: `projects/${projectId}/releases/cloud.firestore`,
      rulesetName,
    }),
  });

  const releaseBody = await releaseRes.json();
  if (!releaseRes.ok) {
    throw new Error(releaseBody.error?.message ?? `Failed to publish release (${releaseRes.status})`);
  }

  console.log(`Published ${rulesFile} to ${projectId}`);
  console.log(releaseBody.name ?? 'cloud.firestore');
}

deploy().catch((error) => {
  console.error('Deploy failed:', error.message);
  console.error('Try: gcloud auth application-default login');
  console.error('Or: firebase login && npm run firebase:deploy:miwillapp-rules');
  process.exit(1);
});
