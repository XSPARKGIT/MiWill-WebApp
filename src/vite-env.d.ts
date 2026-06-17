/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GEMINI_API_KEY?: string;
  readonly APP_URL?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_FIREBASE_APP_ENV?: 'local' | 'staging' | 'production';
  readonly VITE_FIREBASE_WAITLIST_COLLECTION?: string;
  readonly VITE_DEMO_LOGIN_PASSWORD?: string;
  readonly VITE_ADMIN_PIN?: string;
  readonly VITE_AGENT_PIN?: string;
  readonly VITE_MIWILL_APP_API_KEY?: string;
  readonly VITE_MIWILL_APP_AUTH_DOMAIN?: string;
  readonly VITE_MIWILL_APP_PROJECT_ID?: string;
  readonly VITE_MIWILL_APP_STORAGE_BUCKET?: string;
  readonly VITE_MIWILL_APP_MESSAGING_SENDER_ID?: string;
  readonly VITE_MIWILL_APP_APP_ID?: string;
  readonly VITE_MIWILL_APP_READER_EMAIL?: string;
  readonly VITE_MIWILL_APP_READER_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
