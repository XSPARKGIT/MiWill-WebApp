<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your MiWill web app

This project now includes Firebase client wiring for the landing-page waitlist,
shared Firebase deploy config, and example staging/production env files.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` if you only need local development
3. Add your `GEMINI_API_KEY`
4. Run the app: `npm run dev`

## Staging and production Firebase setup

1. Copy `.firebaserc.example` to `.firebaserc`
2. Copy `.env.staging.example` to `.env.staging.local`
3. Copy `.env.production.example` to `.env.production.local`
4. Paste the Firebase web app config values from each Firebase project
5. Validate separation:
   `npm run firebase:validate:env -- .env.staging.local .env.production.local`

## Useful scripts

- `npm run dev:staging`
- `npm run build:staging`
- `npm run build:production`
- `npm run firebase:deploy:staging`
- `npm run firebase:deploy:production`

## Documentation

- `docs/firebase-production-inventory.md`
- `docs/firebase-staging-setup.md`
