# Firebase production inventory

Use this checklist before you mirror production into staging. The goal is to
export the production behavior into version-controlled files so staging and
production are deployed from the same source of truth.

## Capture from production

- Firebase project ID and region choices
- Web app config values for the production site
- Enabled Authentication providers
- Authorized domains and OAuth redirect URLs
- Firestore rules
- Firestore indexes
- Realtime Database rules, if you use RTDB
- Storage rules
- Cloud Functions regions, triggers, and secrets
- App Check settings
- Analytics property/project mapping
- Any outbound integrations that can send emails, SMS, or payments

## Copy into this repo

- Put shared Firestore rules in `firestore.rules`
- Put shared Firestore indexes in `firestore.indexes.json`
- Put shared Storage rules in `storage.rules`
- Put staging and production project aliases in `.firebaserc`
- Put environment-specific web config in `.env.staging.local` and
  `.env.production.local`

## Match exactly

- Rules logic
- Index definitions
- Authentication providers
- Cloud Functions code and runtime shape
- Collection names and document structure

## Keep different on purpose

- Firebase project IDs
- Auth domains
- App Check app registrations
- Analytics properties
- API keys and secrets
- Third-party sandbox vs live credentials
- Any real production user data unless it has been sanitized first
