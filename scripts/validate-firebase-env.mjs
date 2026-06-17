import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_APP_ENV',
];

function readEnvFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing env file: ${absolutePath}`);
  }

  return {
    absolutePath,
    values: dotenv.parse(fs.readFileSync(absolutePath)),
  };
}

function assertRequiredKeys(envName, filePath, values) {
  const missing = REQUIRED_KEYS.filter((key) => !values[key]);

  if (missing.length > 0) {
    throw new Error(
      `${envName} env file ${filePath} is missing: ${missing.join(', ')}`,
    );
  }
}

function assertAppEnv(envName, expected, actual, filePath) {
  if (actual !== expected) {
    throw new Error(
      `${envName} env file ${filePath} must set VITE_FIREBASE_APP_ENV=${expected}`,
    );
  }
}

const stagingFile = process.argv[2] ?? '.env.staging.local';
const productionFile = process.argv[3] ?? '.env.production.local';

const staging = readEnvFile(stagingFile);
const production = readEnvFile(productionFile);

assertRequiredKeys('Staging', staging.absolutePath, staging.values);
assertRequiredKeys('Production', production.absolutePath, production.values);
assertAppEnv('Staging', 'staging', staging.values.VITE_FIREBASE_APP_ENV, staging.absolutePath);
assertAppEnv(
  'Production',
  'production',
  production.values.VITE_FIREBASE_APP_ENV,
  production.absolutePath,
);

if (staging.values.VITE_FIREBASE_PROJECT_ID === production.values.VITE_FIREBASE_PROJECT_ID) {
  throw new Error('Staging and production Firebase project IDs must be different.');
}

if (staging.values.VITE_FIREBASE_AUTH_DOMAIN === production.values.VITE_FIREBASE_AUTH_DOMAIN) {
  throw new Error('Staging and production Firebase auth domains must be different.');
}

console.log(`Validated Firebase env separation for:
- ${staging.absolutePath}
- ${production.absolutePath}`);
