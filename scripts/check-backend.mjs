/**
 * Diagnose MiWill portal backend setup (Firebase, env, CLI auth).
 *
 * Usage: npm run backend:check
 */

import {existsSync, readFileSync} from 'node:fs';
import {execSync} from 'node:child_process';
import {resolve} from 'node:path';
import dotenv from 'dotenv';
import {GoogleAuth} from 'google-auth-library';

const root = resolve(import.meta.dirname, '..');
const envLocal = resolve(root, '.env.local');

function ok(label, detail = '') {
  console.log(`✓ ${label}${detail ? ` — ${detail}` : ''}`);
}

function warn(label, detail = '') {
  console.log(`⚠ ${label}${detail ? ` — ${detail}` : ''}`);
}

function fail(label, detail = '') {
  console.log(`✗ ${label}${detail ? ` — ${detail}` : ''}`);
}

function readEnv() {
  if (!existsSync(envLocal)) {
    fail('.env.local missing', 'copy .env.example → .env.local and fill Firebase keys');
    return null;
  }

  return dotenv.parse(readFileSync(envLocal, 'utf8'));
}

function hasCommand(cmd) {
  try {
    execSync(`command -v ${cmd}`, {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
}

async function checkGoogleAuth() {
  try {
    const auth = new GoogleAuth({scopes: ['https://www.googleapis.com/auth/cloud-platform']});
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    if (token.token) {
      ok('Google ADC credentials', 'dev proxy + gcloud rules deploy available');
      return true;
    }
  } catch {
    // fall through
  }

  warn(
    'Google ADC not configured',
    'run: gcloud auth application-default login (for dev leads proxy + npm run firebase:deploy:*:gcloud)',
  );
  return false;
}

async function main() {
  console.log('MiWill backend check\n');

  const nodeVersion = process.version;
  ok('Node.js', nodeVersion);

  const env = readEnv();
  if (!env) {
    process.exitCode = 1;
    return;
  }

  const portalProject = env.VITE_FIREBASE_PROJECT_ID ?? '(unset)';
  ok('Portal Firebase project', portalProject);

  const appProject =
    env.VITE_MIWILL_APP_PROJECT_ID?.trim() || env.VITE_FIREBASE_PROJECT_ID || '(unset)';
  if (env.VITE_MIWILL_APP_PROJECT_ID?.trim()) {
    ok('MiWill App Firebase project', appProject);
  } else {
    warn('MiWill App project', 'VITE_MIWILL_APP_* unset — client data uses portal project fallback');
  }

  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID',
  ];
  const missing = required.filter((key) => !env[key]?.trim());
  if (missing.length) {
    fail('Firebase env keys missing', missing.join(', '));
    process.exitCode = 1;
  } else {
    ok('Firebase env keys', 'portal config present');
  }

  for (const pkg of ['firebase', 'firebase-admin', 'firebase-tools']) {
    const pkgPath = resolve(root, 'node_modules', pkg, 'package.json');
    if (existsSync(pkgPath)) {
      const version = JSON.parse(readFileSync(pkgPath, 'utf8')).version;
      ok(`npm package ${pkg}`, `v${version}`);
    } else {
      fail(`npm package ${pkg}`, 'run: npm install');
      process.exitCode = 1;
    }
  }

  if (hasCommand('gcloud')) {
    ok('gcloud CLI', 'installed');
  } else {
    warn('gcloud CLI', 'optional — install Google Cloud SDK for ADC rules deploy');
  }

  try {
    const firebaseVersion = execSync('npx firebase-tools --version', {
      cwd: root,
      encoding: 'utf8',
    }).trim();
    ok('firebase-tools', `v${firebaseVersion}`);
  } catch {
    fail('firebase-tools', 'run: npm install');
    process.exitCode = 1;
  }

  try {
    execSync('npx firebase-tools projects:list', {cwd: root, stdio: 'ignore'});
    ok('Firebase CLI login', 'authenticated');
  } catch {
    warn('Firebase CLI login', 'run: npx firebase-tools login');
  }

  await checkGoogleAuth();

  console.log('\nNext steps to unblock Firestore reads/writes:');
  console.log('  1. npx firebase-tools login');
  console.log('  2. npm run firebase:deploy:portal-rules        # miwill-dev');
  console.log('  3. npm run firebase:deploy:miwillapp-rules     # miwillapp (production clients)');
  console.log('  4. npm run dev');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
