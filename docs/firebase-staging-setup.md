# Firebase staging setup

This project now includes Firebase client wiring, deploy config, and example
environment files. Use the steps below from your new staging Firebase project.

## From the Firebase console

1. In the staging project overview, click `Add app`.
2. Choose the web app icon.
3. Name it something like `miwill-web-staging`.
4. Copy the Firebase web config values into `.env.staging.local`.
5. In `Authentication`, enable the same providers as production.
6. Add staging-only authorized domains in `Authentication > Settings`.
7. Create Firestore or Realtime Database in the same region and mode as
   production.
8. Create the staging Storage bucket if production uses Storage.
9. Copy production rules logic into `firestore.rules` and `storage.rules`.
10. Copy production Firestore indexes into `firestore.indexes.json`.

## Rules guidance

- Yes, your staging rules should match production logic as closely as possible.
- No, project-specific values must not be identical. Keep project IDs, domains,
  secrets, and analytics separate.
- The safest workflow is one shared repo source for rules and indexes deployed
  to both environments.

## Local setup

1. Copy `.firebaserc.example` to `.firebaserc`.
2. Replace the placeholder project IDs with your real staging and production
   Firebase project IDs.
3. Copy `.env.staging.example` to `.env.staging.local`.
4. Copy `.env.production.example` to `.env.production.local`.
5. Paste the correct Firebase web app config values into each file.
6. Run `npm run firebase:validate:env -- .env.staging.local .env.production.local`.

## Run and deploy

- Start the staging app locally: `npm run dev:staging`
- Build the staging bundle: `npm run build:staging`
- Deploy hosting, Firestore rules/indexes, and Storage rules to staging:
  `npm run firebase:deploy:staging`
- Deploy the same shared config to production:
  `npm run firebase:deploy:production`

## What this app does with Firebase today

- Initializes the Firebase web app from `VITE_FIREBASE_*` env variables
- Initializes Analytics only when a measurement ID is present
- Saves landing-page waitlist submissions to Firestore when Firebase is
  configured
- Falls back to opening an email draft if Firebase is not configured yet

## Validation checklist

- Staging and production project IDs are different
- Staging and production auth domains are different
- Authentication behaves the same way in both environments
- Firestore and Storage rules come from the same repo files
- Staging analytics does not flow into production analytics
- Staging uses staging-only secrets and sandbox third-party services
